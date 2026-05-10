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

jest.mock('../../src/sqs/producer', () => ({
  publishTransactionCompleted: jest.fn().mockResolvedValue(undefined),
}));

import { pool } from '../../src/db/client';

const mockQuery = pool.query as jest.Mock;
const mockConnect = pool.connect as jest.Mock;
const mockClient = { query: jest.fn(), release: jest.fn() };

let app: any;
beforeAll(async () => {
  process.env.INTERNAL_API_KEY = 'test-key';
  process.env.USER_SERVICE_URL = 'http://user-service';
  process.env.WALLET_SERVICE_URL = 'http://wallet-service';
  global.fetch = jest.fn() as jest.Mock;
  ({ app } = await import('../../src/index'));
});

beforeEach(() => {
  jest.clearAllMocks();
  mockConnect.mockResolvedValue(mockClient);
  mockClient.query.mockResolvedValue({ rows: [], rowCount: 0 });
});

describe('Role enforcement — cashier_user blocked from all transaction routes', () => {
  it('GET /v1/transacciones returns 403', async () => {
    const res = await request(app)
      .get('/v1/transacciones')
      .set('Authorization', 'Bearer token')
      .set('x-test-roles', 'cashier_user');

    expect(res.status).toBe(403);
  });

  it('POST /v1/transacciones returns 403', async () => {
    const res = await request(app)
      .post('/v1/transacciones')
      .set('Authorization', 'Bearer token')
      .set('x-test-roles', 'cashier_user')
      .send({ receiverPhone: '+591', amount: '10', idempotencyKey: 'k' });

    expect(res.status).toBe(403);
  });

  it('GET /v1/transacciones/:txId returns 403', async () => {
    const res = await request(app)
      .get('/v1/transacciones/tx-1')
      .set('Authorization', 'Bearer token')
      .set('x-test-roles', 'cashier_user');

    expect(res.status).toBe(403);
  });
});

describe('GET /v1/transacciones', () => {
  it('returns 200 with empty list for regular_user', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ total: 0 }] });

    const res = await request(app)
      .get('/v1/transacciones')
      .set('Authorization', 'Bearer token');

    expect(res.status).toBe(200);
    expect(res.body.transactions).toEqual([]);
  });
});

describe('GET /v1/transacciones/:txId', () => {
  it('returns 200 when transaction belongs to the user', async () => {
    const tx = {
      txId: 'tx-1', senderId: 'test-user-id', receiverId: 'user-2',
      amount: '100', currency: 'BOB', type: 'P2P_TRANSFER', status: 'COMPLETED',
      description: null, createdAt: new Date(), completedAt: new Date(),
    };
    mockQuery.mockResolvedValueOnce({ rows: [tx] });

    const res = await request(app)
      .get('/v1/transacciones/tx-1')
      .set('Authorization', 'Bearer token');

    expect(res.status).toBe(200);
    expect(res.body.transaction.txId).toBe('tx-1');
  });

  it('returns 404 when transaction is not found', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .get('/v1/transacciones/nonexistent')
      .set('Authorization', 'Bearer token');

    expect(res.status).toBe(404);
  });
});

describe('POST /v1/transacciones', () => {
  it('returns 201 on successful P2P transfer', async () => {
    const txRow = {
      txId: 'tx-new', senderId: 'test-user-id', receiverId: 'u-2',
      amount: 100, currency: 'BOB', type: 'P2P_TRANSFER', status: 'COMPLETED',
      description: null, createdAt: new Date(), completedAt: new Date(),
    };
    mockClient.query
      .mockResolvedValueOnce({ rows: [] })       // idempotency
      .mockResolvedValueOnce({ rows: [txRow] }); // INSERT

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ user: { userId: 'u-2' } }) }) // user lookup
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) })  // debit
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) }); // credit

    const res = await request(app)
      .post('/v1/transacciones')
      .set('Authorization', 'Bearer token')
      .send({ receiverPhone: '+59170000002', amount: '100', currency: 'BOB', idempotencyKey: 'idem-1' });

    expect(res.status).toBe(201);
    expect(res.body.transaction.txId).toBe('tx-new');
  });
});
