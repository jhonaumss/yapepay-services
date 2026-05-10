import { pool } from '../../src/db/client';
import { generateQRHandler } from '../../src/handlers/generateQR.handler';

jest.mock('../../src/db/client', () => ({
  pool: { query: jest.fn() },
}));

jest.mock('uuid', () => ({ v4: () => 'fixed-uuid' }));

const mockQuery = pool.query as jest.Mock;

describe('generateQRHandler', () => {
  beforeEach(() => jest.clearAllMocks());

  it('generates a QR code with default 15-minute TTL', async () => {
    const row = {
      qrId: 'qr-1', userId: 'user-1', amount: null,
      currency: 'BOB', description: null, qrData: '{}',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), used: false,
    };
    mockQuery.mockResolvedValueOnce({ rows: [row] });

    const before = Date.now();
    const result = await generateQRHandler('user-1', { currency: 'BOB' });
    const after = Date.now();

    expect(result.qrCode.qrId).toBe('qr-1');
    expect(result.qrCode.used).toBe(false);

    const expiresAt = new Date(mockQuery.mock.calls[0][1][5]).getTime();
    expect(expiresAt).toBeGreaterThanOrEqual(before + 14 * 60 * 1000);
    expect(expiresAt).toBeLessThanOrEqual(after + 16 * 60 * 1000);
  });

  it('generates a QR with a custom TTL', async () => {
    const row = {
      qrId: 'qr-2', userId: 'user-1', amount: '50.00',
      currency: 'BOB', description: 'test', qrData: '{}',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), used: false,
    };
    mockQuery.mockResolvedValueOnce({ rows: [row] });

    await generateQRHandler('user-1', { amount: '50.00', currency: 'BOB', ttlMinutes: 60 });

    const expiresAt = new Date(mockQuery.mock.calls[0][1][5]).getTime();
    expect(expiresAt).toBeGreaterThanOrEqual(Date.now() + 59 * 60 * 1000);
  });

  it('stores null for optional amount and description', async () => {
    const row = { qrId: 'qr-3', userId: 'user-1', amount: null, currency: 'BOB', description: null, qrData: '{}', expiresAt: new Date(), used: false };
    mockQuery.mockResolvedValueOnce({ rows: [row] });

    await generateQRHandler('user-1', {});

    const params = mockQuery.mock.calls[0][1];
    expect(params[1]).toBeNull();
    expect(params[3]).toBeNull();
  });
});
