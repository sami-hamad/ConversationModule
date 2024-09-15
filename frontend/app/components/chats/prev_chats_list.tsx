import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { getConversations, deleteConversation } from '../../lib/api';
import { NavLink, Stack, Text, Menu, Modal, Button, Group } from '@mantine/core';
import { useRouter, usePathname } from 'next/navigation';
import { IconDotsVertical, IconTrash } from '@tabler/icons-react';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

interface Conversation {
    conversation_id: string;
    title: string;
    last_interaction: string;
}

interface ChatListProps {
    shouldRefetch: boolean;
    setShouldRefetch: (value: boolean) => void;
}

// Utility function to categorize conversations
const categorizeConversations = (conversations: Conversation[], startDate: dayjs.Dayjs, endDate?: dayjs.Dayjs) => {
    return conversations.filter(convo => {
        const interactionDate = dayjs(convo.last_interaction);
        return interactionDate.isSameOrAfter(startDate) && (!endDate || interactionDate.isBefore(endDate));
    });
};

export default function ChatList({ shouldRefetch, setShouldRefetch }: ChatListProps) {
    const { data: session, status } = useSession();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [hoveredConversation, setHoveredConversation] = useState<string | null>(null);
    const [confirmModal, setConfirmModal] = useState(false);
    const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
    const [menuOpenForConversation, setMenuOpenForConversation] = useState<string | null>(null);
    const router = useRouter();
    const pathname = usePathname();

    const fetchConversations = async () => {
        if (session?.accessToken) {
            try {
                const convos = await getConversations(session.accessToken);
                setConversations(convos);
            } catch (error) {
                console.error('Error fetching conversations:', error);
            }
        }
    };

    useEffect(() => {
        if (status === 'authenticated') {
            fetchConversations();
        }
    }, [status, session]);

    useEffect(() => {
        if (shouldRefetch) {
            fetchConversations();
            setShouldRefetch(false);
        }
    }, [shouldRefetch]);

    // Define time ranges
    const today = dayjs().startOf('day');
    const yesterday = dayjs().subtract(1, 'day').startOf('day');
    const sevenDaysAgo = dayjs().subtract(7, 'day').startOf('day');
    const thirtyDaysAgo = dayjs().subtract(30, 'day').startOf('day');
    const oneYearAgo = dayjs().subtract(1, 'year').startOf('day');

    // Categorize conversations using the utility function
    const todayConversations = categorizeConversations(conversations, today);
    const yesterdayConversations = categorizeConversations(conversations, yesterday, today);
    const previousWeekConversations = categorizeConversations(conversations, sevenDaysAgo, yesterday);
    const previousMonthConversations = categorizeConversations(conversations, thirtyDaysAgo, sevenDaysAgo);
    const previousYearConversations = categorizeConversations(conversations, oneYearAgo, thirtyDaysAgo);

    const handleChatClick = (conversationId: string) => {
        router.push(`/chat/${conversationId}`);
    };

    const handleDelete = async () => {
        if (selectedConversation && session?.accessToken) {
            try {
                await deleteConversation(selectedConversation, session.accessToken);
                setConfirmModal(false);
                setMenuOpenForConversation(null);
                fetchConversations();
                if (conversations.length > 1) {
                    const nextConversation = conversations.find(convo => convo.conversation_id !== selectedConversation);
                    router.push(`/chat/${nextConversation?.conversation_id}`);
                } else {
                    router.push('/');
                }
            } catch (error) {
                console.error('Error deleting conversation:', error);
            }
        }
    };

    const renderConversations = (title: string, conversationList: Conversation[]) => (
        <>
            {conversationList.length > 0 && (
                <div>
                    <Text size="xs" mb={10}>{title}</Text>
                    {conversationList.map((conversation) => (
                        <div
                            key={conversation.conversation_id}
                            onMouseEnter={() => setHoveredConversation(conversation.conversation_id)}
                            onMouseLeave={() => setHoveredConversation(null)}
                            style={{ position: 'relative' }}
                        >
                            <NavLink
                                color={'black'}
                                label={conversation.title}
                                active={pathname === `/chat/${conversation.conversation_id}`}
                                onClick={() => handleChatClick(conversation.conversation_id)}
                                p={5}
                            />
                            {(hoveredConversation === conversation.conversation_id || menuOpenForConversation === conversation.conversation_id) && (
                                <Menu
                                    withinPortal
                                    position="right-start"
                                    opened={menuOpenForConversation === conversation.conversation_id}
                                    onOpen={() => setMenuOpenForConversation(conversation.conversation_id)}
                                    onClose={() => setMenuOpenForConversation(null)}
                                >
                                    <Menu.Target>
                                        <IconDotsVertical
                                            style={{
                                                position: 'absolute',
                                                right: 10,
                                                top: 5,
                                                cursor: 'pointer',
                                            }}
                                        />
                                    </Menu.Target>
                                    <Menu.Dropdown>
                                        <Menu.Item
                                            rightSection={<IconTrash size={14} />}
                                            color="red"
                                            onClick={() => {
                                                setSelectedConversation(conversation.conversation_id);
                                                setConfirmModal(true);
                                            }}
                                        >
                                            Delete
                                        </Menu.Item>
                                    </Menu.Dropdown>
                                </Menu>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </>
    );

    return (
        <div>
            <Stack gap="xs">
                {renderConversations("Today", todayConversations)}
                {renderConversations("Yesterday", yesterdayConversations)}
                {renderConversations("Previous 7 Days", previousWeekConversations)}
                {renderConversations("Previous 30 Days", previousMonthConversations)}
                {renderConversations("Previous Year", previousYearConversations)}
            </Stack>

            <Modal
                centered
                opened={confirmModal}
                onClose={() => setConfirmModal(false)}
                title="Confirm Deletion"
            >
                <p>Are you sure you want to delete this conversation?</p>
                <Group justify="center">
                    <Button color="gray" onClick={() => setConfirmModal(false)}>Cancel</Button>
                    <Button color="red" onClick={handleDelete}>Delete</Button>
                </Group>
            </Modal>
        </div>
    );
}
