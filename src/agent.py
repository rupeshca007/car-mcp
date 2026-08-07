import asyncio
import os
import sys
import json
import dotenv
from google import genai
from google.genai import types
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

# Load environment variables from .env file
dotenv.load_dotenv()

# Define MCP server connection parameters (points to compiled Node server)
server_params = StdioServerParameters(
    command="node",
    args=[os.path.abspath(os.path.join(os.path.dirname(__file__), "../dist/index.js"))]
)

async def main():
    # Load API key from environment
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("\n[Error] GEMINI_API_KEY environment variable is not set.")
        print("Please export your API key in your terminal first:")
        print("  export GEMINI_API_KEY=\"your_key_here\"\n")
        sys.exit(1)

    # Initialize Gemini Client
    client = genai.Client(api_key=api_key)

    print("[AI Agent] Spawning local Node.js MCP server and connecting via Stdio...")
    
    try:
        async with stdio_client(server_params) as (read_stream, write_stream):
            async with ClientSession(read_stream, write_stream) as session:
                await session.initialize()
                print("[AI Agent] MCP Server connected and initialized successfully!")
                
                print("\n=======================================================")
                print("       AUTONOMOUS VEHICLE ADVISOR & BUYING AGENT")
                print("=======================================================")
                print("Ask a question like: 'Find cars around 180 HP under 20 Lakhs'")
                print("Type 'exit' or 'quit' to end the session.")
                print("=======================================================")
                
                while True:
                    user_query = input("\nQuery: ")
                    if user_query.lower() in ["exit", "quit", "q"]:
                        print("Goodbye!")
                        break
                    
                    if not user_query.strip():
                        continue

                    # Prompt user for their use case
                    print("\nSelect your primary Use Case:")
                    print("  1. Daily city commuting (focus on size, efficiency, Hatchback/Sedans)")
                    print("  2. Rough roads and offroad driving (focus on AWD, 4x4, SUV)")
                    print("  3. Family trips and group comfort (focus on spacing, Minivan/Large SUV)")
                    print("  4. Eco-friendly driving (focus on Electric Vehicles / EV)")
                    print("  5. General / Any")
                    use_case_choice = input("Choice (1-5): ")

                    use_case = "General / Any"
                    if use_case_choice == "1":
                        use_case = "Daily city commuting (focus on size, efficiency, Hatchback/Sedans)"
                    elif use_case_choice == "2":
                        use_case = "Rough roads and offroad mountain driving (focus on AWD, 4x4, SUV)"
                    elif use_case_choice == "3":
                        use_case = "Family trips and group comfort (focus on spacing, Minivan/Large SUV)"
                    elif use_case_choice == "4":
                        use_case = "Eco-friendly driving (focus on Electric Vehicles / EV, battery)"
                    elif use_case_choice.strip() != "":
                        use_case = use_case_choice  # let them type their own if they want

                    print(f"\n[AI Agent] Selected Use Case: {use_case}")
                    print("AI: Thinking...")

                    # Define the tool metadata for Gemini
                    compare_cars_tool = types.FunctionDeclaration(
                        name="compare_cars",
                        description="Compare and filter cars from MG, Hyundai, and Suzuki by target horsepower and maximum budget. Concurrently pulls real data, extracts specs and images, and returns sorted lists.",
                        parameters=types.Schema(
                            type=types.Type.OBJECT,
                            properties={
                                "horsepower": types.Schema(
                                    type=types.Type.INTEGER,
                                    description="Target horsepower (e.g. 200). Matches cars around this value (+/- 15% tolerance)."
                                ),
                                "budget": types.Schema(
                                    type=types.Type.INTEGER,
                                    description="Maximum budget in INR (e.g. 2000000 for ₹20 Lakh)."
                                ),
                                "sortBy": types.Schema(
                                    type=types.Type.STRING,
                                    description="Field to sort the results by: 'price' or 'horsepower' (default: 'price')."
                                ),
                                "sortOrder": types.Schema(
                                    type=types.Type.STRING,
                                    description="Sort order: 'asc' or 'desc' (default: 'asc')."
                                )
                            }
                        )
                    )

                    system_instruction = (
                        "You are an expert car buying advisor. Analyze the JSON results returned by the compare_cars tool.\n"
                        "Based on the user's primary use case, select the SINGLE BEST vehicle from the results as your top recommendation.\n"
                        "Justify your selection using the technical specifications and drivetrain/body type details returned by the tool.\n"
                        "Mention the name of the car, its price, horsepower, details, and its image URL so the user has the link.\n"
                        "If no cars match the criteria, suggest what adjustments the user can make."
                    )

                    try:
                        # 1. Send query to Gemini with tools and system instruction configured
                        response = client.models.generate_content(
                            model='gemini-2.5-flash',
                            contents=f"Query: {user_query}. User Use-case: {use_case}",
                            config=types.GenerateContentConfig(
                                system_instruction=system_instruction,
                                tools=[types.Tool(function_declarations=[compare_cars_tool])],
                                temperature=0.3
                            )
                        )

                        # 2. Check if Gemini decided to call our MCP tool
                        if response.function_calls:
                            for call in response.function_calls:
                                print(f"  └─► [LLM triggered tool: '{call.name}'] with arguments: {dict(call.args)}")
                                
                                # Convert arguments to appropriate format
                                args = dict(call.args)
                                if "horsepower" in args:
                                    args["horsepower"] = int(args["horsepower"])
                                if "budget" in args:
                                    args["budget"] = int(args["budget"])

                                # Execute the tool via the active MCP session
                                mcp_response = await session.call_tool(call.name, args)
                                tool_result = mcp_response.content[0].text
                                
                                # Show diagnostic trace of results count
                                try:
                                    parsed = json.loads(tool_result)
                                    count = len(parsed.get("cars", []))
                                    print(f"  └─► [MCP Server Response] Found {count} matching cars.")
                                except Exception:
                                    pass
                                
                                # 3. Send the function response back to Gemini to get the final natural language answer
                                print("AI: Formatting final response...")
                                final_response = client.models.generate_content(
                                    model='gemini-2.5-flash',
                                    contents=[
                                        types.Content(role="user", parts=[types.Part.from_text(text=f"Query: {user_query}. User Use-case: {use_case}")]),
                                        response.candidates[0].content,
                                        types.Content(role="tool", parts=[
                                            types.Part.from_function_response(
                                                name=call.name,
                                                response={"result": tool_result}
                                            )
                                        ])
                                    ],
                                    config=types.GenerateContentConfig(
                                        system_instruction=system_instruction
                                    )
                                )
                                print(f"\nAI:\n{final_response.text}")
                        else:
                            # If no tool call was needed, just print the direct text
                            print(f"\nAI:\n{response.text}")
                            
                    except Exception as e:
                        print(f"\n[Error during query processing]: {str(e)}")
                        
    except Exception as e:
        print(f"\n[Fatal Error]: Failed to start or communicate with the MCP server: {str(e)}")
        print("Please check that you compiled the project using: npm run build")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nGoodbye!")
