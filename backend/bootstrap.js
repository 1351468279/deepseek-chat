import dotenv from 'dotenv';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __dirname = dirname(fileURLToPath(import.meta.url));

// Load environment variables from .env file
const envPath = resolve(__dirname, '.env');
console.log('Loading .env from:', envPath);

const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('Error loading .env:', result.error);
} else {
  console.log('.env loaded successfully');
  console.log('GLM_API_KEY:', process.env.GLM_API_KEY ? '***SET***' : 'NOT SET');
}

// Import the database initialization and server
const { initializeDatabase } = await import('./src/services/database.js');
const { default: app } = await import('./src/server.js');

// Start the server
const PORT = process.env.PORT || 3001;

try {
  await initializeDatabase();
  console.log('Database initialized');

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
} catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
}
