import { clerkClient } from '@clerk/clerk-sdk-node';

/**
 * Custom error classes for auth errors
 */
export class UnauthorizedError extends Error {
  constructor(message = 'Authentication required') {
    super(message);
    this.name = 'UnauthorizedError';
    this.status = 401;
  }
}

export class ForbiddenError extends Error {
  constructor(message = 'Insufficient permissions') {
    super(message);
    this.name = 'ForbiddenError';
    this.status = 403;
  }
}

/**
 * Authentication middleware
 * Verifies Clerk JWT token and attaches user to request
 */
export const authenticate = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or invalid authorization header');
    }

    const token = authHeader.split(' ')[1];

    // Verify the token with Clerk
    const claims = await clerkClient.verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    req.auth = {
      userId: claims.sub,
      sessionId: claims.sid,
      email: claims.email,
    };

    next();
  } catch (err) {
    if (err instanceof UnauthorizedError || err instanceof ForbiddenError) {
      next(err);
    } else {
      next(new UnauthorizedError('Invalid or expired token'));
    }
  }
};

/**
 * Optional authentication - attaches user if token present, continues otherwise
 */
export const optionalAuth = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.auth = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    const claims = await clerkClient.verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    req.auth = {
      userId: claims.sub,
      sessionId: claims.sid,
      email: claims.email,
    };

    next();
  } catch {
    req.auth = null;
    next();
  }
};

/**
 * Admin-only route protection
 * Must be used after authenticate middleware
 */
export const requireAdmin = (req, _res, next) => {
  if (!req.auth?.userId) {
    return next(new UnauthorizedError());
  }

  // Check if user has admin role in the database
  // This requires Prisma client, passed from route handler
  req.requireAdmin = true;
  next();
};

/**
 * Admin role checker for use in route handlers
 * Checks against database role field
 */
export const checkAdminRole = (userRole) => {
  return userRole === 'ADMIN';
};
