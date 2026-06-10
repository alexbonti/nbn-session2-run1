const request = require('supertest');
const app = require('../src/app');
const store = require('../src/store');

describe('GET /fault-status/:fault_id', () => {
  beforeEach(() => {
    store.clear();
  });

  it('returns 200 with the fault report when the ID exists', async () => {
    const report = {
      faultId: 'NBN-2026-ABC123',
      customerId: 'CUS-001-NSW',
      faultType: 'NO_CONNECTION',
      address: '14 Banksia Grove, Cherrybrook NSW 2126',
      description: 'No internet since 6am this morning.',
      status: 'SUBMITTED',
      createdAt: '2026-04-15T09:30:00.000Z',
      updatedAt: '2026-04-15T09:30:00.000Z'
    };
    store.save(report.faultId, report);

    const res = await request(app).get(`/fault-status/${report.faultId}`);

    expect(res.status).toBe(200);
    expect(res.body.faultId).toBe('NBN-2026-ABC123');
    expect(res.body.customerId).toBe('CUS-001-NSW');
    expect(res.body.faultType).toBe('NO_CONNECTION');
    expect(res.body.address).toBe('14 Banksia Grove, Cherrybrook NSW 2126');
    expect(res.body.description).toBe('No internet since 6am this morning.');
    expect(res.body.status).toBe('SUBMITTED');
    expect(res.body.createdAt).toBe('2026-04-15T09:30:00.000Z');
    expect(res.body.updatedAt).toBe('2026-04-15T09:30:00.000Z');
  });

  it('returns 400 when the fault_id format is invalid', async () => {
    const res = await request(app).get('/fault-status/bad-format');

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('INVALID_FAULT_ID');
    expect(res.body.timestamp).toBeDefined();
  });

  it('returns 404 when the fault_id is valid but not found', async () => {
    const res = await request(app).get('/fault-status/NBN-2026-ZZZZZZ');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('NOT_FOUND');
    expect(res.body.timestamp).toBeDefined();
  });

  it('returns 400 for a wrong prefix', async () => {
    const res = await request(app).get('/fault-status/ABC-2026-ABC123');

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('INVALID_FAULT_ID');
  });

  it('returns 400 for a lowercase sequence', async () => {
    const res = await request(app).get('/fault-status/NBN-2026-abc123');

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('INVALID_FAULT_ID');
  });

  it('returns 400 for a sequence of the wrong length', async () => {
    const res = await request(app).get('/fault-status/NBN-2026-ABC12');

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('INVALID_FAULT_ID');
  });
});
