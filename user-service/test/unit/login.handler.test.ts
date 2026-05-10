// Capture the send fn inside the factory so it's the same reference the handler uses
jest.mock('@aws-sdk/client-cognito-identity-provider', () => {
  const sendFn = jest.fn();
  return {
    _sendFn: sendFn,
    CognitoIdentityProviderClient: jest.fn(() => ({ send: sendFn })),
    InitiateAuthCommand: jest.fn((x: any) => x),
  };
});

// eslint-disable-next-line @typescript-eslint/no-require-imports
const mockSend: jest.Mock = require('@aws-sdk/client-cognito-identity-provider')._sendFn;

import { loginHandler } from '../../src/handlers/login.handler';

describe('loginHandler', () => {
  beforeEach(() => mockSend.mockReset());

  it('returns tokens on successful login', async () => {
    mockSend.mockResolvedValueOnce({
      AuthenticationResult: {
        AccessToken: 'access-token',
        IdToken: 'id-token',
        RefreshToken: 'refresh-token',
        ExpiresIn: 3600,
      },
    });

    const result = await loginHandler({ email: 'user@test.com', pin: '123456' });

    expect(result.accessToken).toBe('access-token');
    expect(result.idToken).toBe('id-token');
    expect(result.expiresIn).toBe(3600);
  });

  it('throws when Cognito returns no AuthenticationResult', async () => {
    mockSend.mockResolvedValueOnce({ AuthenticationResult: undefined });

    await expect(loginHandler({ email: 'user@test.com', pin: 'wrong' }))
      .rejects.toThrow('Authentication failed');
  });

  it('throws when Cognito rejects the request', async () => {
    mockSend.mockRejectedValueOnce(new Error('NotAuthorizedException'));

    await expect(loginHandler({ email: 'user@test.com', pin: 'bad' }))
      .rejects.toThrow('NotAuthorizedException');
  });
});
