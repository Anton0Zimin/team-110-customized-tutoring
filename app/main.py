from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from controllers import auth_controller
from controllers import student_controller
from controllers import chat_controller
import logging
from fastapi.middleware.cors import CORSMiddleware

logging.basicConfig(level=logging.DEBUG)

app = FastAPI()
app.include_router(auth_controller.router)
app.include_router(student_controller.router)
app.include_router(chat_controller.router)

# Mount the 'static' directory at the '/static' URL path
app.mount("/", StaticFiles(directory="static", html=True), name="static")

# Define your allowed origins (e.g., frontend on localhost)
origins = [
    "http://localhost:8000",  # React, Vite, etc.
    "http://localhost:3000",
    "http://customized-training.org"
]

# Add the CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,            # List of allowed origins
    allow_credentials=True,           # Allow cookies and auth headers
    allow_methods=["*"],              # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],              # Allow all headers
)
