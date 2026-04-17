import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { db } from '../config/firebaseClient.js';
import { sendOtpEmail } from '../utils/mailer.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_wifi_key_123';

// Penyimpanan OTP sementara di memori: { sessionId -> { otp, email, userData, expiresAt } }
const otpStore = new Map();

// Bersihkan OTP yang expired setiap 10 menit
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of otpStore.entries()) {
    if (val.expiresAt < now) otpStore.delete(key);
  }
}, 10 * 60 * 1000);

// Register User Baru
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Cek apakah email sudah terdaftar
    const usersCol = collection(db, 'users');
    const q = query(usersCol, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return res.status(400).json({ message: 'Email sudah terdaftar!' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Gunakan role yang dipilih, default ke 'user' jika tidak valid
    const userRole = role === 'admin' ? 'admin' : 'user';

    // Simpan ke Firestore
    const newUserRef = await addDoc(collection(db, 'users'), {
      name,
      email,
      password: hashedPassword,
      role: userRole,
      plan: 'Belum Memilih Paket',
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ message: 'Registrasi berhasil', userId: newUserRef.id });
  } catch (error) {
    console.error('Error saat register:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
});

// Login — Step 1: Verifikasi password, lalu kirim OTP
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Cari user berdasarkan email
    const usersCol = collection(db, 'users');
    const q = query(usersCol, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return res.status(404).json({ message: 'Email atau Password salah!' });
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    // Bandingkan password
    const isMatch = await bcrypt.compare(password, userData.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Email atau Password salah!' });
    }

    // Buat OTP & session
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const sessionId = uuidv4();

    otpStore.set(sessionId, {
      otp,
      email: userData.email,
      userId: userDoc.id,
      userData,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 menit
    });

    // Kirim OTP ke email (atau log ke console jika dev mode)
    await sendOtpEmail(userData.email, otp);

    res.status(200).json({
      message: 'OTP telah dikirim ke email Anda.',
      otpRequired: true,
      sessionId,
    });
  } catch (error) {
    console.error('Error saat login:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
});

// Login — Step 2: Verifikasi OTP → Issue JWT Token
router.post('/verify-otp', async (req, res) => {
  try {
    const { sessionId, otp } = req.body;

    if (!sessionId || !otp) {
      return res.status(400).json({ message: 'Session ID dan OTP wajib diisi.' });
    }

    const session = otpStore.get(sessionId);

    if (!session) {
      return res.status(400).json({ message: 'Session tidak ditemukan atau sudah kadaluarsa.' });
    }

    if (Date.now() > session.expiresAt) {
      otpStore.delete(sessionId);
      return res.status(400).json({ message: 'Kode OTP sudah kadaluarsa. Silakan login ulang.' });
    }

    if (session.otp !== otp) {
      return res.status(400).json({ message: 'Kode OTP salah. Periksa kembali email Anda.' });
    }

    // OTP valid — hapus dari store & buat JWT
    otpStore.delete(sessionId);

    const { userId, userData } = session;
    const payload = { id: userId, role: userData.role, name: userData.name };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({
      message: 'Login berhasil',
      token,
      user: {
        id: userId,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        plan: userData.plan,
      },
    });
  } catch (error) {
    console.error('Error saat verify OTP:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
});

// Google Login (bypass 2FA)
router.post('/google', async (req, res) => {
  try {
    const { email, name } = req.body;

    // Cari user berdasarkan email
    const usersCol = collection(db, 'users');
    const q = query(usersCol, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    let userDoc;
    let userData;

    if (querySnapshot.empty) {
      // User baru via Google — buat akun otomatis
      const randomPassword = Math.random().toString(36).slice(-8);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      const newUserRef = await addDoc(collection(db, 'users'), {
        name: name || 'Google User',
        email,
        password: hashedPassword,
        role: 'user',
        plan: 'Belum Memilih Paket',
        createdAt: new Date().toISOString(),
      });

      userDoc = { id: newUserRef.id };
      userData = { role: 'user', name: name || 'Google User', email, plan: 'Belum Memilih Paket' };
    } else {
      userDoc = querySnapshot.docs[0];
      userData = userDoc.data();
    }

    // Buat JWT Token
    const payload = { id: userDoc.id, role: userData.role, name: userData.name };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({
      message: 'Login berhasil',
      token,
      user: {
        id: userDoc.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        plan: userData.plan,
      },
    });
  } catch (error) {
    console.error('Error saat google login:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
});

export default router;
