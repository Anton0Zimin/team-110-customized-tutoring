from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
import os
import logging
from services.student_service import StudentService
from services.tutor_service import TutorService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/chat", tags=["chat"])
student_service = StudentService()
tutor_service = TutorService()

class ChatRequest(BaseModel):
    message: str
    subject: str = "General"
    tutor_id: str = None
    class_material: str = None

@router.get("/{student_id}/summary")
def get_summary_plan(student_id: str):
    try:
        # Get real data from DynamoDB
        student = student_service.get_student(student_id)
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")

        prompt = build_prompt(
            student, tutor, "General Study sPlan"
        )

        os.makedirs("prompts", exist_ok=True)
        save_prompt_to_file(prompt, student_id, "summary_plan")

        response = bedrock.converse(
            modelId="anthropic.claude-3-5-sonnet-20241022-v2:0",
            messages=[{"role": "user", "content": [{"text": prompt}]}],
            inferenceConfig={"temperature": 0.5, "maxTokens": 750}
        )

        return {"summary": response['output']['message']['content'][0]['text']}

    except Exception as e:
        logger.error(f"Error generating summary: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate summary")

@router.post("/{student_id}/chat")
def get_next_chat_message(student_id: str, request: ChatRequest, web_request: Request):
    try:
        # Get real data from DynamoDB
        student = student_service.get_student(student_id)
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")

        tutor = tutor_service.get_tutor(web_request.state.tutor_id)
        if not tutor:
            raise HTTPException(status_code=404, detail="Tutor not found: " + web_request.state.tutor_id)

        # Build context-aware prompt
        context_prompt = f"""
{build_prompt(student, tutor, request.subject, request.class_material)}

Student question: {request.message}

Provide a helpful, accessible response.
"""

        response = bedrock.converse(
            modelId="anthropic.claude-3-5-sonnet-20241022-v2:0",
            messages=[{"role": "user", "content": [{"text": context_prompt}]}],
            inferenceConfig={"temperature": 0.5, "maxTokens": 750}
        )

        return {"response": response['output']['message']['content'][0]['text']}

    except Exception as e:
        logger.error(f"Error generating chat response: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate response")


import boto3
import json

# Initialize Bedrock client
bedrock = boto3.client("bedrock-runtime", region_name="us-west-2")

# Your base prompt — we'll improve this in the next steps
def build_prompt(student, tutor, subject, class_material=None):
    prompt = f"""
You are an expert tutor assistant.

Student Profile:
- Disability: {student["primary_disability"]}
- Learning Style: {student["learning_preferences"]["style"]}
- Modality: {student["learning_preferences"]["modality"]}
- Format: {student["learning_preferences"]["format"]}
- Accommodations: {', '.join(student["accommodations_needed"])}

Subject: {subject}
"""

    if tutor:
        prompt += f"""

Tutor Profile:
- Style: {tutor["tutoring_style"]}
- Subjects: {', '.join(tutor["subjects"])}
- Tools: {', '.join(tutor["tools_or_technologies"])}
- Accessibility Skills: {', '.join(tutor["accommodation_skills"])}
"""

    if class_material:
        prompt += f"""

Class Material/Assignment:
{class_material}
"""

    prompt += """

Provide personalized, accessible tutoring that considers the student's specific needs.
"""

    return prompt

def save_prompt_to_file(prompt, student_id, prompt_type):
    os.makedirs("prompts", exist_ok=True)
    filename = f"prompts/{student_id}_{prompt_type}.txt"

    with open(filename, "w") as f:
        f.write(prompt)

    logger.info(f"Prompt saved to {filename}")


# Example student and tutor (replace with real data later)
student = {
    "primary_disability": "Dyslexia",
    "accommodations_needed": ["Text-to-speech software", "Braille materials"],
    "learning_preferences": {
        "style": "Reading/Writing",
        "format": "1-on-1",
        "modality": "Hybrid"
    }
}

tutor = {
    "tutoring_style": "Reading/Writing",
    "subjects": ["English", "Communication"],
    "tools_or_technologies": ["Screen readers", "Whiteboard tools"],
    "accommodation_skills": ["Assistive technology", "Flexible scheduling"]
}

subject = "Introduction to Essay Writing"




