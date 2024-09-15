import React from 'react';
import { Box, Text } from '@mantine/core';

interface ChatErrorProps {
    error: string;
}

export default function ChatError({ error }: ChatErrorProps) {
    return (
        <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <Text color="red" size="lg" ta="center">
                {error}
            </Text>
        </Box>
    );
}
