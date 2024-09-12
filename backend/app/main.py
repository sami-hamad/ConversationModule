from fastapi import FastAPI
from api.auth import router as auth_router
from api.users import router as users_router
from api.conversations import router as conversations_router
app = FastAPI()

# Register routes
app.include_router(auth_router)
app.include_router(conversations_router, prefix="/api")
app.include_router(users_router, prefix="/api")
