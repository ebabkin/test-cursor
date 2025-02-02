import { Paper, Typography } from '@mui/material';
import { Message } from '../types/chat';

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.sender === 'user';

  return (
    <Paper
      elevation={1}
      sx={{
        p: 1,
        maxWidth: '70%',
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        backgroundColor: isUser ? 'primary.light' : 'grey.100',
      }}
    >
      <Typography>{message.text}</Typography>
    </Paper>
  );
} 