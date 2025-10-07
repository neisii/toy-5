import express from 'express';
import cookieParser from 'cookie';
import cors from 'cors';
import authRoutes from './routes/auth.js';

const app = express();
const PORT = 3002;

// 미들웨어
app.use(express.json());
app.use((req, res, next) => {
  const cookies = req.headers.cookie;
  req.cookies = {};
  if (cookies) {
    cookies.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      req.cookies[name] = value;
    });
  }
  next();
});

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// 라우트
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Auth server running on http://localhost:${PORT}`);
});
