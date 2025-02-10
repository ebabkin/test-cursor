import { useState } from 'react';
import { Box, Paper, TextField, IconButton, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MessageList from './MessageList';
import { Message } from '../types/chat';
import { useAuth } from '../contexts/AuthContext';

export default function ChatInterface() {
  const { user, token, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    if (!isAuthenticated) {
      setError('You must be logged in to send messages');
      return;
    }

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
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: newMessage }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      
      // Add system response
      const systemMessage: Message = {
        id: Date.now() + 1,
        text: data.response,
        sender: 'system',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, systemMessage]);
      setError(null);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    }

    setNewMessage('');
  };

  return (
    <Paper elevation={3} sx={{ flex: 1, display: 'flex', flexDirection: 'column', m: 2 }}>
      <MessageList messages={messages} />
      {error && (
        <Typography color="error" sx={{ px: 2, py: 1 }}>
          {error}
        </Typography>
      )}
      <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder={isAuthenticated ? "Type a message..." : "Please log in to send messages"}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          disabled={!isAuthenticated}
          inputProps={{
            'data-testid': 'message-input'
          }}
        />
        <IconButton 
          color="primary" 
          onClick={handleSend}
          disabled={!isAuthenticated}
          data-testid="send-button"
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Paper>
  );
} 