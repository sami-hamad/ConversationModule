import React, { useState } from 'react';
import { Flex, Group, ActionIcon, Tooltip, Paper } from '@mantine/core';
import { Message } from '../../chat/[conversationId]/page';
import MessageCard from './message_card';
import { IconRobot, IconThumbUp, IconThumbDown, IconCopy, IconVolume, IconVolumeOff } from '@tabler/icons-react';
import { useClipboard } from '@mantine/hooks'; // For copy functionality
import { updateMessageFeedback } from '../../lib/api'; // Import the feedback API
import { useSession } from 'next-auth/react';

interface MessageListProps {
    messages: Message[];
    conversationId: string;
}

export default function MessageList({ messages, conversationId }: MessageListProps) {
    const clipboard = useClipboard(); // For copy functionality
    const { data: session } = useSession();

    // Initialize feedbackMap from the messages data
    const [feedbackMap, setFeedbackMap] = useState<{ [key: string]: 'LIKE' | 'DISLIKE' | null }>(() =>
        messages.reduce((acc, message) => {
            acc[message.message_id] = message.feedback || null;
            return acc;
        }, {} as { [key: string]: 'LIKE' | 'DISLIKE' | null })
    );

    const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
    const [isSpeaking, setIsSpeaking] = useState<string | null>(null);

    const handleFeedback = async (messageId: string, feedback: 'LIKE' | 'DISLIKE') => {
        if (session?.accessToken) {
            try {
                await updateMessageFeedback(conversationId, messageId, feedback, session.accessToken);
                setFeedbackMap({ ...feedbackMap, [messageId]: feedback });
            } catch (error) {
                console.error('Failed to update feedback:', error);
            }
        }
    };

    const handleSpeakAloud = (text: string | Record<string, any>[], messageId: string) => {
        if (isSpeaking === messageId) {
            window.speechSynthesis.cancel();
            setIsSpeaking(null);
        } else {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(typeof text === 'string' ? text : JSON.stringify(text));
            window.speechSynthesis.speak(utterance);

            utterance.onend = () => {
                setIsSpeaking(null);
            };

            setIsSpeaking(messageId);
        }
    };

    const handleCopy = (message: Message) => {
        let textToCopy = "";
        if (typeof message.answer.content === 'string') {
            textToCopy = message.answer.content;
        } else if (Array.isArray(message.answer.content) || typeof message.answer.content === 'object') {
            textToCopy = JSON.stringify(message.answer.content, null, 2);
        }
        clipboard.copy(textToCopy);
    };

    return (
        <>
            {messages.map((message) => (
                <div key={message.message_id}>
                    {/* Render the question based on its type */}
                    <Flex justify="flex-end" mb="md">
                        {message.question.type === 'AUDIO' ? (
                            <audio controls>
                                <source src={`data:audio/webm;base64,${message.question.content}`} type="audio/webm" />
                                Your browser does not support the audio element.
                            </audio>
                        ) : (
                            <MessageCard type="question" content={message.question.content} messageType={message.question.type} />
                        )}
                    </Flex>

                    <div
                        onMouseEnter={() => setHoveredMessageId(message.message_id)}
                        onMouseLeave={() => setHoveredMessageId(null)}
                        style={{ position: 'relative' }}
                    >
                        <Flex justify="flex-start">
                            <IconRobot size={20} style={{ marginRight: 10, marginTop: 10 }} />
                            <MessageCard type="answer" content={message.answer.content} messageType={message.answer.type} />
                        </Flex>

                        {hoveredMessageId === message.message_id && (
                            <Paper withBorder w={'fit-content'} radius={'lg'} p={'xs'}>
                                <Group justify="left">
                                    <Tooltip label="Like" withArrow position='bottom'>
                                        <ActionIcon
                                            bd={0}
                                            variant={feedbackMap[message.message_id] === 'LIKE' ? 'default' : 'outline'}
                                            onClick={() => handleFeedback(message.message_id, 'LIKE')}
                                            size={'xs'}
                                        >
                                            <IconThumbUp />
                                        </ActionIcon>
                                    </Tooltip>
                                    <Tooltip label="Dislike" withArrow position='bottom'>
                                        <ActionIcon
                                            bd={0}
                                            variant={feedbackMap[message.message_id] === 'DISLIKE' ? 'default' : 'outline'}
                                            onClick={() => handleFeedback(message.message_id, 'DISLIKE')}
                                            size={'xs'}
                                        >
                                            <IconThumbDown />
                                        </ActionIcon>
                                    </Tooltip>

                                    {/* Check for answer type before enabling copy */}
                                    {message.answer.type !== 'IMAGE' && (
                                        <Tooltip label="Copy to clipboard" withArrow position='bottom'>
                                            <ActionIcon
                                                onClick={() => handleCopy(message)}
                                                color={clipboard.copied ? 'green' : 'gray'}
                                                variant='outline'
                                                bd={0}
                                                size={'xs'}
                                            >
                                                <IconCopy />
                                            </ActionIcon>
                                        </Tooltip>
                                    )}
                                    {message.answer.type !== 'IMAGE' && (
                                        <Tooltip label={isSpeaking === message.message_id ? "Stop" : "Speak aloud"} withArrow position='bottom'>
                                            <ActionIcon
                                                variant='outline'
                                                bd={0}
                                                size={'xs'}
                                                onClick={() => handleSpeakAloud(message.answer.content, message.message_id)}
                                            >
                                                {isSpeaking === message.message_id ? <IconVolumeOff /> : <IconVolume />}
                                            </ActionIcon>
                                        </Tooltip>
                                    )}
                                </Group>
                            </Paper>
                        )}
                    </div>
                </div>
            ))}
        </>
    );
}
