import { render, screen, fireEvent } from '@testing-library/react';
import AuthHeader from '../../components/AuthHeader';

const mockLogout = jest.fn();
let mockAuthState = {
  user: null,
  isAuthenticated: false,
  logout: mockLogout,
};

// Mock the entire module
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockAuthState
}));

describe('AuthHeader', () => {
  beforeEach(() => {
    // Reset mock state before each test
    mockAuthState = {
      user: null,
      isAuthenticated: false,
      logout: mockLogout,
    };
    jest.clearAllMocks();
  });

  it('shows login and signup buttons when not authenticated', () => {
    render(<AuthHeader />);
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });

  it('shows welcome message and logout button when authenticated', () => {
    // Set mock state for this test
    mockAuthState = {
      user: { nickname: 'TestUser' },
      isAuthenticated: true,
      logout: mockLogout,
    };

    render(<AuthHeader />);
    expect(screen.getByText('Welcome, TestUser!')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('opens login modal when login button is clicked', () => {
    render(<AuthHeader />);
    fireEvent.click(screen.getByText('Login'));
    expect(screen.getByText('Login', { selector: 'h2' })).toBeInTheDocument();
  });

  it('opens signup modal when signup button is clicked', () => {
    render(<AuthHeader />);
    fireEvent.click(screen.getByText('Sign Up'));
    expect(screen.getByText('Sign Up', { selector: 'h2' })).toBeInTheDocument();
  });
}); 