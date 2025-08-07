# team-110-customized-tutoring
AWS AI Camp 2025 - Customized Tutoring

## Restore packages

```sh
source ./venv/Scripts/activate
```

OR

```powershell
. .\venv\Scripts\Activate.ps1
```

```sh
cd app
pip install -r app/requirements.txt
```

## Run the app

Create .env based on .env.template.

```sh
cd app
uvicorn main:app --reload
```

- [Local App](http://localhost:8000)
- [API Docs](http://localhost:8000/docs)

## Push to Docker

```sh
cd frontend
npm ci
npm run build
cd ..
```

```sh
aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin 819351093526.dkr.ecr.us-west-2.amazonaws.com

docker build -t team-110/customized-tutoring .

docker tag team-110/customized-tutoring:latest 819351093526.dkr.ecr.us-west-2.amazonaws.com/team-110/customized-tutoring:latest

docker push 819351093526.dkr.ecr.us-west-2.amazonaws.com/team-110/customized-tutoring:latest
```
