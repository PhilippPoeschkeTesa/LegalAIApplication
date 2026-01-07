jest.mock('../config/database', () => ({
  query: jest.fn(),
}));

process.env.JWT_SECRET = 'test-secret-key';
process.env.NODE_ENV = 'test';
