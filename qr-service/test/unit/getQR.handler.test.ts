import { pool } from '../../src/db/client';
import { getQRHandler } from '../../src/handlers/getQR.handler';

jest.mock('../../src/db/client', () => ({
  pool: { query: jest.fn() },
}));

const mockQuery = pool.query as jest.Mock;

const qrRow = {
  qrId: 'qr-1',
  userId: 'user-1',
  amount: '100.00',
  currency: 'BOB',
  description: 'test',
  qrData: '{}',
  expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  used: false,
};

describe('getQRHandler', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns QR for the owner', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [qrRow] });

    const result = await getQRHandler('user-1', { qrId: 'qr-1' });

    expect(result.qrCode.qrId).toBe('qr-1');
    expect(result.qrCode.amount).toBe('100.00');
  });

  it('throws when QR does not exist', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    await expect(getQRHandler('user-1', { qrId: 'nonexistent' }))
      .rejects.toThrow('QR not found');
  });

  it('throws when accessed by a non-owner', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [qrRow] });

    await expect(getQRHandler('user-2', { qrId: 'qr-1' }))
      .rejects.toThrow('QR not found');
  });
});
