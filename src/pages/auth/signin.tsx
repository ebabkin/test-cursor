import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
} from '@mui/material';

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setError('An error occurred during sign in');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        bgcolor: 'grey.100',
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography
            component="h1"
            variant="h4"
            align="center"
            gutterBottom
          >
            Sign in to your account
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <TextField
              label="Email address"
              type="email"
              required
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
            />

            <TextField
              label="Password"
              type="password"
              required
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3 }}
            >
              Sign in
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
} 