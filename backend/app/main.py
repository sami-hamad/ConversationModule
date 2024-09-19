from fastapi import FastAPI
from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.api.conversations import router as conversations_router
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()
# Allow requests from the frontend (localhost:3000) during development
origins = [
    "http://localhost:3000",  # Access from local machine
    "http://frontend:3000",   # Access within Docker
]

# Add CORS middleware to your FastAPI app
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allow requests from this origin (localhost:3000 for Next.js)
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)
# Register routes
app.include_router(auth_router)
app.include_router(conversations_router)
app.include_router(users_router)
