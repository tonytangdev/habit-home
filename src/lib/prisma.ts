import { PrismaClient } from '@prisma/client'

//建立全域變數
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

//建立全域變數
export const prisma = globalForPrisma.prisma ?? new PrismaClient()

//將全域變數設為prisma
globalForPrisma.prisma = prisma