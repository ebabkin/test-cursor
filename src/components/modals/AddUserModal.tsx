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

interface AddUserModalProps {
  open: boolean;
  onClose: () => void;
  channelId: string;
}

export default function AddUserModal({ open, onClose, channelId }: AddUserModalProps) {
  const [userIdentifier, setUserIdentifier] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const handleSubmit = async () => {
    if (!userIdentifier.trim()) {
      setError('User identifier is required');
      return;
    }

    try {
      const response = await fetch(`/api/v2/channels/${channelId}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userIdentifier })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to add user');
      }

      handleClose();
    } catch (error) {
      console.error('Error adding user:', error);
      setError(error.message);
    }
  };

  const handleClose = () => {
    setUserIdentifier('');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Add User to Channel</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField
          autoFocus
          margin="dense"
          label="User Email or Nickname"
          fullWidth
          value={userIdentifier}
          onChange={(e) => setUserIdentifier(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit}>Add</Button>
      </DialogActions>
    </Dialog>
  );
} 