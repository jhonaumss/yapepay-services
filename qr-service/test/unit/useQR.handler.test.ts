import { pool } from '../../src/db/client';
import { useQRHandler } from '../../src/handlers/useQR.handler';

jest.mock('../../src/db/client', () => ({
  pool: { query: jest.fn() },
}));

const mockQuery = pool.query as jest.Mock;

describe('useQRHandler', () => {
  beforeEach(() => jest.clearAllMocks());

  it('claims the QR and returns payment details', async () => {
    mockQuery.mockResolvedValueOnce({
      rowCount: 1,
      rows: [{ userId: 'receiver-1', amount: '75.00', currency: 'BOB', description: 'lunch' }],
    });

    const result = await useQRHandler('qr-valid');

    expect(result.receiverUserId).toBe('receiver-1');
    expect(result.amount).toBe('75.00');
    expect(result.currency).toBe('BOB');
    expect(result.description).toBe('lunch');
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('used" = true'), ['qr-valid']);
  });

  it('returns null amount when QR has no fixed amount', async () => {
    mockQuery.mockResolvedValueOnce({
      rowCount: 1,
      rows: [{ userId: 'receiver-1', amount: null, currency: 'BOB', description: null }],
    });

    const result = await useQRHandler('qr-open');

    expect(result.amount).toBeNull();
  });

  it('throws "QR already used" when QR was already claimed', async () => {
    mockQuery
      .mockResolvedValueOnce({ rowCount: 0, rows: [] })
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ used: true, expiresAt: new Date() }] });

    await expect(useQRHandler('qr-used')).rejects.toThrow('QR already used');
  });

  it('throws "QR expired" when QR is past TTL', async () => {
    mockQuery
      .mockResolvedValueOnce({ rowCount: 0, rows: [] })
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ used: false, expiresAt: new Date(Date.now() - 1000) }] });

    await expect(useQRHandler('qr-expired')).rejects.toThrow('QR expired');
  });

  it('throws "QR not found" when QR does not exist', async () => {
    mockQuery
      .mockResolvedValueOnce({ rowCount: 0, rows: [] })
      .mockResolvedValueOnce({ rowCount: 0, rows: [] });

    await expect(useQRHandler('qr-missing')).rejects.toThrow('QR not found');
  });
});
