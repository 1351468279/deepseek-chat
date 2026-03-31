import { beforeAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { apiHandlers } from './mocks/handlers';

// Setup MSW server
export const server = setupServer(...apiHandlers);

beforeAll(() => {
  server.listen();
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
