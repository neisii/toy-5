import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export function verifyToken(req, res, next) {
  const token = req.cookies['auth-token'];

  if (!token) {
    return res.status(401).json({ error: '인증이 필요합니다' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: '유효하지 않은 토큰입니다' });
  }
}
