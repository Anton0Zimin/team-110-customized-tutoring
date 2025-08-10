# Personalized Tutoring for Disability Services Students
CCC AI Summer Camp 2025 (Cal Poly Digital Transformation Hub and AWS)

## Project Objectives
- Customize tutoring services to better support students with disabilities
- Address the needs of students in STEM, English, communication, and general education courses
- Adapt support based on individual learning disabilities, including ADHD and autism
- Improve educational equity through tailored academic assistance
- Enhance student engagement and academic performance in high-demand subjects
- Support disability services staff with effective, scalable tutoring strategies

## AWS Bedrock Use-Cases
- For tutor:
    - Knowledge Base + context from DynamoDB - generate a summary study plan for a student.
    - Knowledge Base + context from DynamoDB - chat bot for a tutor. AWS handles the chat session.
- For student:
    - Context from DynamoDB - chat bot for a student. AWS handles the chat session.

### Source Documents for RAG
- Effective Practices for Online Tutoring
- Tutor Handook

### Sample Prompts

- [Study Plan](docs/study_plan_prompt.md)
- [Tutor Chat](docs/tutor_chat_prompt.md)
- [Student Chat](docs/student_chat_prompt.md)

## AWS Services

![](docs/infrastructure.svg)

- ![](docs/bedrock.svg) AWS Bedrock + Knowledge Base + S3 Vectors + Claude Sonnet 3.5 Foundation Model
- ![](docs/dynamodb.svg) AWS DynamoDB
    - Store Users, Students, Tutors
- ![](docs/s3.svg) AWS S3
    - Store source materials for the knowledge base
- ![](docs/cognito.svg) AWS Cognito
    - Manage users, group, authentication, authorization
- ![](docs/ecs.svg) AWS ECS (Elastic Container Service)
    - Host the backend and frontend app
- ![](docs/ecr.svg) AWS ECR (Elastic Container Registry)
    - Store Docker images
- ![](docs/ec2.svg) AWS ALB (Application Load Balancer)
    - Offload HTTPS
- ![](docs/route53.svg) AWS Route 53 (DNS)
    - Dynamically update DNS records
- ![](docs/acm.svg) ACM (Certificate Manager)
    - Issue HTTPS certificate

## Tech Stack

![](docs/fastapi.png)
![](docs/nextjs.png)
![](docs/docker.png)

- Backend
    - FastAPI (Python)
- Frontend
    - Next.js (React, TypeScript)
- Docker

## Restore packages

```sh
source ./venv/Scripts/activate
```

OR

```powershell
. .\venv\Scripts\Activate.ps1
```

```sh
pip install -r requirements.txt
```

## Run the backend app

Create app/.env based on app/.env.template.

```sh
cd app
uvicorn main:app --reload
```

- [Local App](http://localhost:8000)
- [API Docs](http://localhost:8000/docs)

## Run the frontend

```sh
cd frontend
npm ci
npm run dev
```

## Build Docker image and push to ECR

```sh
cd frontend
npm ci
npm run build
cd ..
```

```sh
git rev-parse HEAD > ./app/static/version.txt

aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin 819351093526.dkr.ecr.us-west-2.amazonaws.com

docker build -t team-110/customized-tutoring .

docker tag team-110/customized-tutoring:latest 819351093526.dkr.ecr.us-west-2.amazonaws.com/team-110/customized-tutoring:latest

docker push 819351093526.dkr.ecr.us-west-2.amazonaws.com/team-110/customized-tutoring:latest
```
