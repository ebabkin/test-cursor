import { Box } from '@mui/material';
import { useRouter } from 'next/router';
import AuthHeader from '../../components/AuthHeader';
import ChannelList from '../../components/ChannelList';
import ChannelView from '../../components/ChannelView';
import { AuthProvider } from '../../contexts/AuthContext';

export default function ChannelPage() {
  const router = useRouter();
  const { channelId } = router.query;

  return (
    <AuthProvider>
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AuthHeader />
        <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <Box sx={{ width: '30%', borderRight: 1, borderColor: 'divider' }}>
            <ChannelList />
          </Box>
          <Box sx={{ flex: 1 }}>
            {channelId && typeof channelId === 'string' && (
              <ChannelView channelId={channelId} />
            )}
          </Box>
        </Box>
      </Box>
    </AuthProvider>
  );
} 