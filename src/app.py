import streamlit as st
import requests
import json
import os
import dotenv

dotenv.load_dotenv()

st.set_page_config(
    page_title="AI Vehicle Advisor & Autonomous Buying Agent",
    page_icon="🚗",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS styling for dark automotive theme
st.markdown("""
<style>
  .stApp {
      background-color: #0b0f19;
      color: #f8fafc;
  }
  .main-header {
      font-family: 'Outfit', sans-serif;
      font-size: 2.2rem;
      font-weight: 800;
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
  }
  .score-badge {
      background: #10b981;
      color: #ffffff;
      font-weight: 700;
      padding: 0.2rem 0.6rem;
      border-radius: 6px;
      font-size: 0.85rem;
  }
  .price-box {
      background: rgba(59, 130, 246, 0.15);
      border: 1px solid #3b82f6;
      border-radius: 10px;
      padding: 0.8rem;
      margin-top: 0.5rem;
  }
</style>
""", unsafe_allow_html=True)

BACKEND_URL = os.environ.get("BACKEND_URL", "http://localhost:4000")

# Header Section
st.markdown('<h1 class="main-header">🚗 AI Vehicle Advisor & Buying Agent</h1>', unsafe_allow_html=True)
st.caption("Powered by MCP Protocol, Gemini 2.5 AI, and Real-Time Automotive Analytics")

# Sidebar Widgets
with st.sidebar:
    st.image("https://www.auto-data.net/img/no.jpg", width=120)
    st.title("Autonomous Tools")

    tab1, tab2, tab3 = st.tabs(["🎯 Match Score", "🏙️ On-Road Price", "💵 Trade-In Value"])

    with tab1:
        use_case = st.selectbox(
            "Driving Use Case",
            ["Daily City Commuting", "Off-road / Mountain Driving", "Family Trips & Group Comfort", "Eco / EV Driving"]
        )
        family_size = st.slider("Family Members", 1, 7, 4)
        max_budget_lakhs = st.slider("Max Budget (₹ Lakhs)", 5, 80, 20)

        if st.button("Calculate Match Scores"):
            with st.spinner("Calculating compatibility..."):
                try:
                    res = requests.get(f"{BACKEND_URL}/api/match-score", params={
                        "useCase": use_case,
                        "familySize": family_size,
                        "maxBudget": max_budget_lakhs * 100000
                    })
                    if res.status_code == 200:
                        data = res.json()
                        st.success("Top Matching Vehicles:")
                        for car in data.get("scoredVehicles", [])[:4]:
                            st.markdown(f"**{car['company']} {car['model']}** — <span class='score-badge'>{car['matchScorePercent']}</span>", unsafe_allow_html=True)
                            st.progress(car['scoreValue'] / 100)
                            st.caption(f"Price: {car['formattedPrice']} | Power: {car['horsepower']} HP | {car['mileage']}")
                    else:
                        st.error("Failed to calculate match score.")
                except Exception as e:
                    st.error(f"Error: {e}")

    with tab2:
        car_price_input = st.number_input("Ex-Showroom Price (INR)", min_value=300000, value=1500000, step=50000)
        target_city = st.selectbox("Select Target City", ["Bangalore", "Delhi", "Mumbai", "Hyderabad", "Chennai", "Kolkata", "Pune"])
        target_fuel = st.selectbox("Engine Fuel Type", ["Petrol", "Diesel", "Electric", "Hybrid"])

        if st.button("Calculate City On-Road Price"):
            try:
                res = requests.get(f"{BACKEND_URL}/api/on-road-price", params={
                    "carPrice": car_price_input,
                    "city": target_city,
                    "fuelType": target_fuel
                })
                if res.status_code == 200:
                    data = res.json()
                    st.markdown(f"""
                    <div class="price-box">
                      <h4>🏙️ On-Road Price: {data['totalOnRoadPrice']}</h4>
                      <p><strong>RTO Road Tax</strong>: {data['rtoRoadTax']}</p>
                      <p><strong>Insurance</strong>: {data['insuranceComprehensive']}</p>
                      <p><strong>Fastag & Reg</strong>: {data['registrationAndFastag']}</p>
                      <p><strong>TCS Tax</strong>: {data['tcsTax']}</p>
                    </div>
                    """, unsafe_allow_html=True)
                else:
                    st.error("Failed to fetch on-road price.")
            except Exception as e:
                st.error(f"Error: {e}")

    with tab3:
        old_model = st.text_input("Old Car Model", value="2019 Maruti Swift")
        old_year = st.number_input("Purchase Year", min_value=2008, max_value=2026, value=2019)
        old_km = st.number_input("Odometer (km)", min_value=1000, value=55000, step=5000)
        old_cond = st.selectbox("Vehicle Condition", ["Excellent", "Good", "Fair"])

        if st.button("Estimate Trade-In Value"):
            try:
                res = requests.get(f"{BACKEND_URL}/api/trade-in-value", params={
                    "currentCarModel": old_model,
                    "purchaseYear": old_year,
                    "odometerKm": old_km,
                    "condition": old_cond
                })
                if res.status_code == 200:
                    data = res.json()
                    st.success(f"Estimated Resale Value: {data['estimatedResaleValuation']}")
                    st.info(data['downPaymentCredit'])
                else:
                    st.error("Failed to estimate trade-in value.")
            except Exception as e:
                st.error(f"Error: {e}")

    st.divider()

    # Dealership Test Drive Booking Form
    st.subheader("📝 Book Dealership Test Drive")
    with st.form("test_drive_form"):
        td_model = st.text_input("Car Model", value="Hyundai Creta")
        td_name = st.text_input("Customer Full Name", value="Rupesh Kumar")
        td_phone = st.text_input("Phone Number", value="9876543210")
        td_pincode = st.text_input("Area Pincode", value="560001")
        td_date = st.date_input("Preferred Date")
        td_slot = st.selectbox("Preferred Slot", ["Morning (9 AM - 12 PM)", "Afternoon (12 PM - 4 PM)", "Evening (4 PM - 7 PM)"])

        submit_td = st.form_submit_button("Book Test Drive Now")
        if submit_td:
            try:
                res = requests.post(f"{BACKEND_URL}/api/book-test-drive", json={
                    "carModel": td_model,
                    "customerName": td_name,
                    "customerPhone": td_phone,
                    "pincode": td_pincode,
                    "preferredDate": str(td_date),
                    "timeSlot": td_slot
                })
                if res.status_code == 200:
                    booking = res.json()
                    st.success(f"Confirmed! Booking Ref: {booking['bookingId']} at {booking['assignedDealership']}")
                else:
                    st.error("Failed to submit test drive request.")
            except Exception as e:
                st.error(f"Error: {e}")

# Main Chat Interface
st.subheader("💬 Ask AI Vehicle Advisor")

col1, col2, col3 = st.columns(3)
with col1:
    if st.button("🏙️ On-Road Price in Bangalore"):
        st.session_state["user_prompt"] = "What is the on road price of Hyundai Creta in Bangalore?"
with col2:
    if st.button("💵 Trade-in value of 2018 Swift"):
        st.session_state["user_prompt"] = "Estimate trade-in value for my 2018 Swift driven 60,000 km"
with col3:
    if st.button("📍 Check Creta stock in 560001"):
        st.session_state["user_prompt"] = "Check dealer inventory and waiting period for Creta in pincode 560001"

if "messages" not in st.session_state:
    st.session_state.messages = [
        {"role": "assistant", "content": "Hello! I am your AI Vehicle Advisor. Ask me anything about vehicle recommendations, city on-road prices, dealer stock, trade-in valuations, loan EMIs, or EV savings!"}
    ]

for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

prompt = st.chat_input("Ask a question or click a prompt above...")
if "user_prompt" in st.session_state and st.session_state["user_prompt"]:
    prompt = st.session_state.pop("user_prompt")

if prompt:
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    with st.chat_message("assistant"):
        with st.spinner("AI Thinking & Querying MCP Tools..."):
            try:
                res = requests.post(f"{BACKEND_URL}/api/ai-chat", json={"prompt": prompt})
                if res.status_code == 200:
                    reply = res.json().get("reply", "No reply received.")
                    st.markdown(reply)
                    st.session_state.messages.append({"role": "assistant", "content": reply})
                else:
                    st.error("Failed to connect to AI Advisor backend.")
            except Exception as e:
                st.error(f"Error: {e}")
