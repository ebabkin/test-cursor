// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Add TextEncoder/TextDecoder for Node environment
if (typeof TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Mock fetch globally
global.fetch = jest.fn(); 