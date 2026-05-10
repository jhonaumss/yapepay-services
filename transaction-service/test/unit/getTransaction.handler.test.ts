import { pool } from '../../src/db/client';
import { getTransactionHandler } from '../../src/handlers/getTransaction.handler';

jest.mock('../../src/db/client', () => ({
  pool: { query: jest.fn() },
}));

const mockQuery = pool.query as jest.Mock;

const tx = {
  txId: 'tx-1',
  senderId: 'user-a',
  receiverId: 'user-b',
  amount: '100',
  currency: 'BOB',
  type: 'P2P_TRANSFER',
  status: 'COMPLETED',
  description: null,
  createdAt: new Date(),
  completedAt: new Date(),
};

describe('getTransactionHandler', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns transaction for the sender', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [tx] });

    const result = await getTransactionHandler({ txId: 'tx-1' }, 'user-a');

    expect(result.transaction.txId).toBe('tx-1');
    expect(result.transaction.amount).toBe('100');
  });

  it('returns transaction for the receiver', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [tx] });

    const result = await getTransactionHandler({ txId: 'tx-1' }, 'user-b');

    expect(result.transaction.txId).toBe('tx-1');
  });

  it('throws when transaction does not exist', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    await expect(getTransactionHandler({ txId: 'no-such-tx' }, 'user-a'))
      .rejects.toMatchObject({ message: 'Transaction not found' });
  });

  it('throws when caller is neither sender nor receiver', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [tx] });

    await expect(getTransactionHandler({ txId: 'tx-1' }, 'user-c'))
      .rejects.toMatchObject({ message: 'Transaction not found' });
  });
});
