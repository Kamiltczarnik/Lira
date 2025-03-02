from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import pandas as pd
from openai import OpenAI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Load environment variables (for OpenAI key)
load_dotenv()

# Get OpenAI API key
openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    raise ValueError("OpenAI API Key not found in .env file.")

openai_model = "gpt-3.5-turbo"

# Init OpenAI
client = OpenAI(api_key=openai_api_key)

# Init FastAPI 
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load data from Excel
products = pd.read_excel('data/data.xlsx', sheet_name=None)
accounts = products['BankAccounts']
cards = products['CreditCards']
loans = products['Loans']

SYSTEM_PROMPT = SYSTEM_PROMPT = """
You are a helpful and concise AI financial advisor.
Your goal is to recommend the best bank accounts, credit cards, or loans for the user based on their needs.
Always recommend from the provided list of products. Do not invent new ones.

Format your response like this:
"The [Product Name] is a great option because [short reason]."

Keep the explanation to 1 or 2 sentences max.
Be conversational, but to the point.
Only recommend 1 or 2 products at most, unless the user asks for more options.

Here are the available products:
"""

def get_product_list():
    product_list = "Here are the available products:\n\n"

    # BankAccounts
    product_list += "Bank Accounts:\n"
    for _, row in accounts.iterrows():
        product_list += (
            f"- {row['Bank']} - {row['Account Name']} ({row['Account Type']}): "
            f"Monthly Fee: {row['Monthly Fee']}, Minimum Balance: {row['Minimum Balance']}, Perks: {row['Perks']}\n"
        )

    # CreditCards
    product_list += "\nCredit Cards:\n"
    for _, row in cards.iterrows():
        product_list += (
            f"- {row['Bank']} - {row['Card Name']}: Interest Rate: {row['Interest Rate (APR) Range']}, "
            f"Annual Fee: {row['Annual Fee']}, Rewards: {row['Rewards']}, Perks: {row['Perks']}\n"
        )

    # Loans
    product_list += "\nLoans:\n"
    for _, row in loans.iterrows():
        product_list += (
            f"- {row['Bank']} - {row['Loan Type']}: Interest Rate: {row['Interest Rate (APR) Range']}, "
            f"Max Amount: {row['Max Amount']}, Term Options: {row['Term Options']}, Perks: {row['Perks']}\n"
        )

    return product_list

# Define request body structure for chat endpoint
class ChatRequest(BaseModel):
    message: str
    history: List[dict] = []

# Chat endpoint - accepts a message and chat history
@app.post("/chat")
def chat(request: ChatRequest):
    try:
        history = request.history
        history.append({"role": "user", "content": request.message})

        # System message contains product list and prompt
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT + "\n\n" + get_product_list()}
        ] + history

        # Call OpenAI API
        response = client.chat.completions.create(
            model=openai_model,
            messages=messages
        )

        ai_reply = response.choices[0].message.content
        history.append({"role": "assistant", "content": ai_reply})

        return {"reply": ai_reply, "history": history}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def root():
    return {"message": "AI Banking Advisor is running on gpt-3.5-turbo!"}

@app.get("/products")
def get_products():
    return {
        "BankAccounts": accounts.to_dict(orient="records"),
        "CreditCards": cards.to_dict(orient="records"),
        "Loans": loans.to_dict(orient="records")
    }
