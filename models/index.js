import { prisma } from './client';

export const {
  conversation,
  conversationMessage,
  conversationUser,
  user,
  filter,
  profileCheck,
  skill,
  timezone
} = prisma;
