import request from 'supertest';

jest.mock('../../src/middleware/auth.middleware', () => ({
  authMiddleware: (req: any, _res: any, next: any) => {
    req.headers['x-user-id'] = 'test-user-id';
    req.headers['x-user-roles'] = req.headers['x-test-roles'] ?? 'regular_user';
    next();
  },
}));

jest.mock('../../src/db/client', () => ({
  pool: { query: jest.fn(), connect: jest.fn() },
}));

import { pool } from '../../src/db/client';

const mockQuery = pool.query as jest.Mock;
const mockConnect = pool.connect as jest.Mock;
const mockClient = { query: jest.fn(), release: jest.fn() };

let app: any;
beforeAll(async () => {
  process.env.INTERNAL_API_KEY = 'test-key';
  ({ app } = await import('../../src/index'));
});

beforeEach(() => {
  jest.clearAllMocks();
  mockConnect.mockResolvedValue(mockClient);
  mockClient.query.mockResolvedValue({ rows: [], rowCount: 0 });
});

describe('GET /v1/billeteras/me', () => {
  it('returns 200 for regular_user', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ walletId: 'w-1', userId: 'test-user-id', balance: '100.00', currency: 'BOB', status: 'ACTIVE', updatedAt: new Date() }],
    });

    const res = await request(app)
      .get('/v1/billeteras/me')
      .set('Authorization', 'Bearer token');

    expect(res.status).toBe(200);
    expect(res.body.wallet.walletId).toBe('w-1');
  });

  it('returns 403 for cashier_user', async () => {
    const res = await request(app)
      .get('/v1/billeteras/me')
      .set('Authorization', 'Bearer token')
      .set('x-test-roles', 'cashier_user');

    expect(res.status).toBe(403);
  });

  it('returns 404 when wallet does not exist', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .get('/v1/billeteras/me')
      .set('Authorization', 'Bearer token');

    expect(res.status).toBe(404);
  });
});

describe('POST /v1/recargas', () => {
  it('returns 403 for regular_user', async () => {
    const res = await request(app)
      .post('/v1/recargas')
      .set('Authorization', 'Bearer token')
      .send({ targetUserId: 'customer-1', bankAccountId: 'bank-1', amount: '100', idempotencyKey: 'k-1' });

    expect(res.status).toBe(403);
  });

  it('returns 400 when targetUserId is missing', async () => {
    const res = await request(app)
      .post('/v1/recargas')
      .set('Authorization', 'Bearer token')
      .set('x-test-roles', 'cashier_user')
      .send({ bankAccountId: 'bank-1', amount: '100', idempotencyKey: 'k-1' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('targetUserId is required');
  });

  it('returns 201 and credits the target user wallet', async () => {
    const rechargeRow = { txId: 'tx-1', amount: 100, status: 'COMPLETED', createdAt: new Date() };
    mockClient.query
      .mockResolvedValueOnce({ rows: [] })   // BEGIN
      .mockResolvedValueOnce({ rows: [] })   // idempotency check
      .mockResolvedValueOnce({ rows: [] })   // UPDATE billetera (target user)
      .mockResolvedValueOnce({ rows: [rechargeRow] }) // INSERT recarga
      .mockResolvedValueOnce({ rows: [] });  // COMMIT

    const res = await request(app)
      .post('/v1/recargas')
      .set('Authorization', 'Bearer token')
      .set('x-test-roles', 'cashier_user')
      .send({ targetUserId: 'customer-1', bankAccountId: 'bank-1', amount: '100', idempotencyKey: 'k-1' });

    expect(res.status).toBe(201);
    // The wallet credited must be the target user's, not the cashier's
    const updateCall = mockClient.query.mock.calls.find(
      (c: any[]) => typeof c[0] === 'string' && c[0].includes('UPDATE billetera')
    );
    expect(updateCall[1][1]).toBe('customer-1');
  });
});

describe('Internal wallet routes', () => {
  it('POST /v1/billeteras returns 401 without internal key', async () => {
    const res = await request(app)
      .post('/v1/billeteras')
      .send({ userId: 'u-1' });

    expect(res.status).toBe(401);
  });

  it('POST /v1/billeteras/debito returns 401 without internal key', async () => {
    const res = await request(app)
      .post('/v1/billeteras/debito')
      .send({ userId: 'u-1', amount: 50 });

    expect(res.status).toBe(401);
  });

  it('POST /v1/billeteras/credito returns 401 without internal key', async () => {
    const res = await request(app)
      .post('/v1/billeteras/credito')
      .send({ userId: 'u-1', amount: 50 });

    expect(res.status).toBe(401);
  });

  it('POST /v1/billeteras/credito returns 200 with internal key', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ walletId: 'w-1', balance: '150' }] });

    const res = await request(app)
      .post('/v1/billeteras/credito')
      .set('x-internal-key', 'test-key')
      .send({ userId: 'u-1', amount: 50 });

    expect(res.status).toBe(200);
  });
});
