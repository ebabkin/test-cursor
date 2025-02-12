import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Channel } from '../types/channel';
import { ChannelList } from '../components/ChannelList';
import { ChatInterface } from '../components/ChatInterface';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
} from '@mui/material';

export default function Home() {
  const router = useRouter();
  const { data: session } = useSession();
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const { channelId } = router.query;

  useEffect(() => {
    if (channelId && typeof channelId === 'string' && session) {
      fetchChannel(channelId);
    }
  }, [channelId, session]);

  const fetchChannel = async (id: string) => {
    try {
      const response = await fetch(`/api/v2/channels/${id}`);
      if (response.ok) {
        const channel = await response.json();
        setSelectedChannel(channel);
      } else {
        // Handle errors (e.g., not a member, channel doesn't exist)
        console.error('Failed to fetch channel');
        setSelectedChannel(null);
      }
    } catch (error) {
      console.error('Error fetching channel:', error);
      setSelectedChannel(null);
    }
  };

  const handleChannelSelect = (channel: Channel) => {
    router.push(`/?channelId=${channel.id}`, undefined, { shallow: true });
    setSelectedChannel(channel);
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Panel */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Chat App
          </Typography>
          {session ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography>
                Signed in as {session.user?.email}
              </Typography>
              <Button color="inherit" onClick={() => signOut()}>
                Sign Out
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button color="inherit" onClick={() => signIn()}>
                Sign In
              </Button>
              <Button color="inherit" onClick={() => signIn()}>
                Sign Up
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Channel List (30%) */}
        <Box sx={{ width: '30%', borderRight: 1, borderColor: 'divider' }}>
          <ChannelList
            onChannelSelect={handleChannelSelect}
            selectedChannelId={selectedChannel?.id}
          />
        </Box>

        {/* Chat Interface (70%) */}
        <Box sx={{ width: '70%' }}>
          <ChatInterface channel={selectedChannel} />
        </Box>
      </Box>
    </Box>
  );
} 