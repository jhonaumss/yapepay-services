import { pool } from '../../src/db/client';
import { createRechargeHandler } from '../../src/handlers/createRecharge.handler';

jest.mock('../../src/db/client', () => ({
  pool: { connect: jest.fn() },
}));

const mockClient = {
  query: jest.fn(),
  release: jest.fn(),
};

const mockFetch = jest.fn();
global.fetch = mockFetch;

function mockUserLookup(userId = 'user-1') {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => ({ user: { userId } }),
  } as any);
}

beforeEach(() => {
  jest.clearAllMocks();
  (pool.connect as jest.Mock).mockResolvedValue(mockClient);
  mockClient.query.mockResolvedValue({ rows: [], rowCount: 0 });
});

describe('createRechargeHandler', () => {
  const phoneNumber = '+59171234567';
  const input = { amount: '200.00', idempotencyKey: 'key-abc' };

  it('resolves phone to userId and credits the wallet', async () => {
    const rechargeRow = { txId: 'tx-1', amount: 200, status: 'COMPLETED', createdAt: new Date() };
    mockUserLookup('customer-1');
    mockClient.query
      .mockResolvedValueOnce({ rows: [] })          // BEGIN
      .mockResolvedValueOnce({ rows: [] })          // idempotency check
      .mockResolvedValueOnce({ rows: [] })          // UPDATE billetera
      .mockResolvedValueOnce({ rows: [rechargeRow] }) // INSERT recarga
      .mockResolvedValueOnce({ rows: [] });         // COMMIT

    const result = await createRechargeHandler(phoneNumber, input);

    expect(result.transaction.txId).toBe('tx-1');
    expect(result.transaction.status).toBe('COMPLETED');
    expect(result.estimatedCreditSeconds).toBe(0);
    expect(mockClient.query).toHaveBeenCalledWith('COMMIT');

    // Wallet credited belongs to resolved user, not caller
    const updateCall = mockClient.query.mock.calls.find(
      (c: any[]) => typeof c[0] === 'string' && c[0].includes('UPDATE billetera')
    );
    expect(updateCall[1][1]).toBe('customer-1');
  });

  it('returns existing transaction on duplicate idempotency key', async () => {
    const existing = { txId: 'tx-existing' };
    mockUserLookup();
    mockClient.query
      .mockResolvedValueOnce({ rows: [] })        // BEGIN
      .mockResolvedValueOnce({ rows: [existing] }) // idempotency hit
      .mockResolvedValueOnce({ rows: [] });        // ROLLBACK

    const result = await createRechargeHandler(phoneNumber, input);

    expect(result.transaction).toEqual(existing);
    expect(result.estimatedCreditSeconds).toBe(0);
  });

  it('throws when phone number is not found', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 404 } as any);

    await expect(createRechargeHandler('+59100000000', input))
      .rejects.toThrow('No user found with phone number +59100000000');
  });

  it('throws when amount is missing', async () => {
    mockUserLookup();
    mockClient.query
      .mockResolvedValueOnce({ rows: [] }) // BEGIN
      .mockResolvedValueOnce({ rows: [] }) // idempotency check
      .mockResolvedValueOnce({ rows: [] }); // ROLLBACK

    await expect(createRechargeHandler(phoneNumber, { idempotencyKey: 'k-1', amount: undefined }))
      .rejects.toThrow('Amount is required');
    expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
  });
});
