import React, { useState } from 'react';
import { Button, Modal, TextInput, Group, ActionIcon } from '@mantine/core';
import { IconEdit, IconPencilPlus } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { createConversation } from '../../lib/api';
import { useSession } from 'next-auth/react';
import { theme } from '../../../theme';

interface NewChatButtonProps {
    onChatCreated: () => void;  // Callback to trigger a refetch in parent
}

export function NewChatButton({ onChatCreated }: NewChatButtonProps) {
    const [opened, setOpened] = useState(false);
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const { data: session } = useSession();
    const router = useRouter();

    const handleCreateConversation = async () => {
        if (!title.trim()) return;

        setLoading(true);
        try {
            const { conversation_id } = await createConversation(title, session?.accessToken!);
            setOpened(false);  // Close modal on success
            router.push(`/chat/${conversation_id}`);  // Redirect to the new chat
            onChatCreated();   // Trigger the parent to refetch conversations
        } catch (error) {
            console.error('Error creating conversation:', error);
        } finally {
            setTitle('');
            setLoading(false);
        }
    };

    return (
        <>
            <Modal
                opened={opened}
                onClose={() => setOpened(false)}
                title="Create New Conversation"
                centered
            >
                <TextInput
                    label="Chat Title"
                    placeholder="Enter chat title"
                    value={title}
                    onChange={(e) => setTitle(e.currentTarget.value)}
                    disabled={loading}
                />
                <Group justify="flex-end" mt="md">
                    <Button onClick={handleCreateConversation} loading={loading} color={theme?.colors?.mowasalatColor?.[7]}>
                        Create Chat
                    </Button>
                </Group>
            </Modal>

            <ActionIcon
                variant='subtle'
                onClick={() => setOpened(true)}
            >
                <IconEdit size={20} />
            </ActionIcon>
        </>
    );
}
