import { pool } from '../../src/db/client';
import { getMyWalletHandler } from '../../src/handlers/getMyWallet.handler';

jest.mock('../../src/db/client', () => ({
  pool: { query: jest.fn() },
}));

const mockQuery = pool.query as jest.Mock;

describe('getMyWalletHandler', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns wallet data when found', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{
        walletId: 'wallet-1',
        userId: 'user-1',
        balance: '150.00',
        currency: 'BOB',
        status: 'ACTIVE',
        updatedAt: new Date(),
      }],
    });

    const result = await getMyWalletHandler('user-1', {});

    expect(result.wallet.walletId).toBe('wallet-1');
    expect(result.wallet.balance).toBe('150.00');
    expect(result.wallet.currency).toBe('BOB');
  });

  it('throws when wallet is not found', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    await expect(getMyWalletHandler('unknown-user', {}))
      .rejects.toThrow('Wallet not found');
  });
});
