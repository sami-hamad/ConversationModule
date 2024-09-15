'use client'
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Player } from '@lottiefiles/react-lottie-player';
import Loading from './components/loading/loading';
import { Text, Title, Button, Image, Container, Group } from '@mantine/core';
import { NewChatButton } from './components/buttons/new_chat_button';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [shouldRefetch, setShouldRefetch] = useState(false); // State to trigger refetch in ChatList

  if (status === 'loading') {
    return <Loading />;
  }

  const handleChatCreated = () => {
    setShouldRefetch(true); // Trigger refetch in ChatList
  };

  return (
    <Container style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh', // Full viewport height to center vertically
      textAlign: 'center', // Center the text
    }}>      <div style={{ flex: 1, maxWidth: '60%' }}>
        <Title mt={50}>Mowasalat Qatar Employee Insights Bot</Title>
        <Text fw={500} fz="lg" mb={5}>
          Your Key to Real-Time KPIs and Data Exploration
        </Text>
        <Text fz="sm" c="dimmed" mb={20}>
          Unlock powerful insights with the Mowasalat Qatar Bot, designed exclusively for employees. From tracking KPIs to exploring operational data, the bot delivers real-time analytics at your fingertips. Start a new chat now to dive into the data that drives success!
        </Text>
        <Group justify='center'>
          <Text ta={'center'}>Create a new Chat!</Text>
          <NewChatButton onChatCreated={handleChatCreated} />
        </Group>
      </div>

      <Image
        src="https://img.freepik.com/free-vector/ai-powered-content-creation-isometric-composition-with-human-characters-cute-robot-generating-art-computer-screen-3d-vector-illustration_1284-82522.jpg?t=st=1726393333~exp=1726396933~hmac=30b8789223b3893d192d2695524236a977192ba21b97e86f22701c41da94a138&w=900"
        style={{ height: '400px', width: '400px', marginLeft: '40px' }}
      />
    </Container>
  );
}
