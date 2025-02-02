import { Box } from '@mui/material';
import MessageBubble from './MessageBubble';
import { Message } from '../types/chat';
import { useEffect, useRef } from 'react';

interface MessageListProps {
  messages: Message[];
}

export default function MessageList({ messages }: MessageListProps) {
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <Box sx={{ 
      flex: 1, 
      overflowY: 'auto',
      p: 2,
      display: 'flex',
      flexDirection: 'column',
      gap: 1
    }}>
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      <div ref={messagesEndRef} />
    </Box>
  );
} 