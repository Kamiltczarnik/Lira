from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import pandas as pd
from openai import OpenAI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Load .env (for OpenAI key)
load_dotenv()
# GPT-3.5-Turbo key
openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    raise ValueError("OpenAI API Key not found in .env file.")
openai_model = "gpt-3.5-turbo"

# Initialize OpenAI client
client = OpenAI(api_key=openai_api_key)
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load product data from Excel
products = pd.read_excel('data/data.xlsx', sheet_name=None)
accounts = products['BankAccounts']
cards = products['CreditCards']
loans = products['Loans']

# System prompt for GPT
SYSTEM_PROMPT = """
You are a knowledgeable AI financial advisor.
Your job is to recommend the best bank accounts, credit cards, and loans for the user based on their financial goals.
Only recommend from the following products. Do not make up any products. Be clear and helpful.
"""

def get_product_list():
    product_list = "Here are the available products:\n\n"
    product_list += "Bank Accounts:\n" + accounts.to_string(index=False) + "\n\n"
    product_list += "Credit Cards:\n" + cards.to_string(index=False) + "\n\n"
    product_list += "Loans:\n" + loans.to_string(index=False) + "\n\n"
    return product_list

class ChatRequest(BaseModel):
    message: str
    history: List[dict] = []

@app.post("/chat")
def chat(request: ChatRequest):
    try:
        history = request.history
        history.append({"role": "user", "content": request.message})

        messages = [{"role": "system", "content": SYSTEM_PROMPT + "\n\n" + get_product_list()}] + history

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
