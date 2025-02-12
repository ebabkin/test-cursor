import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Channel, MessageV2 } from '../types/channel';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Alert,
  Paper,
  IconButton,
  InputAdornment,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

interface ChatInterfaceProps {
  channel: Channel | null;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ channel }) => {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<MessageV2[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [userIdentifier, setUserIdentifier] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (channel) {
      fetchMessages();
    } else {
      setMessages([]);
    }
  }, [channel]);

  const fetchMessages = async () => {
    if (!channel) return;
    try {
      const response = await fetch(`/api/v2/channels/${channel.id}/messages`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setMessages(data);
      scrollToBottom();
    } catch (error) {
      setError('Failed to load messages');
      console.error(error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channel || !newMessage.trim()) return;

    try {
      const response = await fetch(`/api/v2/channels/${channel.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const message = await response.json();
      setMessages([...messages, message]);
      setNewMessage('');
      setError(null);
      scrollToBottom();
    } catch (error) {
      setError('Failed to send message');
      console.error(error);
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channel) return;

    try {
      const response = await fetch(`/api/v2/channels/${channel.id}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIdentifier }),
      });

      if (!response.ok) throw new Error('Failed to invite user');

      setIsInviteModalOpen(false);
      setUserIdentifier('');
      setError(null);
    } catch (error) {
      setError('Failed to invite user');
      console.error(error);
    }
  };

  const handleLeaveChannel = async () => {
    if (!channel) return;

    try {
      const response = await fetch(`/api/v2/channels/${channel.id}/leave`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to leave channel');

      window.location.href = '/'; // Redirect to home page
    } catch (error) {
      setError('Failed to leave channel');
      console.error(error);
    }
  };

  if (!session || !channel) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography color="text.secondary">
          Select a channel to start chatting
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Channel Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6">{channel.title}</Typography>
        <Box>
          <IconButton
            color="primary"
            onClick={() => setIsInviteModalOpen(true)}
            sx={{ mr: 1 }}
          >
            <PersonAddIcon />
          </IconButton>
          <IconButton color="error" onClick={() => setIsLeaveModalOpen(true)}>
            <ExitToAppIcon />
          </IconButton>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      )}

      {/* Messages */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {messages.map((message) => (
          <Box
            key={message.id}
            sx={{
              mb: 2,
              display: 'flex',
              justifyContent: message.user_id === session.user.id ? 'flex-end' : 'flex-start',
            }}
          >
            <Paper
              elevation={1}
              sx={{
                maxWidth: '70%',
                p: 2,
                bgcolor: message.user_id === session.user.id ? 'primary.main' : 'grey.100',
                color: message.user_id === session.user.id ? 'white' : 'text.primary',
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                {message.user_id === session.user.id ? 'You' : message.user_id}
              </Typography>
              <Typography>{message.content}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mt: 0.5 }}>
                {new Date(message.creation_date).toLocaleString()}
              </Typography>
            </Paper>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      {/* Message Input */}
      <Box component="form" onSubmit={handleSendMessage} sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <TextField
          fullWidth
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          variant="outlined"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  type="submit"
                  disabled={!newMessage.trim()}
                  color="primary"
                >
                  <SendIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Invite User Dialog */}
      <Dialog open={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)}>
        <DialogTitle>Add User</DialogTitle>
        <form onSubmit={handleInviteUser}>
          <DialogContent>
            <TextField
              label="User Email or Nickname"
              value={userIdentifier}
              onChange={(e) => setUserIdentifier(e.target.value)}
              required
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsInviteModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Add
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Leave Channel Dialog */}
      <Dialog open={isLeaveModalOpen} onClose={() => setIsLeaveModalOpen(false)}>
        <DialogTitle>Leave Channel</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to leave this channel?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsLeaveModalOpen(false)}>Cancel</Button>
          <Button onClick={handleLeaveChannel} variant="contained" color="error">
            Leave
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 