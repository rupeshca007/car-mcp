import asyncio
import os
import sys
import json
import dotenv
from google import genai
from google.genai import types
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

dotenv.load_dotenv()

server_params = StdioServerParameters(
    command="node",
    args=[os.path.abspath(os.path.join(os.path.dirname(__file__), "../dist/index.js"))]
)

async def main():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("\n[Error] GEMINI_API_KEY environment variable is not set.")
        print("Please export your API key in your terminal first:")
        print("  export GEMINI_API_KEY=\"your_key_here\"\n")
        sys.exit(1)

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
                print("Ask a question like:")
                print(" - 'What is the on-road price of Hyundai Creta in Bangalore?'")
                print(" - 'Check dealer inventory for Creta in pincode 560001'")
                print(" - 'Estimate trade-in value for my 2019 Swift driven 55,000 km'")
                print(" - 'Compare Creta vs Nexon vs Seltos side by side'")
                print("Type 'exit' or 'quit' to end the session.")
                print("=======================================================")
                
                while True:
                    user_query = input("\nQuery: ")
                    if user_query.lower() in ["exit", "quit", "q"]:
                        print("Goodbye!")
                        break
                    
                    if not user_query.strip():
                        continue

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
                        use_case = use_case_choice

                    print(f"\n[AI Agent] Selected Use Case: {use_case}")
                    print("AI: Thinking...")

                    # Function declarations for MCP tools
                    compare_cars_tool = types.FunctionDeclaration(
                        name="compare_cars",
                        description="Compare and filter cars across 10 major brands by horsepower and maximum budget.",
                        parameters=types.Schema(
                            type=types.Type.OBJECT,
                            properties={
                                "horsepower": types.Schema(type=types.Type.INTEGER, description="Target horsepower (e.g. 180)."),
                                "budget": types.Schema(type=types.Type.INTEGER, description="Maximum budget in INR (e.g. 2000000)."),
                                "sortBy": types.Schema(type=types.Type.STRING, description="Sort field: 'price' or 'horsepower'."),
                                "sortOrder": types.Schema(type=types.Type.STRING, description="Sort order: 'asc' or 'desc'.")
                            }
                        )
                    )

                    compare_spec_sheet_tool = types.FunctionDeclaration(
                        name="compare_spec_sheet",
                        description="Generates a side-by-side technical specification matrix for 2 to 4 specific car models.",
                        parameters=types.Schema(
                            type=types.Type.OBJECT,
                            properties={
                                "models": types.Schema(
                                    type=types.Type.ARRAY,
                                    items=types.Schema(type=types.Type.STRING),
                                    description="List of 2-4 car model names to compare (e.g. ['Creta', 'Nexon'])."
                                )
                            },
                            required=["models"]
                        )
                    )

                    get_on_road_price_tool = types.FunctionDeclaration(
                        name="get_on_road_price",
                        description="Calculates exact city On-Road Price breakdown (Ex-showroom, RTO Tax, Insurance, Fastag, TCS).",
                        parameters=types.Schema(
                            type=types.Type.OBJECT,
                            properties={
                                "carPrice": types.Schema(type=types.Type.INTEGER, description="Ex-showroom price in INR."),
                                "city": types.Schema(type=types.Type.STRING, description="Target city (e.g. Bangalore, Delhi, Mumbai)."),
                                "fuelType": types.Schema(type=types.Type.STRING, description="Fuel type (Petrol, Diesel, Electric, Hybrid).")
                            },
                            required=["carPrice", "city"]
                        )
                    )

                    check_dealer_inventory_tool = types.FunctionDeclaration(
                        name="check_dealer_inventory",
                        description="Checks ready stock availability and waiting period by pincode.",
                        parameters=types.Schema(
                            type=types.Type.OBJECT,
                            properties={
                                "carModel": types.Schema(type=types.Type.STRING, description="Vehicle model."),
                                "pincode": types.Schema(type=types.Type.STRING, description="Area pincode.")
                            },
                            required=["carModel", "pincode"]
                        )
                    )

                    estimate_trade_in_value_tool = types.FunctionDeclaration(
                        name="estimate_trade_in_value",
                        description="Estimates current resale / trade-in value of an old vehicle.",
                        parameters=types.Schema(
                            type=types.Type.OBJECT,
                            properties={
                                "currentCarModel": types.Schema(type=types.Type.STRING, description="Current car model."),
                                "purchaseYear": types.Schema(type=types.Type.INTEGER, description="Year of purchase."),
                                "odometerKm": types.Schema(type=types.Type.INTEGER, description="Odometer reading in km."),
                                "condition": types.Schema(type=types.Type.STRING, description="Condition: Excellent, Good, Fair.")
                            },
                            required=["currentCarModel", "purchaseYear", "odometerKm"]
                        )
                    )

                    system_instruction = (
                        "You are an expert automotive analyst and vehicle buying advisor.\n"
                        "Utilize the appropriate MCP tool based on user query.\n"
                        "Synthesize the JSON response into a clear, professional, well-formatted Markdown summary with recommendation highlights and bullet points."
                    )

                    try:
                        tools_list = [types.Tool(function_declarations=[
                            compare_cars_tool,
                            compare_spec_sheet_tool,
                            get_on_road_price_tool,
                            check_dealer_inventory_tool,
                            estimate_trade_in_value_tool
                        ])]

                        response = client.models.generate_content(
                            model='gemini-2.5-flash',
                            contents=f"Query: {user_query}. User Use-case: {use_case}",
                            config=types.GenerateContentConfig(
                                system_instruction=system_instruction,
                                tools=tools_list,
                                temperature=0.3
                            )
                        )

                        if response.function_calls:
                            for call in response.function_calls:
                                print(f"  └─► [LLM triggered tool: '{call.name}'] with arguments: {dict(call.args)}")
                                args = dict(call.args)

                                mcp_response = await session.call_tool(call.name, args)
                                tool_result = mcp_response.content[0].text
                                
                                print("AI: Formatting final analysis...")
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
