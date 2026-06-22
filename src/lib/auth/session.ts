import { prisma } from "../prisma.js";

export const createSession = async (userId: string, jti: string, expiresAt: Date) => {
  return prisma.session.create({
    data: { userId, jti, expiresAt },
  });
};

export const getActiveSession = async (jti: string) => {
  return prisma.session.findFirst({
    where: {
      jti,
      expiresAt: { gt: new Date() },
    },
  });
};

export const revokeSession = async (jti: string) => {
  return prisma.session.deleteMany({ where: { jti } });
};
