from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from dependencies import get_current_user
from dependencies import users_collection
from models import Conversation, ConversationCreate, MessageCreate, Message
import sys, os
import json

router = APIRouter()

@router.post("/create_conversation/")
def create_conversation(conversation_create: ConversationCreate, current_user: dict = Depends(get_current_user)):
    conv_id = str(ObjectId())
    
    # Create conversation
    conversation_data = Conversation(
        conversation_id=conv_id,
        title=conversation_create.title,
        messages=[]
    )
    conversation_dict=conversation_data.dict()
    result = users_collection.update_one(
        {"username": current_user["username"]},
        {"$push": {"conversations": conversation_data.dict()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    return {"conversation_id": conversation_dict["conversation_id"], "title":conversation_dict["title"]}


@router.post("/create_message/{conversation_id}/")
def create_message(conversation_id: str, message_create: MessageCreate, current_user: dict = Depends(get_current_user)):
    message_id = str(ObjectId())

    # Call get_rag_response with the user's ID and conversation ID
    print("conversation_id", conversation_id)
    #rag_response = get_rag_response(message_create.question, conversation_id, str(current_user["_id"]))

    rag_response = "HERE SHOULD BE THE RESPONSE FROM THE RAG"
    # Prepare the message data using a single template
    message_data = Message(
        message_id=message_id,
        question=message_create.question,
        answer=rag_response,
        timestamp=datetime.utcnow(),
    )

    # Debug: Print to verify the user's document and conversation ID
    print(f"Updating conversation for user: {current_user['_id']}, conversation ID: {conversation_id}")

    # Insert the message into the conversation
    result = users_collection.update_one(
        {"_id": current_user["_id"], "conversations.conversation_id": conversation_id},
        {"$push": {"conversations.$.messages": message_data.dict()}}
    )

    # Check if the update was successful
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Conversation not found")

    return {"message_id": message_id, "answer": message_data.answer}



@router.get("/conversations/")
def get_conversations(current_user: dict = Depends(get_current_user)):
    user = users_collection.find_one({"username": current_user["username"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    conversations = user.get("conversations", [])
    return {"conversations": conversations}

@router.get("/conversations/{conversation_id}/messages/")
def get_conversation_messages(conversation_id: str, current_user: dict = Depends(get_current_user)):
    user = users_collection.find_one(
        {"username": current_user["username"], "conversations.conversation_id": conversation_id},
        {"conversations.$": 1}
    )
    
    if not user or "conversations" not in user:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    conversation = user["conversations"][0]
    messages = sorted(conversation.get("messages", []), key=lambda msg: msg["timestamp"])
    
    return {"conversation_id": conversation_id, "messages": messages}


@router.delete("/delete_conversation/{conversation_id}")
def delete_conversation(conversation_id: str, current_user: dict = Depends(get_current_user)):
    # Find the user and the conversation
    result = users_collection.update_one(
        {"username": current_user["username"]},
        {"$pull": {"conversations": {"conversation_id": conversation_id}}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found or conversation not found")

    return {"message": "Conversation deleted successfully"}