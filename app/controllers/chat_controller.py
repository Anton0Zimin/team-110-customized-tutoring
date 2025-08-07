from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
import os
import logging
from services.student_service import StudentService
from services.tutor_service import TutorService

KNOWLEDGE_BASE_ID = os.getenv("KNOWLEDGE_BASE_ID")



logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/chat", tags=["chat"])
student_service = StudentService()
tutor_service = TutorService()

class ChatRequest(BaseModel):
    message: str
    subject: str = "General"
    tutor_id: str = None
    class_material: str = """

What is Deep Learning
by Jeff Anderson


Rewrite the definition of learning in your own words. Be sure to identify the different components of learning. Do your best to create working draft of what learning is so that you can judge your work in every college class on your own definition of what learning is (rather than on the arbitrary and harmful grades that your teacher assigns).

ORIGINAL: Let’s define learning as a growth process that happens inside your body and leads to changes in your knowledge, beliefs, behaviors, or attitudes. These transformations occur based on your experiences and increase your potential for improved performance and future learning

NEW: Learning is a process in which your mind and body undergo a repeated experience that, overtime, changes your knowledge, beliefs




Rewrite the definition of deep learning in your own words. Be sure to identify the different components of deep learning. Put focused energy into developing your ideas of what deep learning is, what it feels like, and how you know when you are engaged in deep learning. My hope is that you can use this work to spend more time in deep learning in every class and to start to identify when your teachers implement policies that are harmful to deep learning.




Describe what it feels like when you engage in deep learning. What type of subjects and topics do you already do learn deeply about? When are you most excited about engaging in deep learning?




Rewrite the definition of shallow learning in your own words. Be sure to identify the different components of deep learning. Do your best to figure out what shallow learning means to you, what it feels like, and how you know when you are engaged in shallow learning. If you can identify when your teachers implement policies that are force you to learn in shallow ways, then you can develop strategies to counter-act these policies so that you can maximize the amount of time you spend learning deeply.




Describe what it feels like when you learn in a shallow way. When do you tend to engage in shallow learning? What factors in your life and what type of classroom policies tend to make you focus on shallow learning rather than deep learning?






How is your learning connected to your motivation? If you think about when you are engaged in deep learning versus shallow learning, how much of this has to do with the level and types of motivation you bring into your learning? As you respond, think about the differences extrinsic motivation and intrinsic motivation.










"""

class_material = """

What is Deep Learning
by Jeff Anderson


Rewrite the definition of learning in your own words. Be sure to identify the different components of learning. Do your best to create working draft of what learning is so that you can judge your work in every college class on your own definition of what learning is (rather than on the arbitrary and harmful grades that your teacher assigns).

ORIGINAL: Let’s define learning as a growth process that happens inside your body and leads to changes in your knowledge, beliefs, behaviors, or attitudes. These transformations occur based on your experiences and increase your potential for improved performance and future learning

NEW: Learning is a process in which your mind and body undergo a repeated experience that, overtime, changes your knowledge, beliefs




Rewrite the definition of deep learning in your own words. Be sure to identify the different components of deep learning. Put focused energy into developing your ideas of what deep learning is, what it feels like, and how you know when you are engaged in deep learning. My hope is that you can use this work to spend more time in deep learning in every class and to start to identify when your teachers implement policies that are harmful to deep learning.




Describe what it feels like when you engage in deep learning. What type of subjects and topics do you already do learn deeply about? When are you most excited about engaging in deep learning?




Rewrite the definition of shallow learning in your own words. Be sure to identify the different components of deep learning. Do your best to figure out what shallow learning means to you, what it feels like, and how you know when you are engaged in shallow learning. If you can identify when your teachers implement policies that are force you to learn in shallow ways, then you can develop strategies to counter-act these policies so that you can maximize the amount of time you spend learning deeply.




Describe what it feels like when you learn in a shallow way. When do you tend to engage in shallow learning? What factors in your life and what type of classroom policies tend to make you focus on shallow learning rather than deep learning?






How is your learning connected to your motivation? If you think about when you are engaged in deep learning versus shallow learning, how much of this has to do with the level and types of motivation you bring into your learning? As you respond, think about the differences extrinsic motivation and intrinsic motivation.










"""


@router.get("/{student_id}/summary")
def get_summary_plan(student_id: str):
    try:
        # Get real data from DynamoDB
        student = student_service.get_student(student_id)
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")

        prompt = build_prompt(student, tutor, "General Study Plan")

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
                            'textPromptTemplate': 'Answer the provided question using only the provided documents: $search_results$'
                        }
                    },
                }
                
            }
        )
        os.makedirs("prompts", exist_ok=True)
        save_prompt_to_file(prompt, student_id, "summary_plan5")
        return {"response": response['output']['text']}

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

        # Build chat-specific prompt for tutor assistance
        prompt = build_tutor_chat_prompt(
            student, 
            tutor, 
            request.message, 
            request.subject, 
            request.class_material if request.class_material else None
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

        result = {"response": response['output']['text']}
        logger.info(f"Returning response length: {len(result['response'])}")

        os.makedirs("prompts", exist_ok=True)
        save_prompt_to_file(prompt, student_id, "chat_prompt")
        return result

    except Exception as e:
        logger.error(f"Error generating chat response: {e}")
        logger.error(f"Error type: {type(e).__name__}")
        logger.error(f"Error details: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate chat response: {str(e)}")


import boto3
import json

# Initialize Bedrock client
# bedrock = boto3.client("bedrock-runtime", region_name="us-west-2")
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
You are an expert tutoring assistant helping a tutor better understand how to support a student with disabilities.

The tutor has asked: "{message}"

Provide specific, actionable guidance based on the student's profile and learning needs. Focus on practical tutoring strategies, accommodations, and teaching approaches.

<Student Profile>
- Disability: {student["primary_disability"]}
- Learning Style: {student["learning_preferences"]["style"]}
- Modality: {student["learning_preferences"]["modality"]}
- Format: {student["learning_preferences"]["format"]}
- Accommodations: {', '.join(student["accommodations_needed"])}
- Subject: {subject}
"""

    if tutor:
        prompt += f"""

<Tutor Profile>
- Style: {tutor["tutoring_style"]}
- Subjects: {', '.join(tutor["subjects"])}
- Tools: {', '.join(tutor["tools_or_technologies"])}
- Accessibility Skills: {', '.join(tutor["accommodation_skills"])}
"""

    if class_material:
        prompt += f"""

<Class Material Context>
{class_material}
"""

    prompt += """

Provide specific recommendations on:
1. Teaching strategies that align with the student's disability and learning preferences
2. How to implement the required accommodations effectively
3. Tools or techniques that would be most helpful
4. Potential challenges to anticipate and how to address them

Answer the tutor's question with practical, actionable advice.
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

