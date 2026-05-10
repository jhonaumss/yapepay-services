import { pool } from '../../src/db/client';
import { getCurrentUserHandler } from '../../src/handlers/getCurrentUser.handler';

jest.mock('../../src/db/client', () => ({
  pool: { query: jest.fn() },
}));

const mockQuery = pool.query as jest.Mock;

const mockUser = {
  userId: 'user-123',
  phoneNumber: '+59170000001',
  fullName: 'Test User',
  email: 'user@test.com',
  kycStatus: 'PENDING',
  createdAt: new Date('2025-01-01'),
};

describe('getCurrentUserHandler', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns user data when found', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [mockUser] });

    const result = await getCurrentUserHandler('user-123', {});

    expect(result.user.userId).toBe('user-123');
    expect(result.user.phoneNumber).toBe('+59170000001');
    expect(result.user.fullName).toBe('Test User');
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('usuario'), ['user-123']);
  });

  it('throws when user is not found', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    await expect(getCurrentUserHandler('nonexistent', {}))
      .rejects.toThrow('User not found');
  });
});
