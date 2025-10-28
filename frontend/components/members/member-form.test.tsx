import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemberForm } from './member-form';
import api from '@/lib/axios';

// Mock axios
vi.mock('@/lib/axios');
const mockedApi = vi.mocked(api);

describe('MemberForm', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSuccess: vi.fn(),
    member: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form fields correctly', () => {
    render(<MemberForm {...defaultProps} />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/họ và tên/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/biệt danh/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/số điện thoại/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/vị trí thi đấu/i)).toBeInTheDocument();
  });

  it('shows correct title for new member', () => {
    render(<MemberForm {...defaultProps} />);
    expect(screen.getByText('Thêm thành viên mới')).toBeInTheDocument();
  });

  it('shows correct title for editing member', () => {
    const member = {
      id: 'member-1',
      fullName: 'Test User',
      position: 'MIDFIELDER',
      memberType: 'OFFICIAL',
      status: 'ACTIVE',
      user: { email: 'test@example.com' },
    };

    render(<MemberForm {...defaultProps} member={member} />);
    expect(screen.getByText('Chỉnh sửa thành viên')).toBeInTheDocument();
  });

  it('populates form with member data when editing', () => {
    const member = {
      id: 'member-1',
      fullName: 'Test User',
      nickname: 'Tester',
      phone: '0123456789',
      position: 'MIDFIELDER',
      memberType: 'OFFICIAL',
      status: 'ACTIVE',
      user: { email: 'test@example.com' },
    };

    render(<MemberForm {...defaultProps} member={member} />);

    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Tester')).toBeInTheDocument();
    expect(screen.getByDisplayValue('0123456789')).toBeInTheDocument();
  });

  it('submits form with correct data for new member', async () => {
    const user = userEvent.setup();
    mockedApi.post.mockResolvedValue({ data: { success: true } });

    render(<MemberForm {...defaultProps} />);

    // Fill form
    await user.type(screen.getByLabelText(/email/i), 'new@example.com');
    await user.type(screen.getByLabelText(/họ và tên/i), 'New User');
    await user.type(screen.getByLabelText(/biệt danh/i), 'Newbie');
    await user.type(screen.getByLabelText(/số điện thoại/i), '0987654321');

    // Submit form
    await user.click(screen.getByRole('button', { name: /thêm mới/i }));

    await waitFor(() => {
      expect(mockedApi.post).toHaveBeenCalledWith('/members', {
        email: 'new@example.com',
        fullName: 'New User',
        nickname: 'Newbie',
        phone: '0987654321',
        position: '',
        height: undefined,
        weight: undefined,
        preferredFoot: undefined,
        memberType: 'OFFICIAL',
        status: 'ACTIVE',
        dateOfBirth: undefined,
      });
    });

    expect(defaultProps.onSuccess).toHaveBeenCalled();
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('shows error message on API failure', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Email already exists';

    mockedApi.post.mockRejectedValue({
      response: { data: { message: errorMessage } },
    });

    render(<MemberForm {...defaultProps} />);

    // Fill required fields
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/họ và tên/i), 'Test User');

    // Submit form
    await user.click(screen.getByRole('button', { name: /thêm mới/i }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    expect(defaultProps.onSuccess).not.toHaveBeenCalled();
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();

    render(<MemberForm {...defaultProps} />);

    // Try to submit without filling required fields
    await user.click(screen.getByRole('button', { name: /thêm mới/i }));

    // Form should not submit
    expect(mockedApi.post).not.toHaveBeenCalled();
  });

  it('closes dialog when cancel button is clicked', async () => {
    const user = userEvent.setup();

    render(<MemberForm {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /hủy/i }));

    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});
