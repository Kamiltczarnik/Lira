from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv
import os
import httpx

# Load environment variables
load_dotenv()

NESSIE_API_KEY = os.getenv("NESSIE_API_KEY")
NESSIE_BASE_URL = "http://api.nessieisreal.com"  # Adjust if needed

if not NESSIE_API_KEY:
    raise ValueError("NESSIE_API_KEY is missing from .env")

# ---------------------------
# Models
# ---------------------------
# Updated SignupData: street is a single field and city, state, zip are separate.
class SignupData(BaseModel):
    first_name: str
    last_name: str
    username: str
    password: str
    street: str  # e.g., "1234 Main Street"
    city: str
    state: str
    zip: str

class LoginData(BaseModel):
    username: str
    password: str

class Account(BaseModel):
    id: str
    type: str
    nickname: Optional[str] = ""
    balance: float
    rewards: Optional[int] = 0
    account_number: Optional[str] = ""

class Transaction(BaseModel):
    transaction_id: str
    type: str
    merchant_name: Optional[str] = ""
    amount: float
    date: str
    description: Optional[str] = ""

class UserData(BaseModel):
    customer_id: str
    first_name: str
    last_name: str
    accounts: List[Account]
    transactions: List[Transaction]

# ---------------------------
# Helper Function to Parse Street
# ---------------------------
def parse_street(street_str: str) -> dict:
    """
    Expects street in the format:
    "1234 Main Street"
    Splits into street_number and street_name.
    """
    parts = street_str.strip().split(" ", 1)
    if len(parts) != 2:
        raise HTTPException(status_code=400, detail="Street must be in the format 'Number Street Name'")
    return {
        "street_number": parts[0],
        "street_name": parts[1]
    }

# ---------------------------
# FastAPI App & CORS
# ---------------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust as needed for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "AI Banking Advisor & Nessie Backend Active"}

# ---------------------------
# Signup Endpoint
# ---------------------------
@app.post("/api/signup")
async def signup(signup_data: SignupData):
    print("Received signup data:")
    print(signup_data.json())

    # Parse the street input into street_number and street_name
    parsed_street = parse_street(signup_data.street)
    print("Parsed street:", parsed_street)

    # Build the nested address payload using the parsed street and the other fields
    address_payload = {
        "street_number": parsed_street["street_number"],
        "street_name": parsed_street["street_name"],
        "city": signup_data.city,
        "state": signup_data.state,
        "zip": signup_data.zip
    }
    print("Final address payload:", address_payload)

    # Build the customer payload (omitting username/password for Nessie)
    customer_payload = {
        "first_name": signup_data.first_name,
        "last_name": signup_data.last_name,
        "address": address_payload
    }
    print("Sending customer payload to Nessie API:")
    print(customer_payload)

    async with httpx.AsyncClient() as client:
        customer_response = await client.post(
            f"{NESSIE_API_KEY and NESSIE_API_KEY and NESSIE_BASE_URL}/customers?key={NESSIE_API_KEY}", 
            json=customer_payload
        )

    print("Customer response status:", customer_response.status_code)
    print("Customer response body:", customer_response.text)

    if customer_response.status_code != 201:
        raise HTTPException(status_code=500, detail=f"Failed to create customer: {customer_response.text}")

    customer = customer_response.json()
    customer_created = customer["objectCreated"]
    customer_id = customer_created["_id"]

    print("Created customer with ID:", customer_id)

    # Create a default Checking account for the new customer
    account_payload = {
        "type": "Checking",
        "nickname": "Primary Checking",
        "rewards": 0,
        "balance": 0
    }
    print("Sending account payload to Nessie API:")
    print(account_payload)

    async with httpx.AsyncClient() as client:
        account_response = await client.post(
            f"{NESSIE_BASE_URL}/customers/{customer_id}/accounts?key={NESSIE_API_KEY}", 
            json=account_payload
        )

    print("Account response status:", account_response.status_code)
    print("Account response body:", account_response.text)

    if account_response.status_code != 201:
        raise HTTPException(status_code=500, detail=f"Failed to create initial account: {account_response.text}")

    account = account_response.json()
    account_created = account.get("objectCreated")
    if not account_created or "_id" not in account_created:
        raise HTTPException(status_code=500, detail="Account creation response does not have expected structure.")

    print("Created account with ID:", account_created["_id"])

    return {
        "message": "User created successfully",
        "customer_id": customer_id,
        "account_id": account_created["_id"],
        "account_type": account_created["type"],
        "balance": account_created["balance"]
    }
@app.post("/api/login")
async def login(login_data: LoginData):
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{NESSIE_BASE_URL}/customers?key={NESSIE_API_KEY}")
    
    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Failed to fetch customers")
    
    customers = response.json()
    # Look for a customer whose first name matches the provided username (ignoring case)
    user = next(
        (c for c in customers if c["first_name"].lower() == login_data.username.lower()),
        None
    )
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    return {"customer_id": user["_id"]}
