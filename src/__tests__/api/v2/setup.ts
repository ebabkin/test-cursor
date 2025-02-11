import { pool } from '../../../config/database';
import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';

// Mock user for testing
export const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    nickname: 'testuser'
};

// Mock the database pool
jest.mock('../../../config/database', () => ({
    pool: {
        connect: jest.fn(),
        query: jest.fn()
    }
}));

export function createAuthenticatedMocks(method = 'GET', body = {}, query = {}) {
    const { req, res } = createMocks({
        method,
        body,
        headers: {
            'authorization': 'Bearer valid-token'
        },
        query
    });

    // Add user to request as middleware would
    (req as any).user = mockUser;

    return { req, res };
}

export function mockPoolTransaction(results: any[]) {
    const mockClient = {
        query: jest.fn(),
        release: jest.fn(),
    };

    // Handle transaction commands
    mockClient.query.mockImplementation((sql: string, params?: any[]) => {
        if (sql === 'BEGIN' || sql === 'COMMIT' || sql === 'ROLLBACK') {
            return Promise.resolve();
        }
        
        const result = results.shift();
        return Promise.resolve({ 
            rows: result || [], 
            rowCount: result?.length || 0 
        });
    });

    // Mock the connect method
    (pool.connect as jest.Mock).mockResolvedValue(mockClient);
    
    return mockClient;
}

beforeEach(() => {
    jest.clearAllMocks();
}); 