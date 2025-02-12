import { Box, Typography } from '@mui/material';
import AuthHeader from '../components/AuthHeader';
import ChannelList from '../components/ChannelList';
import { AuthProvider } from '../contexts/AuthContext';

export default function Home() {
  return (
    <AuthProvider>
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AuthHeader />
        <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <Box sx={{ width: '30%', borderRight: 1, borderColor: 'divider' }}>
            <ChannelList />
          </Box>
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography color="text.secondary">
              Select a channel to start chatting
            </Typography>
          </Box>
        </Box>
      </Box>
    </AuthProvider>
  );
} 