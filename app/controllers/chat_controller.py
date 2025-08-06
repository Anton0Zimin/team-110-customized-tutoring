from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/chat", tags=["chat"])

class ChatRequest(BaseModel):
    message: str
    subject: str = "General"

@router.get("/{student_id}/summary")
def get_summary_plan(student_id: str):
    try:
        # Example data - replace with actual database lookup
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
        
        prompt = build_prompt(student, tutor, "General Study Plan")
        
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
def get_next_chat_message(student_id: str, request: ChatRequest):
    try:
        # Example data - replace with actual database lookup
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
        
        # Build context-aware prompt
        context_prompt = f"""
{build_prompt(student, tutor, request.subject)}

Student question: {request.message}

Provide a helpful, accessible response that considers the student's needs.
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
def build_prompt(student, tutor, subject):
    return f"""
You are an expert tutor assistant.

Create a personalized, accessible lecture plan for the following:

Student:
- Disability: {student["primary_disability"]}
- Learning Style: {student["learning_preferences"]["style"]}
- Modality: {student["learning_preferences"]["modality"]}
- Format: {student["learning_preferences"]["format"]}
- Accommodations: {', '.join(student["accommodations_needed"])}

Tutor:
- Style: {tutor["tutoring_style"]}
- Subjects: {', '.join(tutor["subjects"])}
- Tools: {', '.join(tutor["tools_or_technologies"])}
- Accessibility Skills: {', '.join(tutor["accommodation_skills"])}

Subject: {subject}

Generate a step-by-step lecture plan that uses inclusive teaching strategies.
"""

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




