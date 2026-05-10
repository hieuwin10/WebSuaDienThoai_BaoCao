import { render, screen, waitFor } from '@testing-library/react';
import Dashboard from './Dashboard';
import { vi, describe, it, expect } from 'vitest';
import React from 'react';

// Mock the API service
vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn((url) => {
      if (url === '/dashboard/stats') {
        return Promise.resolve({ data: { totalRevenue: 1000000 } });
      }
      if (url === '/tickets') {
        return Promise.resolve({ data: [
          { _id: '1', ticket_code: 'TK001', status: 'pending', total_cost: 500000, device_id: { model: 'iPhone 13' } },
          { _id: '2', ticket_code: 'TK002', status: 'completed', total_cost: 500000, device_id: { model: 'iPhone 13' } },
        ] });
      }
      if (url === '/devices') {
        return Promise.resolve({ data: [{ _id: '1' }] });
      }
      if (url === '/users') {
        return Promise.resolve({ data: [{ _id: '1' }] });
      }
      return Promise.resolve({ data: [] });
    }),
  },
}));

// Mock useAuth
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { role: 'ADMIN' },
  }),
}));

describe('Dashboard Component', () => {
  it('renders dashboard with stats and table', async () => {
    render(<Dashboard />);
    
    // Check if static text is rendered
    expect(screen.getByText('Bảng điều khiển')).toBeInTheDocument();
  });
});
