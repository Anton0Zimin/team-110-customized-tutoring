from io import BytesIO
from fastapi import APIRouter, FastAPI, File, HTTPException, Request, UploadFile
from fastapi.responses import JSONResponse
import pymupdf as fitz

from models.student_file import StudentFile
from services.student_file_service import StudentFileService

router = APIRouter(prefix="/api/file", tags=["file"])

@router.post("/upload")
async def upload_file(web_request: Request, file: UploadFile = File(...)):
    if web_request.state.user_role != "student" or not web_request.state.user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    if file.content_type == "text/plain":
        content = await read_text_file(file)
    elif file.content_type == "application/pdf":
        content = await read_pdf_file(file)
    else:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    student_file = StudentFile(
        student_id=web_request.state.user_id,
        filename=file.filename,
        content_type=file.content_type,
        content=content,
        size_bytes=file.size
    )

    StudentFileService().save_file(student_file)

    return {"detail":"File uploaded."}

async def read_text_file(file: UploadFile):
    # Read entire content into memory
    content = await file.read()

    # You can decode if it's text
    try:
        text_content = content.decode("utf-8")
    except UnicodeDecodeError:
        text_content = None  # Not a UTF-8 text file

    return text_content

async def read_pdf_file(file: UploadFile):
    # Read the uploaded file into memory as bytes
    file_bytes = await file.read()

    # Use BytesIO to create a file-like object from bytes
    pdf_stream = BytesIO(file_bytes)

    # Open PDF from the byte stream using fitz
    doc = fitz.open(stream=pdf_stream.read(), filetype="pdf")

    # Extract text from all pages
    all_text = ""
    for page_num in range(doc.page_count):
        page = doc.load_page(page_num)
        all_text += page.get_text()

    return all_text