// src/lib/db.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Check if we're in a mock environment
const isMockEnvironment = process.env.NODE_ENV === 'test' || process.env.USE_MOCK_DB === 'true';

// Use real Prisma Client normally, mock only when explicitly needed
export const prisma = globalForPrisma.prisma ?? 
  (isMockEnvironment 
    ? createMockPrisma() 
    : new PrismaClient()
  );

// Create mock functions that match the actual Prisma Client structure
function createMockPrisma() {
  return {
    doctor: {
      findMany: async () => [],
      upsert: async () => ({}),
      // Add other doctor methods
    },
    appointment: {
      findMany: async () => [],
      create: async () => ({}),
      // Add other appointment methods
    },
    chatMessage: {
      create: async () => ({}),
      findMany: async () => [],
      // Add other chatMessage methods
    },
    contactMessage: {
      create: async () => ({}),
      findMany: async () => [],
      update: async ({ where, data }: any) => ({
        id: where.id,
        ...data,
      }),
      delete: async () => ({}),
      // Add all methods used in your app
    },
    // Add all models you use
    user: {
      findUnique: async () => ({}),
      create: async () => ({}),
      update: async () => ({}),
    },
  };
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;