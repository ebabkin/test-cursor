import { Box } from '@mui/material';
import ChatInterface from '../components/ChatInterface';
import AuthHeader from '../components/AuthHeader';
import { AuthProvider } from '../contexts/AuthContext';

export default function Home() {
  return (
    <AuthProvider>
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AuthHeader />
        <ChatInterface />
      </Box>
    </AuthProvider>
  );
} 