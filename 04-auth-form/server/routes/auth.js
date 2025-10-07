import express from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// 회원가입
router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 중복 확인
    const existingUser = UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: '이미 등록된 이메일입니다' });
    }

    // 사용자 생성
    const user = await UserModel.create(email, password);
    res.status(201).json({
      message: '회원가입이 완료되었습니다',
      user: { id: user.id, email: user.email }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: '회원가입 중 오류가 발생했습니다' });
  }
});

// 로그인
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 사용자 찾기
    const user = UserModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다' });
    }

    // 비밀번호 확인
    const isValid = await UserModel.verifyPassword(user, password);
    if (!isValid) {
      return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다' });
    }

    // JWT 토큰 생성
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // 쿠키 설정
    res.cookie('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000 // 1시간
    });

    res.json({
      message: '로그인 성공',
      user: { id: user.id, email: user.email }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: '로그인 중 오류가 발생했습니다' });
  }
});

// 프로필 조회
router.get('/profile', verifyToken, (req, res) => {
  try {
    const user = UserModel.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: '프로필 조회 중 오류가 발생했습니다' });
  }
});

// 로그아웃
router.post('/logout', (req, res) => {
  res.clearCookie('auth-token');
  res.json({ message: '로그아웃 되었습니다' });
});

export default router;
