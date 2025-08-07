#!/usr/bin/env python3
"""
Test script for the student chatbot implementation
"""
import os
import sys
import asyncio
from unittest.mock import Mock
from controllers.chat_controller import student_chatbot_message, ChatRequest, build_chatbot_prompt

def test_chatbot_prompt_builder():
    """Test the chatbot prompt builder function"""
    print("Testing chatbot prompt builder...")
    
    # Mock student data
    mock_student = {
        "primary_disability": "Dyslexia",
        "learning_preferences": {
            "style": "Visual",
            "format": "1-on-1",
            "modality": "Hybrid"
        },
        "accommodations_needed": ["Text-to-speech software", "Extra time"]
    }
    
    user_message = "How will I be matched with a tutor?"
    
    prompt = build_chatbot_prompt(mock_student, user_message)
    
    # Check if prompt contains required elements
    assert "friendly, helpful student support chatbot" in prompt
    assert "Dyslexia" in prompt
    assert "Visual" in prompt
    assert "Text-to-speech software" in prompt
    assert user_message in prompt
    
    print("✅ Chatbot prompt builder test passed")
    
def test_environment_variables():
    """Test that required environment variables are set"""
    print("Testing environment variables...")
    
    required_vars = [
        "KNOWLEDGE_BASE_ID", 
        "BEDROCK_MODEL_ID", 
        "AWS_REGION",
        "AWS_ACCESS_KEY_ID",
        "AWS_SECRET_ACCESS_KEY"
    ]
    
    missing_vars = []
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print(f"⚠️  Missing environment variables: {missing_vars}")
    else:
        print("✅ All environment variables are set")
    
    return len(missing_vars) == 0

def test_imports():
    """Test that all required imports work"""
    print("Testing imports...")
    
    try:
        import boto3
        from fastapi import HTTPException, Request
        from controllers.chat_controller import bedrock, KNOWLEDGE_BASE_ID
        
        print("✅ All imports successful")
        print(f"✅ Knowledge Base ID: {KNOWLEDGE_BASE_ID}")
        print(f"✅ Bedrock Model ID: {os.getenv('BEDROCK_MODEL_ID')}")
        return True
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 Running Student Chatbot Tests\n")
    
    # Load environment
    from dotenv import load_dotenv
    load_dotenv()
    
    tests_passed = 0
    total_tests = 3
    
    try:
        test_chatbot_prompt_builder()
        tests_passed += 1
    except Exception as e:
        print(f"❌ Chatbot prompt builder test failed: {e}")
    
    if test_environment_variables():
        tests_passed += 1
    
    if test_imports():
        tests_passed += 1
    
    print(f"\n📊 Test Results: {tests_passed}/{total_tests} passed")
    
    if tests_passed == total_tests:
        print("🎉 All tests passed! The chatbot implementation is ready.")
    else:
        print("⚠️  Some tests failed. Check the output above for details.")
    
    return tests_passed == total_tests

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)