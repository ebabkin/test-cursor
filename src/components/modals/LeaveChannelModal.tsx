import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button,
  Typography
} from '@mui/material';

interface LeaveChannelModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  channelTitle: string;
}

export default function LeaveChannelModal({ 
  open, 
  onClose, 
  onConfirm, 
  channelTitle 
}: LeaveChannelModalProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Leave Channel</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to leave "{channelTitle}"? You'll need an invitation to rejoin.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm} color="error">Leave</Button>
      </DialogActions>
    </Dialog>
  );
} 