import { useState } from 'react';
import { Box, Paper, TextField, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MessageList from './MessageList';
import { Message } from '../types/chat';
import { useAuth } from '../contexts/AuthContext';

export default function ChatInterface() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: newMessage,
          user: user || undefined
        }),
      });

      const data = await response.json();
      
      // Add system response
      const systemMessage: Message = {
        id: Date.now() + 1,
        text: data.response,
        sender: 'system',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, systemMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    }

    setNewMessage('');
  };

  return (
    <Paper elevation={3} sx={{ flex: 1, display: 'flex', flexDirection: 'column', m: 2 }}>
      <MessageList messages={messages} />
      <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          inputProps={{
            'data-testid': 'message-input'
          }}
        />
        <IconButton 
          color="primary" 
          onClick={handleSend}
          data-testid="send-button"
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Paper>
  );
} 