from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from controllers import summary_controller
from controllers import question_controller
from controllers import login_controller
import logging

logging.basicConfig(level=logging.DEBUG)

app = FastAPI()
app.include_router(login_controller.router)
app.include_router(question_controller.router)
app.include_router(summary_controller.router)

# Mount the 'static' directory at the '/static' URL path
app.mount("/", StaticFiles(directory="static", html=True), name="static")