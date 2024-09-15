import axios from 'axios';

// Fetch all conversations
export const getConversations = async (token: string) => {
    const response = await axios.get('http://localhost:8000/conversations/', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data.conversations.map((convo: any) => ({
        conversation_id: convo.conversation_id,
        title: convo.title,
        last_interaction: convo.last_interaction
    }));
};

// Fetch messages for a specific conversation
export const getMessages = async (conversationId: string, token: string) => {
    const response = await axios.get(`http://localhost:8000/conversations/${conversationId}/messages/`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    // Ensure that both question and answer follow the new structure with type and content
    return response.data.messages.map((message: any) => ({
        message_id: message.message_id,
        question: {
            type: message.question.type,
            content: message.question.content
        },
        answer: {
            type: message.answer.type,
            content: message.answer.content
        },
        timestamp: message.timestamp,
        feedback: message.feedback || null
    }));
};

// Send a message to a conversation (generalized for both text and voice)
export const sendMessage = async (conversationId: string, questionType: string, questionContent: string, token: string) => {
    const response = await axios.post(
        `http://localhost:8000/create_message/${conversationId}/`,
        {
            question: {
                type: questionType,  // Can be 'TEXT' or 'AUDIO'
                content: questionContent
            }
        },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return response.data;  // Returns { message_id, answer }
};

// Create a new conversation
export const createConversation = async (title: string, token: string) => {
    const response = await axios.post(
        'http://localhost:8000/create_conversation/',
        { title },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return response.data;  // { conversation_id, title }
};

// Delete a conversation
export async function deleteConversation(conversationId: string, token: string) {
    try {
        const response = await axios.delete(`http://localhost:8000/delete_conversation/${conversationId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Failed to delete conversation:', error);
        throw new Error('Error deleting conversation');
    }
}

// Function to update feedback for a specific message
export const updateMessageFeedback = async (conversationId: string, messageId: string, feed: 'LIKE' | 'DISLIKE', token: string) => {
    try {
        const response = await axios.put(
            `http://localhost:8000/conversations/${conversationId}/messages/${messageId}/feedback`,
            { feedback: feed },  // Send feedback in the body
            {
                headers: {
                    Authorization: `Bearer ${token}`,  // Pass the token here
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error updating feedback:', error);
        throw error; // Propagate the error
    }
};
