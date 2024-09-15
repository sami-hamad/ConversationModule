import React from 'react';
import { Card, Text, Table, Image } from '@mantine/core';
import { theme } from '../../../theme';

interface MessageCardProps {
    type: 'question' | 'answer';
    content: string | Record<string, any>[] | null;
    messageType?: 'TEXT' | 'DICT' | 'IMAGE' | 'AUDIO';
}

const renderTable = (data: Record<string, any>[]) => {
    if (data.length === 0) return null;

    const headers = Object.keys(data[0]);

    return (
        <div
            style={{
                maxHeight: 400, overflowY: 'auto', minHeight: 'auto',
                scrollbarWidth: 'thin', height: 'auto', overflowX: 'auto'
            }}>

            <Table highlightOnHoverColor={theme?.colors?.greyAccent?.[2]} highlightOnHover withTableBorder withColumnBorders
                captionSide="bottom"
                horizontalSpacing="md"
                verticalSpacing="sm"
                fs="sm"
            >
                <Table.Thead>
                    <Table.Tr>
                        {headers.map((header, index) => (
                            <Table.Th key={index}>{header}</Table.Th>
                        ))}
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {data.map((row, rowIndex) => (
                        <Table.Tr key={rowIndex}>
                            {headers.map((header, colIndex) => (
                                <Table.Td key={colIndex}>{row[header]}</Table.Td>
                            ))}
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
        </div>
    );
};

export default function MessageCard({ type, content, messageType }: MessageCardProps) {
    const backgroundColor = type === 'question' ? '#f0f0f0' : '#ffffff';
    const textAlign = type === 'question' ? 'right' : 'left';

    return (
        <Card
            padding="xs"
            radius="xl"
            style={{
                minHeight: 'auto',
                height: 'auto',
                backgroundColor, maxWidth: '70%',
            }}>
            {messageType === 'TEXT' && typeof content === 'string' ? (
                <Text size="sm" ta={textAlign} style={{ whiteSpace: 'pre-wrap' }}>
                    {content}
                </Text>
            ) : content !== null && typeof content === 'object' && messageType === 'DICT' && !Array.isArray(content) ? (
                renderTable([content])
            ) : content !== null && Array.isArray(content) && messageType === 'DICT' ? (
                renderTable(content)
            ) : messageType === 'IMAGE' && typeof content === 'string' ? (
                <Image src={`data:image/png;base64,${content}`} alt="Image" style={{ maxWidth: '100%' }} />
            ) : messageType === 'AUDIO' && typeof content === 'string' ? (
                <audio controls>
                    <source src={`data:audio/webm;base64,${content}`} type="audio/webm" />
                    Your browser does not support the audio element.
                </audio>
            ) : null}
        </Card>
    );
}
