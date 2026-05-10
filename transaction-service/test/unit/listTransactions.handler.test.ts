import { pool } from '../../src/db/client';
import { listTransactionsHandler } from '../../src/handlers/listTransactions.handler';

jest.mock('../../src/db/client', () => ({
  pool: { query: jest.fn() },
}));

const mockQuery = pool.query as jest.Mock;

const makeTx = (txId: string) => ({
  txId,
  senderId: 'user-1',
  receiverId: 'user-2',
  amount: '50',
  currency: 'BOB',
  type: 'P2P_TRANSFER',
  status: 'COMPLETED',
  description: null,
  createdAt: new Date(),
  completedAt: new Date(),
});

describe('listTransactionsHandler', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns empty list when user has no transactions', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ total: 0 }] });

    const result = await listTransactionsHandler({}, 'user-1');

    expect(result.transactions).toHaveLength(0);
    expect(result.total).toBe(0);
    expect(result.nextCursor).toBeUndefined();
  });

  it('returns paginated transactions without cursor on first page', async () => {
    const rows = [makeTx('tx-1'), makeTx('tx-2')];
    mockQuery
      .mockResolvedValueOnce({ rows })
      .mockResolvedValueOnce({ rows: [{ total: 2 }] });

    const result = await listTransactionsHandler({ pageSize: 10 }, 'user-1');

    expect(result.transactions).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(result.nextCursor).toBeUndefined();
  });

  it('provides nextCursor when more pages exist', async () => {
    const rows = [makeTx('tx-1'), makeTx('tx-2'), makeTx('tx-3')];
    mockQuery
      .mockResolvedValueOnce({ rows })
      .mockResolvedValueOnce({ rows: [{ total: 10 }] });

    const result = await listTransactionsHandler({ pageSize: 2 }, 'user-1');

    expect(result.transactions).toHaveLength(2);
    expect(result.nextCursor).toBeDefined();
  });

  it('applies type filter to query', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ total: 0 }] });

    await listTransactionsHandler({ type: 'P2P_TRANSFER' as any }, 'user-1');

    const pageQuery = mockQuery.mock.calls[0][0] as string;
    expect(pageQuery).toContain('"type"');
  });

  it('decodes a valid cursor without throwing', async () => {
    const cursor = Buffer.from(JSON.stringify({ createdAt: new Date().toISOString(), txId: 'tx-1' })).toString('base64');
    mockQuery
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ total: 0 }] });

    await expect(listTransactionsHandler({ cursor }, 'user-1')).resolves.toBeDefined();
  });
});
