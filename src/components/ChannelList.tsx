import { useState, useEffect } from 'react';
import { List, ListItem, ListItemText, Button, Box, Typography } from '@mui/material';
import { Channel } from '../types/channel';
import CreateChannelModal from './modals/CreateChannelModal';
import JoinChannelModal from './modals/JoinChannelModal';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';

export default function ChannelList() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      fetchChannels();
    }
  }, [isAuthenticated]);

  const fetchChannels = async () => {
    try {
      const response = await fetch('/api/v2/channels', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setChannels(data);
      }
    } catch (error) {
      console.error('Error fetching channels:', error);
    }
  };

  const handleChannelClick = (channelId: string) => {
    router.push(`/channels/${channelId}`);
  };

  if (!isAuthenticated) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="text.secondary">
          Please log in to view channels
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ p: 1, display: 'flex', gap: 1 }}>
        <Button 
          variant="contained" 
          onClick={() => setCreateModalOpen(true)}
          size="small"
        >
          Create Channel
        </Button>
        <Button 
          variant="outlined" 
          onClick={() => setJoinModalOpen(true)}
          size="small"
        >
          Join Channel
        </Button>
      </Box>
      
      <List sx={{ flex: 1, overflow: 'auto' }}>
        {channels.map((channel) => (
          <ListItem 
            key={channel.id}
            button
            onClick={() => handleChannelClick(channel.id)}
          >
            <ListItemText 
              primary={channel.title}
              secondary={channel.last_message_preview || 'No messages yet'}
            />
          </ListItem>
        ))}
      </List>

      <CreateChannelModal 
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onChannelCreated={fetchChannels}
      />
      <JoinChannelModal 
        open={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
        onChannelJoined={fetchChannels}
      />
    </Box>
  );
} 