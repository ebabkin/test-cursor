import { pool } from '../config/database';
import crypto from 'crypto';

export async function generateChannelCode(): Promise<string> {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let attempts = 0;
    const maxAttempts = 25;

    while (attempts < maxAttempts) {
        // Generate 6 random characters
        let code = '';
        for (let i = 0; i < 6; i++) {
            const randomIndex = crypto.randomInt(0, chars.length);
            code += chars[randomIndex];
        }

        // Check if code exists
        const exists = await pool.query(
            'SELECT 1 FROM channels WHERE code = $1',
            [code]
        );

        if (exists.rowCount === 0) {
            return code;
        }

        attempts++;
    }

    throw new Error('Failed to generate unique channel code');
} 