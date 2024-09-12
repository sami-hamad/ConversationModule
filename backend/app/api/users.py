from fastapi import APIRouter, HTTPException
from dependencies import users_collection, get_password_hash
from models import User, UserResponse

router = APIRouter()

@router.post("/create_user/", response_model=UserResponse)
def create_user(user: User):
    if users_collection.find_one({"username": user.username}):
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_password = get_password_hash(user.password)
    user_data = {
        "username": user.username,
        "hashed_password": hashed_password,
        "conversations": []
    }
    
    users_collection.insert_one(user_data)
    return UserResponse(username=user.username)
