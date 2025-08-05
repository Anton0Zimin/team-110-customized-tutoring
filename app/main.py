from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

app = FastAPI()

# Mount the 'static' directory at the '/static' URL path
app.mount("/", StaticFiles(directory="static", html=True), name="static")
