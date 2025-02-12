import { Paper, Typography } from '@mui/material';
import { MessageV2 } from '../types/channel';

interface MessageBubbleProps {
  message: MessageV2;
  isOwnMessage: boolean;
}

export default function MessageBubble({ message, isOwnMessage }: MessageBubbleProps) {
  return (
    <Paper
      elevation={1}
      sx={{
        p: 1,
        maxWidth: '70%',
        alignSelf: isOwnMessage ? 'flex-end' : 'flex-start',
        backgroundColor: isOwnMessage ? 'primary.light' : 'grey.100',
      }}
    >
      <Typography>{message.content}</Typography>
    </Paper>
  );
} 