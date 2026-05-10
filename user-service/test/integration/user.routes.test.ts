import request from 'supertest';

// Mock auth before app is imported
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

jest.mock('bcrypt', () => ({ hash: jest.fn().mockResolvedValue('hashed') }));

jest.mock('@aws-sdk/client-cognito-identity-provider', () => ({
  CognitoIdentityProviderClient: jest.fn(() => ({ send: jest.fn() })),
  InitiateAuthCommand: jest.fn(),
  AdminCreateUserCommand: jest.fn(),
  AdminSetUserPasswordCommand: jest.fn(),
  AdminAddUserToGroupCommand: jest.fn(),
}));

import { pool } from '../../src/db/client';
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';

const mockQuery = pool.query as jest.Mock;
const mockConnect = pool.connect as jest.Mock;
const mockSend = jest.fn();
(CognitoIdentityProviderClient as jest.Mock).mockImplementation(() => ({ send: mockSend }));

let app: any;
beforeAll(async () => {
  process.env.INTERNAL_API_KEY = 'test-key';
  process.env.WALLET_SERVICE_URL = 'http://wallet';
  global.fetch = jest.fn() as jest.Mock;
  ({ app } = await import('../../src/index'));
});

beforeEach(() => jest.clearAllMocks());

describe('POST /v1/usuarios/login', () => {
  it('returns 200 with tokens on valid credentials', async () => {
    mockSend.mockResolvedValueOnce({
      AuthenticationResult: { AccessToken: 'tok', IdToken: 'id', RefreshToken: 'ref', ExpiresIn: 3600 },
    });

    const res = await request(app)
      .post('/v1/usuarios/login')
      .send({ email: 'user@test.com', pin: '123456' });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBe('tok');
  });

  it('returns 401 when Cognito rejects', async () => {
    mockSend.mockRejectedValueOnce(new Error('NotAuthorizedException'));

    const res = await request(app)
      .post('/v1/usuarios/login')
      .send({ email: 'user@test.com', pin: 'wrong' });

    expect(res.status).toBe(401);
  });
});

describe('GET /v1/usuarios/me', () => {
  it('returns 200 for regular_user', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ userId: 'test-user-id', phoneNumber: '+591', fullName: 'Test', email: null, kycStatus: 'PENDING', createdAt: new Date() }],
    });

    const res = await request(app)
      .get('/v1/usuarios/me')
      .set('Authorization', 'Bearer token');

    expect(res.status).toBe(200);
    expect(res.body.user.userId).toBe('test-user-id');
  });

  it('returns 403 for cashier_user', async () => {
    const res = await request(app)
      .get('/v1/usuarios/me')
      .set('Authorization', 'Bearer token')
      .set('x-test-roles', 'cashier_user');

    expect(res.status).toBe(403);
  });
});

describe('PATCH /v1/usuarios/me', () => {
  it('returns 403 for cashier_user', async () => {
    const res = await request(app)
      .patch('/v1/usuarios/me')
      .set('Authorization', 'Bearer token')
      .set('x-test-roles', 'cashier_user')
      .send({ updates: { fullName: 'New Name' } });

    expect(res.status).toBe(403);
  });
});

describe('GET /v1/usuarios/portelefono', () => {
  it('returns 401 without x-internal-key', async () => {
    const res = await request(app)
      .get('/v1/usuarios/portelefono?numero=+59170000001');

    expect(res.status).toBe(401);
  });

  it('returns 200 with valid x-internal-key', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ userId: 'u-1', phoneNumber: '+59170000001', fullName: 'Test' }],
    });

    const res = await request(app)
      .get('/v1/usuarios/portelefono?numero=+59170000001')
      .set('x-internal-key', 'test-key');

    expect(res.status).toBe(200);
  });
});
