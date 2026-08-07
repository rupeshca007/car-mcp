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
  .card-box {
      background: rgba(22, 30, 49, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 1.2rem;
      margin-bottom: 1rem;
  }
  .score-badge {
      background: #10b981;
      color: #ffffff;
      font-weight: 700;
      padding: 0.2rem 0.6rem;
      border-radius: 6px;
      font-size: 0.85rem;
  }
  .booking-confirm {
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid #10b981;
      border-radius: 10px;
      padding: 1rem;
      color: #f8fafc;
  }
</style>
""", unsafe_allow_html=True)

BACKEND_URL = os.environ.get("BACKEND_URL", "http://localhost:4000")

# Header Section
st.markdown('<h1 class="main-header">🚗 AI Vehicle Advisor & Buying Agent</h1>', unsafe_allow_html=True)
st.caption("Powered by MCP Protocol, Gemini 2.5 AI, and Real-Time Automotive Analytics")

# Sidebar: Match Score & Test Drive Widgets
with st.sidebar:
    st.image("https://www.auto-data.net/img/no.jpg", width=120)
    st.title("Autonomous Tools")

    # 1. Personalized Match Score Widget
    st.subheader("🎯 Car Compatibility Match")
    use_case = st.selectbox(
        "Primary Driving Use Case",
        ["Daily City Commuting", "Off-road / Mountain Driving", "Family Trips & Group Comfort", "Eco / EV Driving"]
    )
    family_size = st.slider("Family Members", 1, 7, 4)
    max_budget_lakhs = st.slider("Max Budget (₹ Lakhs)", 5, 80, 20)

    if st.button("Calculate Top Match Scores"):
        with st.spinner("Calculating compatibility scores..."):
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
                st.error(f"Error connecting to backend: {e}")

    st.divider()

    # 2. Dealership Test Drive Booking Widget
    st.subheader("📝 Book Dealership Test Drive")
    with st.form("test_drive_form"):
        td_model = st.text_input("Car Model", value="Hyundai Creta")
        td_name = st.text_input("Customer Full Name", value="Rupesh Kumar")
        td_phone = st.text_input("Phone Number", value="9876543210")
        td_pincode = st.text_input("Area Pincode", value="560001")
        td_date = st.date_input("Preferred Date")
        td_slot = st.selectbox("Preferred Slot", ["Morning (9 AM - 12 PM)", "Afternoon (12 PM - 4 PM)", "Evening (4 PM - 7 PM)"])

        submit_td = st.form_submit_on_button = st.form_submit_button("Book Test Drive Now")
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
                    st.markdown(f"""
                    <div class="booking-confirm">
                      <h4>✅ Test Drive Confirmed!</h4>
                      <p><strong>Booking Ref</strong>: <code>{booking['bookingId']}</code></p>
                      <p><strong>Vehicle</strong>: {booking['vehicleRequested']}</p>
                      <p><strong>Slot</strong>: {booking['appointmentSlot']}</p>
                      <p><strong>Assigned Dealer</strong>: {booking['assignedDealership']}</p>
                    </div>
                    """, unsafe_allow_html=True)
                else:
                    st.error("Failed to submit test drive request.")
            except Exception as e:
                st.error(f"Error connecting to backend: {e}")

# Main Chat Interface
st.subheader("💬 Ask AI Vehicle Advisor")

# Quick prompt chips
col1, col2, col3 = st.columns(3)
with col1:
    if st.button("⛰️ Best SUV for mountains"):
        st.session_state["user_prompt"] = "Which SUV is best for mountain driving and rough roads under 25 Lakhs?"
with col2:
    if st.button("🚗 Compare Creta vs Nexon"):
        st.session_state["user_prompt"] = "Compare Creta vs Nexon side by side"
with col3:
    if st.button("⚡ EV Savings Calculator"):
        st.session_state["user_prompt"] = "Show EV savings if I drive 60 km daily"

if "messages" not in st.session_state:
    st.session_state.messages = [
        {"role": "assistant", "content": "Hello! I am your AI Vehicle Advisor. Ask me anything about vehicle recommendations, side-by-side spec comparisons, loan EMIs, or EV savings!"}
    ]

# Display message history
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# Chat input
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
