import { jest, beforeEach } from '@jest/globals';
import { pool, mockClient } from './database';

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  mockClient.query.mockClear();
  mockClient.release.mockClear();
  pool.connect.mockResolvedValue(mockClient);
}); 