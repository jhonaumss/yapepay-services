jest.mock('@aws-sdk/client-cognito-identity-provider', () => {
  const sendFn = jest.fn();
  return {
    _sendFn: sendFn,
    CognitoIdentityProviderClient: jest.fn(() => ({ send: sendFn })),
    AdminCreateUserCommand: jest.fn((x: any) => ({ _type: 'create', ...x })),
    AdminSetUserPasswordCommand: jest.fn((x: any) => ({ _type: 'setpw', ...x })),
    AdminAddUserToGroupCommand: jest.fn((x: any) => ({ _type: 'group', ...x })),
  };
});

jest.mock('../../src/db/client', () => ({
  pool: { connect: jest.fn() },
}));

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-pin'),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const mockSend: jest.Mock = require('@aws-sdk/client-cognito-identity-provider')._sendFn;

import { pool } from '../../src/db/client';

const mockClient = { query: jest.fn(), release: jest.fn() };
(pool.connect as jest.Mock).mockResolvedValue(mockClient);

global.fetch = jest.fn() as jest.Mock;

function setupSuccessfulRegistration() {
  mockSend
    .mockResolvedValueOnce({ User: { Attributes: [{ Name: 'sub', Value: 'cognito-uid' }] } })
    .mockResolvedValueOnce({})
    .mockResolvedValueOnce({});

  mockClient.query
    .mockResolvedValueOnce({ rows: [] })
    .mockResolvedValueOnce({ rows: [] })
    .mockResolvedValueOnce({
      rows: [{
        userId: 'cognito-uid', phoneNumber: '+59170000001',
        fullName: 'Test', email: 'test@test.com', kycStatus: 'PENDING', createdAt: new Date(),
      }],
    })
    .mockResolvedValueOnce({ rows: [] });

  (global.fetch as jest.Mock).mockResolvedValue({ ok: true });
}

describe('registerHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.INTERNAL_API_KEY = 'test-key';
    process.env.WALLET_SERVICE_URL = 'http://wallet';
    (pool.connect as jest.Mock).mockResolvedValue(mockClient);
    setupSuccessfulRegistration();
  });

  it('assigns regular_user role by default', async () => {
    const { registerHandler } = await import('../../src/handlers/register.handler');
    await registerHandler({ phoneNumber: '+59170000001', fullName: 'Test', email: 'test@test.com', pin: '123456' });

    // Third send call is AdminAddUserToGroup — check the arg passed to the constructor
    const groupArg = mockSend.mock.calls[2][0];
    expect(groupArg.GroupName).toBe('regular_user');
  });

  it('assigns cashier_user role when specified', async () => {
    const { registerHandler } = await import('../../src/handlers/register.handler');
    await registerHandler({ phoneNumber: '+59170000002', fullName: 'Cashier', email: 'c@test.com', pin: '123456', role: 'cashier_user' });

    const groupArg = mockSend.mock.calls[2][0];
    expect(groupArg.GroupName).toBe('cashier_user');
  });

  it('sends x-internal-key when creating wallet', async () => {
    const { registerHandler } = await import('../../src/handlers/register.handler');
    await registerHandler({ phoneNumber: '+59170000003', fullName: 'Test', email: 't@test.com', pin: '123456' });

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(options.headers['x-internal-key']).toBe('test-key');
  });

  it('throws when Cognito fails to return a sub', async () => {
    mockSend.mockReset();
    mockSend.mockResolvedValueOnce({ User: { Attributes: [] } });

    const { registerHandler } = await import('../../src/handlers/register.handler');
    await expect(registerHandler({ phoneNumber: '+59170000004', fullName: 'T', email: 'f@test.com', pin: '123456' }))
      .rejects.toThrow('Failed to retrieve Cognito user sub');
  });
});
