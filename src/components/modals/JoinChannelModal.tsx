import { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField,
  Alert
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

interface JoinChannelModalProps {
  open: boolean;
  onClose: () => void;
  onChannelJoined: () => void;
}

export default function JoinChannelModal({ open, onClose, onChannelJoined }: JoinChannelModalProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const handleSubmit = async () => {
    if (!/^[A-Z0-9]{6}$/.test(code)) {
      setError('Invalid channel code format');
      return;
    }

    try {
      const response = await fetch(`/api/v2/channels/join-by-code/${code}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to join channel');
      }

      onChannelJoined();
      handleClose();
    } catch (error) {
      console.error('Error joining channel:', error);
      setError(error.message);
    }
  };

  const handleClose = () => {
    setCode('');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Join Channel</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField
          autoFocus
          margin="dense"
          label="Channel Code"
          fullWidth
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter 6-character code"
          inputProps={{ maxLength: 6 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit}>Join</Button>
      </DialogActions>
    </Dialog>
  );
} 