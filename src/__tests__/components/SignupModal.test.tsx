import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignupModal from '../../components/SignupModal';

const mockSignup = jest.fn();
const mockOnClose = jest.fn();

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    signup: mockSignup,
  }),
}));

describe('SignupModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders signup form correctly', () => {
    render(<SignupModal open={true} onClose={mockOnClose} />);

    expect(screen.getByLabelText(/nickname/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('handles successful signup', async () => {
    mockSignup.mockResolvedValueOnce(undefined);

    render(<SignupModal open={true} onClose={mockOnClose} />);

    fireEvent.change(screen.getByLabelText(/nickname/i), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith('testuser', 'test@example.com', 'password123');
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('displays error message on signup failure', async () => {
    const errorMessage = 'Email already registered';
    mockSignup.mockRejectedValueOnce(new Error(errorMessage));

    render(<SignupModal open={true} onClose={mockOnClose} />);

    fireEvent.change(screen.getByLabelText(/nickname/i), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });
}); 