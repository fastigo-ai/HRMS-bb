import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { updateLeadStatus } from './sales.controller.js';
import Lead from './lead.model.js';
import SalesActivity from './salesActivity.model.js';
import AppError from '../../utils/AppError.js';

// Setup Mock Express App
const app = express();
app.use(express.json());

// Mock dependencies
vi.mock('./lead.model.js');
vi.mock('./salesActivity.model.js');

app.patch('/api/sales/leads/:id', (req, res, next) => {
  // Mock req.user
  req.user = { id: 'user123' };
  req.app = { get: vi.fn() };
  updateLeadStatus(req, res, next);
});

// Error handling middleware to catch next(AppError)
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({ status: 'error', message: err.message });
});

describe('Sales Controller - Pipeline Integrity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should reject invalid backward pipeline transitions', async () => {
    // Mock lead in "Meeting Scheduled" state
    Lead.findById.mockResolvedValue({
      _id: 'lead123',
      status: 'Meeting Scheduled',
      save: vi.fn().mockResolvedValue(true)
    });

    // Attempt to move it BACK to 'Lead'
    const res = await request(app)
      .patch('/api/sales/leads/lead123')
      .send({ status: 'Lead' });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Cannot move lead backwards');
  });

  it('should reject transitions from closed states', async () => {
    // Mock lead in "Closed Won" state
    Lead.findById.mockResolvedValue({
      _id: 'lead123',
      status: 'Closed Won',
      save: vi.fn().mockResolvedValue(true)
    });

    const res = await request(app)
      .patch('/api/sales/leads/lead123')
      .send({ status: 'Meeting Scheduled' });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Cannot change status of a closed lead');
  });

  it('should allow valid forward transitions', async () => {
    const mockSave = vi.fn().mockResolvedValue(true);
    // Mock lead in "Lead" state
    Lead.findById.mockResolvedValue({
      _id: 'lead123',
      status: 'Lead',
      save: mockSave
    });

    SalesActivity.create.mockResolvedValue(true);

    const res = await request(app)
      .patch('/api/sales/leads/lead123')
      .send({ status: 'Contacted' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(mockSave).toHaveBeenCalled();
    expect(SalesActivity.create).toHaveBeenCalled();
  });
});
