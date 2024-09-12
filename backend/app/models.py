from pydantic import BaseModel
from typing import Dict, List, Optional, Union
from datetime import datetime

class Message(BaseModel):
    message_id: str              
    question: str                
    answer: Union[str, Dict, List[Dict]]
    timestamp: Optional[datetime]

class MessageCreate(BaseModel):
    question: str

class Conversation(BaseModel):
    conversation_id: str
    title: str
    messages: List[Message] = []

class ConversationCreate(BaseModel):
    title:str

class User(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    username: str
    conversations: List[Conversation] = []

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
