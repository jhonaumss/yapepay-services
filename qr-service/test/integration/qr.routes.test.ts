import request from 'supertest';

jest.mock('../../src/middleware/auth.middleware', () => ({
  authMiddleware: (req: any, _res: any, next: any) => {
    req.headers['x-user-id'] = 'test-user-id';
    req.headers['x-user-roles'] = req.headers['x-test-roles'] ?? 'regular_user';
    next();
  },
}));

jest.mock('../../src/db/client', () => ({
  pool: { query: jest.fn() },
}));

jest.mock('uuid', () => ({ v4: () => 'fixed-uuid' }));

import { pool } from '../../src/db/client';

const mockQuery = pool.query as jest.Mock;

let app: any;
beforeAll(async () => {
  process.env.INTERNAL_API_KEY = 'test-key';
  ({ app } = await import('../../src/index'));
});

beforeEach(() => jest.clearAllMocks());

describe('POST /v1/qr', () => {
  it('returns 201 for regular_user', async () => {
    const qrRow = {
      qrId: 'qr-1', userId: 'test-user-id', amount: null,
      currency: 'BOB', description: null, qrData: '{}',
      expiresAt: new Date(), used: false,
    };
    mockQuery.mockResolvedValueOnce({ rows: [qrRow] });

    const res = await request(app)
      .post('/v1/qr')
      .set('Authorization', 'Bearer token')
      .send({ currency: 'BOB' });

    expect(res.status).toBe(201);
    expect(res.body.qrCode.qrId).toBe('qr-1');
  });

  it('returns 403 for cashier_user', async () => {
    const res = await request(app)
      .post('/v1/qr')
      .set('Authorization', 'Bearer token')
      .set('x-test-roles', 'cashier_user')
      .send({ currency: 'BOB' });

    expect(res.status).toBe(403);
  });
});

describe('GET /v1/qr/:qrId', () => {
  it('returns 200 for the QR owner', async () => {
    const qrRow = {
      qrId: 'qr-1', userId: 'test-user-id', amount: '50.00',
      currency: 'BOB', description: null, qrData: '{}',
      expiresAt: new Date(), used: false,
    };
    mockQuery.mockResolvedValueOnce({ rows: [qrRow] });

    const res = await request(app)
      .get('/v1/qr/qr-1')
      .set('Authorization', 'Bearer token');

    expect(res.status).toBe(200);
    expect(res.body.qrCode.qrId).toBe('qr-1');
  });

  it('returns 404 when QR does not exist', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .get('/v1/qr/nonexistent')
      .set('Authorization', 'Bearer token');

    expect(res.status).toBe(404);
  });

  it('returns 403 for cashier_user', async () => {
    const res = await request(app)
      .get('/v1/qr/qr-1')
      .set('Authorization', 'Bearer token')
      .set('x-test-roles', 'cashier_user');

    expect(res.status).toBe(403);
  });
});

describe('PATCH /v1/qr/:qrId/use (internal)', () => {
  it('returns 401 without x-internal-key', async () => {
    const res = await request(app).patch('/v1/qr/qr-1/use');

    expect(res.status).toBe(401);
  });

  it('returns 200 with valid x-internal-key', async () => {
    mockQuery
      .mockResolvedValueOnce({
        rowCount: 1,
        rows: [{ userId: 'receiver-1', amount: '50.00', currency: 'BOB', description: null }],
      });

    const res = await request(app)
      .patch('/v1/qr/qr-1/use')
      .set('x-internal-key', 'test-key');

    expect(res.status).toBe(200);
    expect(res.body.receiverUserId).toBe('receiver-1');
  });

  it('returns 409 when QR is already used', async () => {
    mockQuery
      .mockResolvedValueOnce({ rowCount: 0, rows: [] })
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ used: true, expiresAt: new Date() }] });

    const res = await request(app)
      .patch('/v1/qr/qr-used/use')
      .set('x-internal-key', 'test-key');

    expect(res.status).toBe(409);
  });
});
