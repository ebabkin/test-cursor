import { Box } from '@mui/material';
import ChatInterface from '../components/ChatInterface';

export default function Home() {
  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <ChatInterface />
    </Box>
  );
} 