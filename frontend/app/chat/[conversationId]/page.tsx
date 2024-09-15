'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Box, ScrollArea, Stack, Text } from '@mantine/core';
import { getMessages } from '../../lib/api';
import Loading from '../../components/loading/loading';
import MessageInput from '../../components/chats/message_input';
import MessageList from '../../components/chats/message_list';
import ChatError from '../../components/chats/chat_error';
import EmptyState from '../../components/chats/empty_state';

// Define the structure for Question and Answer objects
interface Question {
    type: 'TEXT' | 'AUDIO'; // Add more types as needed
    content: string; // The actual content of the question
}

interface Answer {
    type: 'TEXT' | 'DICT' | 'IMAGE'; // Add more types as needed
    content: string | Record<string, any>[]; // The content of the answer
}

// Update the Message interface to reflect the new structure
export interface Message {
    message_id: string;
    question: Question; // Question object containing type and content
    answer: Answer; // Answer object containing type and content
    timestamp: string;
    feedback: 'LIKE' | 'DISLIKE' | null;
}

export default function ChatPage({ params }: { params: { conversationId: string } }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [chatError, setChatError] = useState<string | null>(null);
    const { data: session } = useSession();
    const { conversationId } = params;

    const hasFetchedOnce = useRef(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        const fetchMessages = async () => {
            if (!session?.accessToken) {
                console.error('No access token available');
                return;
            }

            if (hasFetchedOnce.current) {
                return;
            }

            setLoading(true);
            try {
                const messages = await getMessages(conversationId, session.accessToken);
                setMessages(messages);
                hasFetchedOnce.current = true;
            } catch (error) {
                console.error('Error fetching messages:', error);
                setChatError('This conversation does not exist.');
            } finally {
                setLoading(false);
                scrollToBottom();
            }
        };

        fetchMessages();
    }, [conversationId, session]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleMessageSent = (newMessages: any) => {
        setMessages(newMessages);
        scrollToBottom();
    };

    const handleWaitingMessage = (waitingMessage: any) => {
        setMessages((prevMessages) => [...prevMessages, waitingMessage]);
        scrollToBottom();
    };

    if (loading) {
        return <Loading />;
    }

    if (chatError) {
        return <ChatError error={chatError} />;
    }

    return (
        <ScrollArea.Autosize scrollbarSize={20}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        width: '50rem',
                    }}
                >
                    <Stack
                        gap="md"
                        style={{ marginTop: 45, flexGrow: 1, padding: '1rem' }}
                    >
                        {messages.length === 0 ? (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <EmptyState />
                            </div>
                        ) : (
                            <>
                                <MessageList messages={messages} conversationId={conversationId} />
                                <div ref={messagesEndRef} />
                            </>
                        )}
                    </Stack>
                    <Box
                        style={{
                            position: 'sticky',
                            bottom: 0,
                            width: '100%',
                            backgroundColor: 'white',
                        }}
                    >
                        <MessageInput
                            conversationId={conversationId}
                            sessionToken={session?.accessToken!}
                            onMessageSent={handleMessageSent}
                            onWaitingMessage={handleWaitingMessage}
                        />
                        <Text size={'sm'} ta={'center'} color="gray">
                            AI can make mistakes. Check important info.
                        </Text>
                    </Box>
                </div>
            </div>
        </ScrollArea.Autosize>
    );
}
