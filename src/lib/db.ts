// Server-only Prisma client singleton. Never import this into a client
// component. Uses DATABASE_URL from the environment (see prisma/schema.prisma).
//
// The mock UI does not use this yet — it exists as the database foundation for
// when live data is switched on.

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
