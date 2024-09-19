import base64
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from app.dependencies import get_current_user
from app.dependencies import users_collection
from app.models import Conversation, ConversationCreate, FeedbackUpdate, MessageCreate, Message, VoiceMessageCreate
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
        last_interaction=datetime.utcnow(),
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
    # response = get_answer()
    response = {
        "type": "TEXT",
        "response": """Mowasalat, also branded as Karwa, is Qatar's primary public transportation provider, playing a key role in shaping the country's transit infrastructure. Established in 2004, Mowasalat manages an extensive network of public buses, taxis, limousines, and school transport services. The company has made significant strides in improving sustainability by transitioning to electric buses and adopting eco-friendly technologies, in line with Qatar's National Vision 2030. Their services cover a vast area, including cities like Doha, Al Khor, Al Shamal, and beyond, with their primary bus terminal at the Al Ghanim Bus Station in Doha.

Mowasalat operates both local and long-distance routes, ensuring efficient public transport across the country. During the FIFA World Cup 2022, Mowasalat transported over 7.5 million passengers with a fleet of 4,000 buses, demonstrating its capacity to manage high-demand events. The company provided specialized services such as stadium-to-stadium shuttles, airport connector buses, and even buses for fans traveling from Qatar's neighboring countries​ (Mowasalat)​ (The Peninsula Newspaper).

In addition to buses, Mowasalat operates approximately 7,000 taxis under its Karwa brand. These taxis are equipped with various fare options, including the Karwa Smart Card system, which offers convenience for passengers across Qatar. Mowasalat also offers ride-sharing services in partnership with apps like Uber and Careem, complementing its public transport network​ (Wikipedia)​ (Expatica).
        """
    }

    # Prepare the answer based on the response type
    answer_data = {
        "type": response["type"],
        "content": None
    }

    if response['type'] == 'TEXT':
        answer_data['content'] = str(response['response'])  # Handle string answer
    elif response['type'] == 'DICT':
        # Directly assign the list or dict to content since it's already in the correct format
        answer_data['content'] = response['response']
    elif response['type'] == 'IMAGE':
        base64_image = response['response']
        try:
            image_data = base64.b64decode(base64_image)
        except base64.binascii.Error:
            raise HTTPException(status_code=400, detail="Invalid Base64 image data")
        answer_data['content'] = base64_image  # Store the Base64 string for the image

    # Prepare the question data
    question_data = {
        "type": message_create.question.type,  # This should come from the frontend (e.g., 'TEXT', 'AUDIO')
        "content": message_create.question.content  # The actual content of the question
    }

    # Create the message object with new structure
    message_data = Message(
        message_id=message_id,
        question=question_data,  # Contains type and content for the question
        answer=answer_data,  # Contains type and content for the answer
        timestamp=datetime.utcnow()
    )

    # Debug: Print to verify the user's document and conversation ID
    print(f"Updating conversation for user: {current_user['_id']}, conversation ID: {conversation_id}")

    # Insert the message into the conversation
    result = users_collection.update_one(
        {
            "_id": current_user["_id"],
            "conversations.conversation_id": conversation_id
        },
        {
            "$push": {"conversations.$.messages": message_data.dict()},
            "$set": {"conversations.$.last_interaction": datetime.utcnow()}  # Update last interaction time
        }
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
    # Find the conversation based on the user's username and conversation ID
    user = users_collection.find_one(
        {"username": current_user["username"], "conversations.conversation_id": conversation_id},
        {"conversations.$": 1}  # Project only the matching conversation
    )
    
    # Handle case where the user or conversation is not found
    if not user or "conversations" not in user:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Extract the conversation
    conversation = user["conversations"][0]
    messages = sorted(conversation.get("messages", []), key=lambda msg: msg["timestamp"])

    # Use the Pydantic models to validate and serialize the response
    formatted_messages = [Message(**msg) for msg in messages]

    last_interaction = conversation.get("last_interaction")

    return {
        "conversation_id": conversation_id,
        "last_interaction": last_interaction,
        "messages": formatted_messages  # Return the messages with the new structure
    }


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




@router.put("/conversations/{conversation_id}/messages/{message_id}/feedback")
def update_feedback(conversation_id: str, message_id: str, feedback_update: FeedbackUpdate, current_user: dict = Depends(get_current_user)):
    # Check if the feedback value is valid
    feedback = feedback_update.feedback
    if feedback not in ["LIKE", "DISLIKE"]:
        raise HTTPException(status_code=400, detail="Invalid feedback value")

    # Perform the update operation
    result = users_collection.update_one(
        {
            "username": current_user["username"],  # Ensure it's for the correct user
            "conversations.conversation_id": conversation_id,  # Ensure it's the correct conversation
            "conversations.messages.message_id": message_id  # Ensure it's the correct message
        },
        {
            "$set": {
                "conversations.$[conv].messages.$[msg].feedback": feedback  # Update feedback for the correct message
            }
        },
        array_filters=[
            {"conv.conversation_id": conversation_id},  # Filter for the correct conversation
            {"msg.message_id": message_id}  # Filter for the correct message
        ]
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Message or conversation not found")

    return {"message": "Feedback updated successfully"}

