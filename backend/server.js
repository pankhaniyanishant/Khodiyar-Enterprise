import { config } from 'dotenv';
import app from './src/app.js';
import logger from './src/utils/logger.js';

config({ path: './.env' });

const PORT = process.env.APP_PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  logger.info(`Server is started`, { port: PORT });
});

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT ERROR:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err);
});
