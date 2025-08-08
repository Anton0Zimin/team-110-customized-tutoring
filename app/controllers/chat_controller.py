from typing import Optional
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
import os
import logging
from services.student_file_service import StudentFileService
from services.student_service import StudentService
from services.tutor_service import TutorService
from prompts import summary_plan_prompt

KNOWLEDGE_BASE_ID = os.getenv("KNOWLEDGE_BASE_ID")



logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/chat", tags=["chat"])
student_service = StudentService()
tutor_service = TutorService()

class ChatRequest(BaseModel):
    message: str
    subject: str = "General"
    session_id: Optional[str] = None

@router.get("/{student_id}/summary")
def get_summary_plan(student_id: str):
    try:
        # Get real data from DynamoDB
        student = student_service.get_student(student_id)
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")

        class_material = StudentFileService().get_file(student_id)

        prompt = build_prompt(student, tutor, class_material)

        response = bedrock.retrieve_and_generate(
            input={
                'text': prompt
            },
            retrieveAndGenerateConfiguration={
                'type': 'KNOWLEDGE_BASE',
                'knowledgeBaseConfiguration': {
                    'knowledgeBaseId': KNOWLEDGE_BASE_ID,
                    'modelArn': 'arn:aws:bedrock:us-west-2::foundation-model/anthropic.claude-3-5-sonnet-20241022-v2:0',
                    'generationConfiguration': {
                        'promptTemplate': {
                            'textPromptTemplate': summary_plan_prompt.kb_prompt
                        }
                    },
                }

            }
        )

        return json.loads(response['output']['text'])

    except Exception as e:
        logger.error(f"Error generating summary: {e}")
        logger.error(f"Error type: {type(e).__name__}")
        logger.error(f"Error details: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate summary: {str(e)}")

@router.post("/{student_id}/chat")
def get_next_chat_message(student_id: str, request: ChatRequest, web_request: Request):
    try:
        logger.info(f"Chat request for student_id: {student_id}")
        logger.info(f"KNOWLEDGE_BASE_ID: {KNOWLEDGE_BASE_ID}")

        # Get student data from DynamoDB
        student = student_service.get_student(student_id)
        logger.info(f"Student found: {student is not None}")
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")

        # Get tutor data if tutor_id is provided
        tutor = None
        if request.tutor_id:
            tutor = tutor_service.get_tutor(request.tutor_id)
            logger.info(f"Tutor found: {tutor is not None}")

        class_material = StudentFileService().get_file(student_id)

        # Build chat-specific prompt for tutor assistance
        prompt = build_tutor_chat_prompt(
            student,
            tutor,
            request.message,
            request.subject,
            class_material
        )
        logger.info(f"Generated prompt length: {len(prompt)}")

        logger.info("Calling Bedrock...")
        response = bedrock.retrieve_and_generate(
            input={
                'text': prompt
            },
            retrieveAndGenerateConfiguration={
                'type': 'KNOWLEDGE_BASE',
                'knowledgeBaseConfiguration': {
                    'knowledgeBaseId': KNOWLEDGE_BASE_ID,
                    'modelArn': 'arn:aws:bedrock:us-west-2::foundation-model/anthropic.claude-3-5-sonnet-20241022-v2:0',
                    'generationConfiguration': {
                        'promptTemplate': {
                            'textPromptTemplate': 'Answer the provided question using the provided documents and context: $search_results$'
                        }
                    },
                }
            }
        )
        logger.info("Bedrock response received")

        result = {
            "response": response['output']['text'],
            "session_id": response.get('sessionId', None)
        }

        logger.info(f"Returning response length: {len(result['response'])}")

        return result

    except Exception as e:
        logger.error(f"Error generating chat response: {e}")
        logger.error(f"Error type: {type(e).__name__}")
        logger.error(f"Error details: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate chat response: {str(e)}")


import boto3
import json
bedrock = boto3.client("bedrock-agent-runtime", region_name="us-west-2")


# Your base prompt — we'll improve this in the next steps
def build_prompt(student, tutor, subject, class_material=None):
    prompt = f"""
You are an expert tutor assistant who specialized in providing personalized, accessible tutoring for students with disabilities.

Your task is to generate a personalized tutoring plan that helps the student effectively learn the subject content, using instructional strategies aligned with their specific learning needs and preferences.

Do not reference or repeat any personally identifiable information. Focus only on customizing the approach to meet the student's accessibility requirements.

<Student Profile>
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
- Required Accommodations: {', '.join(student["accommodations_needed"])}
</Student Profile>

<Study Context>
- Subject: {subject}
"""

    if class_material:
        prompt += f"""
- Class Material or Assignment:
{class_material}


Provide personalized, accessible tutoring that considers the student's specific needs.

Respond in this format:
<>
"""

    return prompt

def build_tutor_chat_prompt(student, tutor, message, subject, class_material=None):
    prompt = f"""
You are an expert disability services tutoring consultant with deep knowledge of evidence-based practices for supporting students with disabilities in academic settings.

TUTOR QUESTION: "{message}"

STUDENT CONTEXT:
- Primary Disability: {student["primary_disability"]}
- Learning Style: {student["learning_preferences"]["style"]}
- Preferred Modality: {student["learning_preferences"]["modality"]}
- Session Format: {student["learning_preferences"]["format"]}
- Required Accommodations: {', '.join(student["accommodations_needed"])}
- Subject Area: {subject}
"""

    if tutor:
        prompt += f"""

TUTOR BACKGROUND:
- Teaching Style: {tutor["tutoring_style"]}
- Subject Expertise: {', '.join(tutor["subjects"])}
- Available Tools: {', '.join(tutor["tools_or_technologies"])}
- Accommodation Experience: {', '.join(tutor["accommodation_skills"])}
"""

    if class_material:
        prompt += f"""

CURRENT LESSON CONTENT:
{class_material}
"""

    prompt += f"""

PROVIDE CUSTOMIZED GUIDANCE:

1. DISABILITY-SPECIFIC STRATEGIES:
   - How does {student["primary_disability"]} typically impact learning in {subject}?
   - What evidence-based teaching methods work best for this disability?
   - How should content be presented to maximize comprehension?

2. ACCOMMODATION IMPLEMENTATION:
   - Step-by-step guidance for implementing: {', '.join(student["accommodations_needed"])}
   - How to seamlessly integrate accommodations without stigmatization
   - Backup strategies if primary accommodations aren't working

3. LEARNING STYLE OPTIMIZATION:
   - Specific techniques for {student["learning_preferences"]["style"]} learners
   - How to adapt {student["learning_preferences"]["modality"]} delivery for this disability
   - Best practices for {student["learning_preferences"]["format"]} sessions

4. PROACTIVE PROBLEM-SOLVING:
   - Common challenges students with {student["primary_disability"]} face in {subject}
   - Early warning signs of frustration or disengagement
   - Strategies to maintain motivation and confidence

5. PRACTICAL NEXT STEPS:
   - Immediate actions the tutor can take
   - Resources or materials to prepare
   - How to measure progress and adjust approach

Focus on actionable, research-backed strategies that respect the student's dignity and promote independence.
"""

    return prompt

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

