from fastapi import FastAPI, HTTPException



app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello, FastAPI with Firebase"}

