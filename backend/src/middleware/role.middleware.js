export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `This action requires one of the following roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
}

export function requireAdmin(req, res, next) {
  return requireRole('ADMIN')(req, res, next);
}

export function requireExhibitor(req, res, next) {
  return requireRole('EXHIBITOR', 'ADMIN')(req, res, next);
}
