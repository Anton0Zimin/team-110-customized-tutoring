import requests

# Test summary endpoint
print("Testing summary endpoint...")
response = requests.get("http://localhost:8000/api/chat/student123/summary")
print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")

print("\n" + "="*50 + "\n")

# Test chat endpoint
print("Testing chat endpoint...")
response = requests.post(
    "http://localhost:8000/api/chat/student123/chat",
    json={"message": "How do I start writing an essay?", "subject": "English"}
)
print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")