/**
 * @file backend/middleware/auth.js
 * @description This file contains the authentication middleware for the application.
 * It uses JSON Web Tokens (JWT) to protect routes that require authentication.
 * The `verifyToken` function checks for a valid JWT in the `Authorization` header of incoming requests.
 * If the token is valid, the decoded user payload is attached to the request object, and the request is passed to the next middleware or route handler.
 * If the token is missing or invalid, it sends an appropriate error response, preventing unauthorized access.
 */
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};

module.exports = verifyToken;