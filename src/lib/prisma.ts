import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;

function makePrismaClient() {
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  // Extract the actual postgres:// connection string from the prisma+postgres URL
  // The prisma+postgres URL encodes the real DB URL in the api_key JWT payload
  let dbUrl = connectionString;
  
  if (connectionString.startsWith('prisma+postgres://')) {
    try {
      const url = new URL(connectionString);
      const apiKey = url.searchParams.get('api_key');
      if (apiKey) {
        const payload = JSON.parse(Buffer.from(apiKey.split('.')[0], 'base64').toString());
        dbUrl = payload.databaseUrl;
      }
    } catch {
      // If parsing fails, try using the URL as-is
    }
  }

  const adapter = new PrismaPg({ connectionString: dbUrl });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? makePrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
