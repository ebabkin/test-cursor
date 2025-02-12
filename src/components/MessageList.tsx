import { Box } from '@mui/material';
import { MessageV2 } from '../types/channel';
import MessageBubble from './MessageBubble';
import { useEffect, useRef } from 'react';

interface MessageListProps {
  messages: MessageV2[];
  currentUserId: string;
}

export default function MessageList({ messages, currentUserId }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <Box sx={{ 
      flex: 1, 
      overflow: 'auto',
      p: 2,
      display: 'flex',
      flexDirection: 'column',
      gap: 1
    }}>
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isOwnMessage={message.user_id === currentUserId}
        />
      ))}
      <div ref={bottomRef} />
    </Box>
  );
} 