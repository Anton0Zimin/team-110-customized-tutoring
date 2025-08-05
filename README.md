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
