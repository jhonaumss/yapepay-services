import { pool } from '../../src/db/client';
import { creditWalletHandler } from '../../src/handlers/creditWallet.handler';

jest.mock('../../src/db/client', () => ({
  pool: { query: jest.fn() },
}));

const mockQuery = pool.query as jest.Mock;

describe('creditWalletHandler', () => {
  beforeEach(() => jest.clearAllMocks());

  it('credits the wallet and returns updated row', async () => {
    const updatedWallet = { walletId: 'w-1', userId: 'u-1', balance: '200.00' };
    mockQuery.mockResolvedValueOnce({ rows: [updatedWallet] });

    const result = await creditWalletHandler({ userId: 'u-1', amount: 50 });

    expect(result.wallet).toEqual(updatedWallet);
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('balance" + $1'),
      [50, 'u-1'],
    );
  });

  it('throws when wallet is not found', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    await expect(creditWalletHandler({ userId: 'nonexistent', amount: 10 }))
      .rejects.toThrow('Wallet not found');
  });
});
