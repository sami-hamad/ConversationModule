import React, { useState, useRef } from 'react';
import { Textarea, Button, Group, ActionIcon, rem } from '@mantine/core';
import { sendMessage, getMessages } from '../../lib/api';
import { IconArrowUp, IconMicrophone } from '@tabler/icons-react';
import { theme } from '../../../theme';
import classes from './disabled_sendbtn.module.css'
interface MessageInputProps {
    conversationId: string;
    sessionToken: string;
    onMessageSent: (newMessages: any) => void;
    onWaitingMessage: (waitingMessage: any) => void;
}

export default function MessageInput({ conversationId, sessionToken, onMessageSent, onWaitingMessage }: MessageInputProps) {
    const [messageText, setMessageText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const handleSendMessage = async () => {
        if (!messageText.trim()) return;

        setIsLoading(true);

        // Show the user's question immediately
        const waitingMessage = {
            message_id: 'waiting', // Temporary ID
            question: messageText,
            answer: 'Waiting for response...',
            type: 'TEXT',
        };
        onWaitingMessage(waitingMessage);

        try {
            const { message_id, answer, type } = await sendMessage(conversationId, "TEXT", messageText, sessionToken);
            const newMessages = await getMessages(conversationId, sessionToken);
            setMessageText('');
            onMessageSent(newMessages);
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRecordVoiceMessage = () => {
        if (isRecording) {
            mediaRecorderRef.current?.stop();
            setIsRecording(false);
        } else {
            navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
                const mediaRecorder = new MediaRecorder(stream);
                mediaRecorderRef.current = mediaRecorder;

                mediaRecorder.ondataavailable = (event) => {
                    audioChunksRef.current.push(event.data);
                };

                mediaRecorder.onstop = async () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    audioChunksRef.current = [];
                    const reader = new FileReader();
                    reader.onloadend = async () => {
                        let base64Audio = reader.result as string;

                        // Remove the "data:audio/webm;base64," prefix
                        base64Audio = base64Audio.split(',')[1];

                        setIsLoading(true);
                        try {
                            const { message_id, answer } = await sendMessage(conversationId, "AUDIO", base64Audio, sessionToken);
                            const newMessages = await getMessages(conversationId, sessionToken);
                            onMessageSent(newMessages);
                        } catch (error) {
                            console.error('Error sending voice message:', error);
                        } finally {
                            setIsLoading(false);
                        }
                    };
                    reader.readAsDataURL(audioBlob); // Convert Blob to base64
                };

                mediaRecorder.start();
                setIsRecording(true);
            });
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey && !isLoading && !isRecording) {
            event.preventDefault(); // Prevent the default behavior of creating a new line
            handleSendMessage();
        }
    };

    return (
        <Group gap="apart" style={{ padding: '10px', scrollbarWidth: 'thin' }} className="textarea-wrapper">
            <Textarea
                variant="filled"
                placeholder="Type your message..."
                onChange={(e) => setMessageText(e.currentTarget.value)}
                onKeyDown={handleKeyDown} // Add the keydown event here
                disabled={isLoading || isRecording} // Disable input while recording or loading
                style={{ flexGrow: 1 }}
                autosize
                minRows={1}
                maxRows={4}
                value={messageText}
                radius="xl"
                size="md"
                rightSection={
                    <Group gap="xs"> {/* Group to align icons horizontally */}
                        <ActionIcon
                            size={25}
                            radius="xl"
                            color={isRecording ? 'red' : theme.primaryColor}
                            variant="filled"
                            onClick={handleRecordVoiceMessage}
                            disabled={isLoading}
                        >
                            <IconMicrophone style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
                        </ActionIcon>
                        <ActionIcon
                            size={25}
                            radius="xl"
                            color={theme.primaryColor}
                            variant="filled"
                            onClick={handleSendMessage}
                            disabled={isLoading || messageText.trim() === ''}
                            className={classes.button}
                        >
                            <IconArrowUp style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
                        </ActionIcon>
                    </Group>
                }
                rightSectionWidth={80} // Increase this value to accommodate both icons
            />
        </Group>
    );
}
