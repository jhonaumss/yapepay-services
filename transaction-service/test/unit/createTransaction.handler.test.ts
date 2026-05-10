import { pool } from '../../src/db/client';

jest.mock('../../src/db/client', () => ({
  pool: { connect: jest.fn() },
}));

jest.mock('../../src/sqs/producer', () => ({
  publishTransactionCompleted: jest.fn().mockResolvedValue(undefined),
}));

const mockClient = { query: jest.fn(), release: jest.fn() };

beforeEach(() => {
  jest.clearAllMocks();
  process.env.USER_SERVICE_URL = 'http://user-service';
  process.env.WALLET_SERVICE_URL = 'http://wallet-service';
  process.env.INTERNAL_API_KEY = 'test-key';
  (pool.connect as jest.Mock).mockResolvedValue(mockClient);
  global.fetch = jest.fn() as jest.Mock;
});

describe('createTransactionHandler', () => {
  const input = { receiverPhone: '+59170000002', amount: '100', currency: 'BOB', idempotencyKey: 'idem-1' };
  const txRow = {
    txId: 'tx-new', senderId: 'user-1', receiverId: 'user-2',
    amount: 100, currency: 'BOB', type: 'P2P_TRANSFER', status: 'COMPLETED',
    description: null, createdAt: new Date(), completedAt: new Date(),
  };

  it('creates a P2P transaction successfully', async () => {
    // Handler makes 2 client.query calls: idempotency check + INSERT
    mockClient.query
      .mockResolvedValueOnce({ rows: [] })       // idempotency → no existing
      .mockResolvedValueOnce({ rows: [txRow] }); // INSERT → new row

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ user: { userId: 'user-2' } }) }) // user lookup
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) })  // debit
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) }); // credit

    const { createTransactionHandler } = await import('../../src/handlers/createTransaction.handler');
    const result = await createTransactionHandler(input, 'user-1');

    expect(result.transaction.txId).toBe('tx-new');
    expect(result.transaction.type).toBe('P2P_TRANSFER');
  });

  it('returns existing transaction on duplicate idempotency key', async () => {
    // Handler returns early after idempotency check — no fetch calls
    mockClient.query.mockResolvedValueOnce({ rows: [txRow] });

    const { createTransactionHandler } = await import('../../src/handlers/createTransaction.handler');
    const result = await createTransactionHandler(input, 'user-1');

    expect(result.transaction.txId).toBe('tx-new');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('throws RECEIVER_NOT_FOUND when user-service returns 404', async () => {
    mockClient.query.mockResolvedValueOnce({ rows: [] }); // idempotency

    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false }); // user lookup fails

    const { createTransactionHandler } = await import('../../src/handlers/createTransaction.handler');
    await expect(createTransactionHandler(input, 'user-1'))
      .rejects.toMatchObject({ code: 'RECEIVER_NOT_FOUND' });
  });

  it('throws INSUFFICIENT_FUNDS when debit fails', async () => {
    mockClient.query.mockResolvedValueOnce({ rows: [] }); // idempotency

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ user: { userId: 'user-2' } }) }) // user lookup
      .mockResolvedValueOnce({ ok: false, json: async () => ({ message: 'Insufficient funds' }) }); // debit fails

    const { createTransactionHandler } = await import('../../src/handlers/createTransaction.handler');
    await expect(createTransactionHandler(input, 'user-1'))
      .rejects.toMatchObject({ code: 'INSUFFICIENT_FUNDS' });
  });

  it('sends x-internal-key on all inter-service calls', async () => {
    mockClient.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [txRow] });

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ user: { userId: 'user-2' } }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    const { createTransactionHandler } = await import('../../src/handlers/createTransaction.handler');
    await createTransactionHandler(input, 'user-1');

    const allHeaders = (global.fetch as jest.Mock).mock.calls.map((call: any[]) => call[1]?.headers ?? {});
    allHeaders.forEach(headers => {
      expect(headers['x-internal-key']).toBe('test-key');
    });
  });
});
