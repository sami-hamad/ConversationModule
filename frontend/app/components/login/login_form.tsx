'use client'
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  TextInput,
  PasswordInput,
  Anchor,
  Paper,
  Title,
  Text,
  Container,
  Group,
  Button,
  Box,
  useMantineTheme,
} from '@mantine/core';
import { IconAt } from '@tabler/icons-react';
import Image from 'next/image';
import MyLogo from '../../../public/images/MowasalatLogo.svg';
import { theme } from '../../../theme';
export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await signIn('credentials', {
      redirect: false,  // Disable NextAuth automatic redirection
      username: email,
      password: password,
    });

    if (result?.error) {
      setError("The Username or Password is incorrect");
    } else {
      // Check if a redirect URL is provided, otherwise default to dashboard
      const redirectUrl = searchParams.get('redirect') || '/';
      router.push(redirectUrl);  // Redirect to the intended URL or dashboard
    }
  };

  return (
    <Container
      style={{
        width: '100%',
        maxWidth: '500px',
        margin: '0 auto',
        padding: '20px',
      }}
      my={40}
    >
      <Paper withBorder shadow="md" p={30} radius="md">
        <Image src={MyLogo} alt="My Logo" width={400} height={80} />
        <Box mb="md">
          <Text size="lg" fw={500} ta="left" color="dimmed">
            Welcome!
          </Text>
          <Title ta="left" order={2} mt="xs">
            Login
          </Title>
        </Box>

        <form onSubmit={handleSubmit}>
          <TextInput
            label="E-Mail or Username"
            placeholder="Your email or username"
            required
            rightSection={<IconAt size={16} />}
            radius="xl"
            size="md"
            mt="md"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <PasswordInput
            label="Password"
            placeholder="Your password"
            required
            radius="xl"
            size="md"
            mt="md"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <Text color="red" size="sm" mt="sm">
              {error}
            </Text>
          )}

          <Button fullWidth mt="xl" radius="xl" size="md" type="submit" color={theme?.colors?.mowasalatColor?.[7]}>
            Sign In
          </Button>
        </form>

        <Text size="sm" mt="md" color="dimmed">
          Forgot your password?{' '}
          <Anchor size="sm" component="button">
            <span style={{ color: theme?.colors?.mowasalatColor?.[4] }}>
              Click here
            </span>
          </Anchor>
        </Text>
      </Paper>
    </Container >
  );
}
