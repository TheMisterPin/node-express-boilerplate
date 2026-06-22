import { Role, type User } from "../../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";

export type PublicUser = {
  id: string;
  email: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
};

export const toPublicUser = (user: User): PublicUser => ({
  id: user.id,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export type CreateUserInput = {
  email: string;
  password: string;
  role?: Role;
};

export const createUser = async (input: CreateUserInput): Promise<User> => {
  return prisma.user.create({
    data: {
      email: input.email,
      password: input.password,
      role: input.role ?? Role.USER,
    },
  });
};

export const getUsers = async (): Promise<User[]> => {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });
};

export const getUserById = async (id: string): Promise<User | null> => {
  return prisma.user.findUnique({ where: { id } });
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  return prisma.user.findUnique({ where: { email } });
};
