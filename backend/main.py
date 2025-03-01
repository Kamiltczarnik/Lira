from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv
import json

# Load environment variables from .env file
load_dotenv()

app = FastAPI()

# Add CORS middleware to allow frontend to call our API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Update with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Nessie API configuration
NESSIE_API_KEY = os.getenv("NESSIE_API_KEY")
NESSIE_BASE_URL = "http://api.nessieapi.com"

# Define data models
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

class LoginData(BaseModel):
    username: str
    password: str

# Mock user data for demonstration
def get_mock_user_data(customer_id: str):
    first_name = "Joe"
    last_name = "Smith"
    
    if customer_id == "65b7a5a9322fa89d340a8c1b":
        first_name = "Jane"
        last_name = "Doe"
    elif customer_id == "65b7a5a9322fa89d340a8c1c":
        first_name = "Admin"
        last_name = "User"
    
    # Create mock accounts
    accounts = [
        Account(
            id=f"{customer_id}-checking",
            type="Checking",
            nickname="Primary Checking",
            balance=5231.89,
            rewards=0,
            account_number="123456789"
        ),
        Account(
            id=f"{customer_id}-savings",
            type="Savings",
            nickname="High Yield Savings",
            balance=12000.00,
            rewards=0,
            account_number="987654321"
        ),
        Account(
            id=f"{customer_id}-credit",
            type="Credit Card",
            nickname="Rewards Card",
            balance=1250.75,
            rewards=3500,
            account_number="4111111111111111"
        )
    ]
    
    # Create mock transactions
    transactions = [
        Transaction(
            transaction_id=f"{customer_id}-tx1",
            type="withdrawal",
            merchant_name="Grocery Store",
            amount=85.75,
            date="2025-02-01T12:00:00Z",
            description="Weekly groceries"
        ),
        Transaction(
            transaction_id=f"{customer_id}-tx2",
            type="withdrawal",
            merchant_name="Gas Station",
            amount=45.00,
            date="2025-02-03T15:30:00Z",
            description="Fuel"
        ),
        Transaction(
            transaction_id=f"{customer_id}-tx3",
            type="deposit",
            merchant_name="Employer",
            amount=2500.00,
            date="2025-02-05T09:00:00Z",
            description="Salary deposit"
        ),
        Transaction(
            transaction_id=f"{customer_id}-tx4",
            type="withdrawal",
            merchant_name="Restaurant",
            amount=65.40,
            date="2025-02-07T19:45:00Z",
            description="Dinner"
        ),
        Transaction(
            transaction_id=f"{customer_id}-tx5",
            type="withdrawal",
            merchant_name="Online Store",
            amount=120.99,
            date="2025-02-10T14:20:00Z",
            description="Electronics purchase"
        )
    ]
    
    return UserData(
        customer_id=customer_id,
        first_name=first_name,
        last_name=last_name,
        accounts=accounts,
        transactions=transactions
    )

@app.get("/")
async def root():
    return {"message": "Banking API with Nessie integration is running"}

@app.post("/api/login")
async def login(login_data: LoginData):
    # Map usernames to customer IDs
    customer_mapping = {
        "joe": "65b7a5a9322fa89d340a8c1a",
        "jane": "65b7a5a9322fa89d340a8c1b",
        "admin": "65b7a5a9322fa89d340a8c1c"
    }
    
    if login_data.username not in customer_mapping:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Return the customer ID that will be used for subsequent API calls
    return {"customer_id": customer_mapping[login_data.username]}

@app.get("/api/user/{customer_id}", response_model=UserData)
async def get_user_data(customer_id: str):
    # Instead of calling the Nessie API, use mock data
    return get_mock_user_data(customer_id)