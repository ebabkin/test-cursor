import { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme } from '@mui/material/styles';

// Create a theme instance
const theme = createTheme({
  // You can customize the theme here
});

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </SessionProvider>
  );
} 