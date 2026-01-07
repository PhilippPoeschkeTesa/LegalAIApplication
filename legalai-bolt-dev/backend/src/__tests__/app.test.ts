import request from 'supertest';
import app from '../app';

describe('App', () => {
  describe('GET /', () => {
    it('should return health check message', async () => {
      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.text).toContain('Tesa Legal AI  Backend is running');
    });
  });

});
