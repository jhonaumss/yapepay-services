import { pool } from '../../src/db/client';
import { createRechargeHandler } from '../../src/handlers/createRecharge.handler';

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

describe('createRechargeHandler', () => {
  const input = { bankAccountId: 'bank-1', amount: '200.00', idempotencyKey: 'key-abc' };

  it('creates a recharge and credits the wallet', async () => {
    const rechargeRow = {
      txId: 'tx-1',
      amount: 200,
      status: 'COMPLETED',
      createdAt: new Date(),
    };
    mockClient.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [rechargeRow] })
      .mockResolvedValueOnce({ rows: [] });

    const result = await createRechargeHandler('user-1', input);

    expect(result.transaction.txId).toBe('tx-1');
    expect(result.transaction.status).toBe('COMPLETED');
    expect(result.estimatedCreditSeconds).toBe(0);
    expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
  });

  it('returns existing transaction on duplicate idempotency key', async () => {
    const existing = { txId: 'tx-existing' };
    mockClient.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [existing] })
      .mockResolvedValueOnce({ rows: [] });

    const result = await createRechargeHandler('user-1', input);

    expect(result.transaction).toEqual(existing);
    expect(result.estimatedCreditSeconds).toBe(0);
  });

  it('throws when amount is missing', async () => {
    mockClient.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });

    await expect(createRechargeHandler('user-1', { bankAccountId: 'b-1', idempotencyKey: 'k-1', amount: undefined }))
      .rejects.toThrow('Amount is required');
    expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
  });
});
