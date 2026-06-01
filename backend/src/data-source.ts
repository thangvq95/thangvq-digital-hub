import 'reflect-metadata';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { DataSource } from 'typeorm';

// Load environment variables from ../infra/.env if it exists
const infraEnvPath = path.resolve(process.cwd(), '../infra/.env');
if (fs.existsSync(infraEnvPath)) {
  dotenv.config({ path: infraEnvPath });
} else {
  dotenv.config();
}

// Dynamically construct DATABASE_URL for local development if not provided
if (!process.env.DATABASE_URL) {
  const dbUser = 'digitalhub';
  const dbPass = process.env.POSTGRES_PASSWORD || 'devpassword';
  const dbHost = 'localhost';
  const dbPort = '5435';
  const dbName = 'digitalhub';
  process.env.DATABASE_URL = `postgres://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}`;
}

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [__dirname + '/**/*.entity{.js,.ts}'],
  migrations: [__dirname + '/migrations/*{.js,.ts}'],
  synchronize: false,
  logging: process.env.NODE_ENV !== 'production',
});
