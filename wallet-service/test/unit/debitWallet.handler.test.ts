import { pool } from '../../src/db/client';
import { debitWalletHandler } from '../../src/handlers/debitWallet.handler';

jest.mock('../../src/db/client', () => ({
  pool: { connect: jest.fn() },
}));

const mockClient = {
  query: jest.fn(),
  release: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  (pool.connect as jest.Mock).mockResolvedValue(mockClient);
  mockClient.query.mockResolvedValue({ rows: [], rowCount: 0 });
});

function setupWallet(balance: string, dailySpent: string, resetAt: Date) {
  mockClient.query
    .mockResolvedValueOnce({ rows: [] })
    .mockResolvedValueOnce({
      rows: [{ walletId: 'w-1', balance, dailySpent, dailySpentResetAt: resetAt }],
    })
    .mockResolvedValueOnce({ rows: [{ walletId: 'w-1', balance: '0' }] })
    .mockResolvedValueOnce({ rows: [] });
}

describe('debitWalletHandler', () => {
  it('debits successfully when balance and daily limit allow', async () => {
    const today = new Date();
    setupWallet('500.00', '0.00', today);

    await expect(debitWalletHandler({ userId: 'u-1', amount: 100 })).resolves.toBeDefined();
    expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
  });

  it('throws INSUFFICIENT_FUNDS when balance is too low', async () => {
    const today = new Date();
    mockClient.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [{ walletId: 'w-1', balance: '10.00', dailySpent: '0.00', dailySpentResetAt: today }],
      })
      .mockResolvedValueOnce({ rows: [] });

    await expect(debitWalletHandler({ userId: 'u-1', amount: 100 }))
      .rejects.toMatchObject({ message: 'Insufficient funds' });
    expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
  });

  it('throws when daily limit is exceeded', async () => {
    const today = new Date();
    mockClient.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [{ walletId: 'w-1', balance: '1000.00', dailySpent: '450.00', dailySpentResetAt: today }],
      })
      .mockResolvedValueOnce({ rows: [] });

    await expect(debitWalletHandler({ userId: 'u-1', amount: 100 }))
      .rejects.toMatchObject({ message: expect.stringContaining('Daily limit') });
    expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
  });

  it('resets daily spent on a new day', async () => {
    const yesterday = new Date(Date.now() - 86_400_000);
    mockClient.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [{ walletId: 'w-1', balance: '1000.00', dailySpent: '490.00', dailySpentResetAt: yesterday }],
      })
      .mockResolvedValueOnce({ rows: [{ walletId: 'w-1' }] })
      .mockResolvedValueOnce({ rows: [] });

    await expect(debitWalletHandler({ userId: 'u-1', amount: 100 })).resolves.toBeDefined();
    expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
  });

  it('throws when wallet does not exist', async () => {
    mockClient.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });

    await expect(debitWalletHandler({ userId: 'nonexistent', amount: 10 }))
      .rejects.toThrow('Wallet not found');
  });
});
