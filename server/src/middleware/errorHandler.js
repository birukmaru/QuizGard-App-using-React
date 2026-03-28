import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Middleware to load user from database
 * Attaches full user object with role to req.user
 */
export const loadUser = async (req, _res, next) => {
  if (!req.auth?.userId) {
    return next();
  }

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: req.auth.userId },
    });

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Middleware to ensure user exists in database
 * Creates user record if first login
 */
export const ensureUser = async (req, _res, next) => {
  if (!req.auth?.userId) {
    return next();
  }

  try {
    let user = await prisma.user.findUnique({
      where: { clerkId: req.auth.userId },
    });

    if (!user) {
      // Create user on first login
      user = await prisma.user.create({
        data: {
          clerkId: req.auth.userId,
          email: req.auth.email,
        },
      });
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Middleware to verify admin status
 * Checks database role field after user is loaded
 */
export const requireAdmin = (req, _res, next) => {
  if (!req.user) {
    return next(new UnauthorizedError());
  }

  if (req.user.role !== 'ADMIN') {
    return next(new ForbiddenError('Admin access required'));
  }

  next();
};

export { UnauthorizedError, ForbiddenError } from './auth.js';
