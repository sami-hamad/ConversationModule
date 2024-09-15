from pydantic import BaseModel
from typing import Union, List, Dict, Optional
from datetime import datetime


class Question(BaseModel):
    type: str  # Can be 'AUDIO', 'TEXT', etc.
    content: str  # The actual content of the question


class Answer(BaseModel):
    type: str # Can be 'TEXT', 'DICT', 'IMAGE', etc.
    content: Union[str, Dict, List[Dict]]  # The actual content of the answer


class Message(BaseModel):
    message_id: str              
    question: Question  # Contains both type and content for the question
    answer: Answer  # Contains both type and content for the answer
    timestamp: Optional[datetime]
    feedback: Optional[str] = None  # Feedback can be 'LIKE' or 'DISLIKE'


class MessageCreate(BaseModel):
    question: Question  # The new structure for creating messages with question type and content


class FeedbackUpdate(BaseModel):
    feedback: str  # Feedback for messages, 'LIKE' or 'DISLIKE'


class VoiceMessageCreate(BaseModel):
    base64_audio: str  # Encoded audio data for voice messages


class Conversation(BaseModel):
    conversation_id: str
    title: str
    last_interaction: Optional[datetime]
    messages: List[Message] = []  # List of messages in the conversation


class ConversationCreate(BaseModel):
    title: str  # Title for creating a new conversation


class User(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    username: str
    conversations: List[Conversation] = []  # Conversations associated with the user


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None  # Token data used for authentication
