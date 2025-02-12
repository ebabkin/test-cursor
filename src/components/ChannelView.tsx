import { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Menu, MenuItem } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { useAuth } from '../contexts/AuthContext';
import { Channel, MessageV2 } from '../types/channel';
import AddUserModal from './modals/AddUserModal';
import LeaveChannelModal from './modals/LeaveChannelModal';
import { useRouter } from 'next/router';

interface ChannelViewProps {
  channelId: string;
}

export default function ChannelView({ channelId }: ChannelViewProps) {
  const [channel, setChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<MessageV2[]>([]);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const { token, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (channelId) {
      fetchChannel();
      fetchMessages();
    }
  }, [channelId]);

  const fetchChannel = async () => {
    try {
      const response = await fetch(`/api/v2/channels/${channelId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setChannel(data);
      } else if (response.status === 403) {
        router.push('/');
      }
    } catch (error) {
      console.error('Error fetching channel:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/v2/channels/${channelId}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data.reverse()); // Display newest last
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async (content: string) => {
    try {
      const response = await fetch(`/api/v2/channels/${channelId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content })
      });

      if (response.ok) {
        const newMessage = await response.json();
        setMessages(prev => [...prev, newMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleLeaveChannel = async () => {
    try {
      await fetch(`/api/v2/channels/${channelId}/leave`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      router.push('/');
    } catch (error) {
      console.error('Error leaving channel:', error);
    }
  };

  if (!channel) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>Loading channel...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ 
        p: 2, 
        borderBottom: 1, 
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Typography variant="h6">{channel.title}</Typography>
        <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)}>
          <MoreVertIcon />
        </IconButton>
      </Box>

      <MessageList messages={messages} currentUserId={user?.id} />
      <MessageInput onSend={handleSendMessage} />

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={() => {
          setAddUserOpen(true);
          setMenuAnchor(null);
        }}>
          Add User
        </MenuItem>
        <MenuItem onClick={() => {
          setLeaveOpen(true);
          setMenuAnchor(null);
        }}>
          Leave Channel
        </MenuItem>
      </Menu>

      <AddUserModal
        open={addUserOpen}
        onClose={() => setAddUserOpen(false)}
        channelId={channelId}
      />
      <LeaveChannelModal
        open={leaveOpen}
        onClose={() => setLeaveOpen(false)}
        onConfirm={handleLeaveChannel}
        channelTitle={channel.title}
      />
    </Box>
  );
} 