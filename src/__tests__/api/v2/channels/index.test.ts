import handler from '../../../../pages/api/v2/channels/index';
import { createAuthenticatedMocks, mockUser, mockPoolTransaction } from '../setup';
import { pool } from '../../../../config/database';

// Mock the auth middleware
jest.mock('../../../../middleware/auth', () => ({
    withAuth: (handler: any) => handler,
    AuthenticatedRequest: {}
}));

// Mock channel code generation
jest.mock('../../../../utils/channel', () => ({
    generateChannelCode: jest.fn().mockResolvedValue('ABC123')
}));

describe('POST /api/v2/channels', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Mock the initial channel code check
        (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [], rowCount: 0 });
    });

    it('creates a new channel successfully', async () => {
        const channelData = {
            title: 'Test Channel',
            description: 'Test Description',
            is_private: false,
        };

        const mockChannel = {
            id: '123e4567-e89b-12d3-a456-426614174000',
            code: 'ABC123',
            ...channelData,
            region_id: 'DEFAULT',
            owner_id: mockUser.id,
            creation_date: new Date().toISOString(),
        };

        // Use mockPoolTransaction for transaction handling
        mockPoolTransaction([
            [], // channel code check
            [mockChannel], // channel creation
            [] // member addition
        ]);

        const { req, res } = createAuthenticatedMocks('POST', channelData);
        await handler(req, res);

        expect(res._getStatusCode()).toBe(201);
        expect(JSON.parse(res._getData())).toEqual(mockChannel);
        expect(pool.query).toHaveBeenCalledWith(
            expect.stringMatching(/INSERT INTO channels/),
            expect.arrayContaining([expect.any(String), 'DEFAULT', channelData.title])
        );
    });

    it('returns 400 when title is missing', async () => {
        const { req, res } = createAuthenticatedMocks('POST', {});
        await handler(req, res);
        expect(res._getStatusCode()).toBe(400);
    });

    it('returns 400 when title is empty', async () => {
        const { req, res } = createAuthenticatedMocks('POST', { title: '   ' });
        await handler(req, res);
        expect(res._getStatusCode()).toBe(400);
    });

    it('handles database errors gracefully', async () => {
        (pool.query as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

        const { req, res } = createAuthenticatedMocks('POST', { title: 'Test Channel' });
        await handler(req, res);

        expect(res._getStatusCode()).toBe(500);
        expect(JSON.parse(res._getData())).toEqual({
            message: 'Internal server error'
        });
    });
});

describe('GET /api/v2/channels', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('lists public channels', async () => {
        const mockChannels = [
            { id: '1', title: 'Channel 1', is_private: false },
            { id: '2', title: 'Channel 2', is_private: false },
        ];

        mockPoolTransaction([
            mockChannels // list channels query
        ]);

        const { req, res } = createAuthenticatedMocks('GET');
        await handler(req, res);

        expect(res._getStatusCode()).toBe(200);
        expect(JSON.parse(res._getData())).toEqual(mockChannels);
    });

    it('handles pagination parameters', async () => {
        const { req, res } = createAuthenticatedMocks('GET', {}, { 
            limit: '10',
            before: '2024-03-22T00:00:00Z'
        });

        const mockClient = mockPoolTransaction([[]]);
        await handler(req, res);

        expect(mockClient.query).toHaveBeenCalledWith(
            expect.stringMatching(/LIMIT \$1/),
            expect.arrayContaining([10])
        );
    });

    it('handles database errors in listing', async () => {
        (pool.query as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

        const { req, res } = createAuthenticatedMocks('GET');
        await handler(req, res);

        expect(res._getStatusCode()).toBe(500);
        expect(JSON.parse(res._getData())).toEqual({
            message: 'Internal server error'
        });
    });
}); 