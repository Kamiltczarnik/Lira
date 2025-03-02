from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv
import os
import pandas as pd
import json

# If you need these imports for your Nessie or TTS usage:
import httpx
from gtts import gTTS

# If you need these imports for your OpenAI usage:
from openai import OpenAI

# Load environment variables from .env file
load_dotenv()

# ---------------------------
# OpenAI Setup
# ---------------------------
openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    raise ValueError("OpenAI API Key not found in .env file.")
openai_model = "gpt-3.5-turbo"

# Init OpenAI
client = OpenAI(api_key=openai_api_key)

# ---------------------------
# Nessie API Setup (Optional)
# ---------------------------
NESSIE_API_KEY = os.getenv("NESSIE_API_KEY")
NESSIE_BASE_URL = "http://api.nessieapi.com"

# ---------------------------
# FastAPI App
# ---------------------------
app = FastAPI()

# ---------------------------
# CORS Middleware
# ---------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust if needed (e.g., ["http://localhost:3000"])
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------
# Excel Data (AI Banking Advisor)
# ---------------------------
products = pd.read_excel('data/data.xlsx', sheet_name=None)
accounts_df = products['BankAccounts']
cards_df = products['CreditCards']
loans_df = products['Loans']

# ---------------------------
# System Prompt & Utility
# ---------------------------
SYSTEM_PROMPT = """
You are a helpful and concise AI financial advisor.
Your goal is to recommend the best bank accounts, credit cards, or loans for the user based on their needs.
Always recommend from the provided list of products. Do not invent new ones.

Format your response like this:
"The [Product Name] is a great option because [short reason]."

Keep the explanation to 1 or 2 sentences max.
Be conversational, but to the point.
Only recommend 1 or 2 products at most, unless the user asks for more options.
"""

def get_product_list():
    product_list = "Here are the available products:\n\n"

    # Bank Accounts
    product_list += "Bank Accounts:\n"
    for _, row in accounts_df.iterrows():
        product_list += (
            f"- {row['Bank']} - {row['Account Name']} ({row['Account Type']}): "
            f"Monthly Fee: {row['Monthly Fee']}, Minimum Balance: {row['Minimum Balance']}, Perks: {row['Perks']}\n"
        )

    # Credit Cards
    product_list += "\nCredit Cards:\n"
    for _, row in cards_df.iterrows():
        product_list += (
            f"- {row['Bank']} - {row['Card Name']}: Interest Rate: {row['Interest Rate (APR) Range']}, "
            f"Annual Fee: {row['Annual Fee']}, Rewards: {row['Rewards']}, Perks: {row['Perks']}\n"
        )

    # Loans
    product_list += "\nLoans:\n"
    for _, row in loans_df.iterrows():
        product_list += (
            f"- {row['Bank']} - {row['Loan Type']}: Interest Rate: {row['Interest Rate (APR) Range']}, "
            f"Max Amount: {row['Max Amount']}, Term Options: {row['Term Options']}, Perks: {row['Perks']}\n"
        )

    return product_list

# ---------------------------
# Pydantic Models
# ---------------------------
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    user_data: Optional[dict] = None

class ChatResponse(BaseModel):
    reply: str
    audio_url: Optional[str] = None

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

# ---------------------------
# Mock Nessie Data Logic
# ---------------------------
def get_mock_user_data(customer_id: str):
    """Generate mock data for demonstration purposes."""
    first_name = "Joe"
    last_name = "Smith"

    if customer_id == "65b7a5a9322fa89d340a8c1b":
        first_name = "Jane"
        last_name = "Doe"
    elif customer_id == "65b7a5a9322fa89d340a8c1c":
        first_name = "Admin"
        last_name = "User"
    elif customer_id == "65b7a5a9322fa89d340a8c12":
        first_name = "Kamil"
        last_name = "Czajkowski"

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
        )
    ]

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

# ---------------------------
# Endpoints
# ---------------------------

@app.get("/")
def unified_root():
    """
    Single root endpoint that combines both messages.
    """
    return {
        "message": (
            "AI Banking Advisor is running on gpt-3.5-turbo, and "
            "Banking API with Nessie integration is also running."
        )
    }

# ---------------------------
# AI Banking Advisor Routes
# ---------------------------

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        # Log the incoming request
        print(f"Received chat request with {len(request.messages)} messages")
        for i, msg in enumerate(request.messages):
            print(f"Message {i}: {msg.role} - {msg.content[:50]}...")
        
        print(f"User data included: {request.user_data is not None}")
        
        # Extract messages from the request
        messages = [{"role": msg.role, "content": msg.content} for msg in request.messages]
        
        # Add system message to guide the AI
        system_message = {
            "role": "system", 
            "content": "You are a helpful AI banking assistant. Provide concise and accurate information about banking services, account details, and financial advice. If user data is available, reference it in your responses."
        }
        
        # Prepare the full message list for OpenAI
        full_messages = [system_message] + messages
        
        print(f"Sending {len(full_messages)} messages to OpenAI")
        
        # Call OpenAI API
        response = client.chat.completions.create(
            model=openai_model,
            messages=full_messages
        )
        
        # Extract the reply
        reply = response.choices[0].message.content
        print(f"Received reply from OpenAI: {reply[:100]}...")
        
        # Generate speech from text
        audio_url = None
        try:
            # Create a filename based on a hash of the content
            import hashlib
            filename = hashlib.md5(reply.encode()).hexdigest() + ".mp3"
            filepath = f"audio/{filename}"
            
            print(f"Generating speech file: {filepath}")
            
            # Generate the speech file
            tts = gTTS(text=reply, lang='en', slow=False)
            tts.save(filepath)
            
            # Return the URL to the audio file
            audio_url = f"http://localhost:8000/audio/{filename}"
            print(f"Audio URL: {audio_url}")
        except Exception as e:
            print(f"Error generating speech: {e}")
        
        # Prepare the response
        response_data = {"reply": reply, "audio_url": audio_url}
        print(f"Sending response: {response_data}")
        
        return response_data
    
    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/products")
def get_products():
    """
    Returns the product data from the Excel file.
    """
    return {
        "BankAccounts": accounts_df.to_dict(orient="records"),
        "CreditCards": cards_df.to_dict(orient="records"),
        "Loans": loans_df.to_dict(orient="records")
    }

# ---------------------------
# Nessie Mock Routes
# ---------------------------

@app.post("/api/login")
async def login(login_data: LoginData):
    """
    Mock login that returns a mapped customer ID based on username.
    """
    customer_mapping = {
        "joe": "65b7a5a9322fa89d340a8c1a",
        "jane": "65b7a5a9322fa89d340a8c1b",
        "admin": "65b7a5a9322fa89d340a8c1c",
        "kamil": "65b7a5a9322fa89d340a8c12"
    }

    if login_data.username not in customer_mapping:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {"customer_id": customer_mapping[login_data.username]}


@app.get("/api/user/{customer_id}", response_model=UserData)
async def get_user_data(customer_id: str):
    """
    Returns mock user data, simulating a Nessie API call.
    """
    return get_mock_user_data(customer_id)

# Add a route to serve the audio files
from fastapi.staticfiles import StaticFiles
app.mount("/audio", StaticFiles(directory="audio"), name="audio")

# Create audio directory if it doesn't exist
os.makedirs("audio", exist_ok=True)
