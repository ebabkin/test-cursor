import { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField,
  FormControlLabel,
  Switch,
  Alert
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

interface CreateChannelModalProps {
  open: boolean;
  onClose: () => void;
  onChannelCreated: () => void;
}

export default function CreateChannelModal({ open, onClose, onChannelCreated }: CreateChannelModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      const response = await fetch('/api/v2/channels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description: description.trim() || undefined,
          is_private: isPrivate
        })
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      onChannelCreated();
      handleClose();
    } catch (error) {
      console.error('Error creating channel:', error);
      setError('Failed to create channel');
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setIsPrivate(false);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Create New Channel</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField
          autoFocus
          margin="dense"
          label="Channel Title"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Description (optional)"
          fullWidth
          multiline
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <FormControlLabel
          control={
            <Switch
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
            />
          }
          label="Private Channel"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit}>Create</Button>
      </DialogActions>
    </Dialog>
  );
} 