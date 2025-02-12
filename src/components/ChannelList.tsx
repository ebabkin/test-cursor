import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Channel } from '../types/channel';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  Typography,
  Alert,
  Paper,
} from '@mui/material';

interface ChannelListProps {
  onChannelSelect: (channel: Channel) => void;
  selectedChannelId?: string;
}

export const ChannelList: React.FC<ChannelListProps> = ({ onChannelSelect, selectedChannelId }) => {
  const { data: session } = useSession();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  useEffect(() => {
    if (session) {
      fetchChannels();
    }
  }, [session]);

  const fetchChannels = async () => {
    try {
      const response = await fetch('/api/v2/channels');
      if (!response.ok) throw new Error('Failed to fetch channels');
      const data = await response.json();
      setChannels(data);
    } catch (error) {
      setError('Failed to load channels');
      console.error(error);
    }
  };

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/v2/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, is_private: isPrivate }),
      });
      
      if (!response.ok) throw new Error('Failed to create channel');
      
      const newChannel = await response.json();
      setChannels([...channels, newChannel]);
      setIsCreateModalOpen(false);
      setTitle('');
      setDescription('');
      setIsPrivate(false);
      setError(null);
    } catch (error) {
      setError('Failed to create channel');
      console.error(error);
    }
  };

  const handleJoinChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/v2/channels/join-by-code/${joinCode}`, {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Failed to join channel');
      
      await fetchChannels(); // Refresh channel list
      setIsJoinModalOpen(false);
      setJoinCode('');
      setError(null);
    } catch (error) {
      setError('Failed to join channel');
      console.error(error);
    }
  };

  if (!session) {
    return null;
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create Channel
          </Button>
          <Button
            variant="contained"
            color="success"
            fullWidth
            onClick={() => setIsJoinModalOpen(true)}
          >
            Join Channel
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      )}

      <List sx={{ flex: 1, overflow: 'auto' }}>
        {channels.map((channel) => (
          <ListItem
            key={channel.id}
            onClick={() => onChannelSelect(channel)}
            selected={channel.id === selectedChannelId}
            button
          >
            <ListItemText
              primary={channel.title}
              secondary={channel.description}
            />
          </ListItem>
        ))}
      </List>

      {/* Create Channel Dialog */}
      <Dialog open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
        <DialogTitle>Create Channel</DialogTitle>
        <form onSubmit={handleCreateChannel}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                fullWidth
              />
              <TextField
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                multiline
                rows={3}
                fullWidth
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                  />
                }
                label="Private Channel"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Create
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Join Channel Dialog */}
      <Dialog open={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)}>
        <DialogTitle>Join Channel</DialogTitle>
        <form onSubmit={handleJoinChannel}>
          <DialogContent>
            <TextField
              label="Channel Code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Enter 6-character code"
              inputProps={{ pattern: '[A-Z0-9]{6}' }}
              required
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsJoinModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="success">
              Join
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}; 