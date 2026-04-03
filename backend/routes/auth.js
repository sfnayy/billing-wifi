import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { db } from '../config/firebaseClient.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_wifi_key_123';

// Register User Baru
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        
        // Cek apakah email sudah terdaftar
        const usersCol = collection(db, 'users');
        const q = query(usersCol, where("email", "==", email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            return res.status(400).json({ message: 'Email sudah terdaftar!' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Tentukan role (default: user)
        const userRole = role === 'admin' ? 'admin' : 'user';

        // Simpan ke Firestore
        const newUserRef = await addDoc(collection(db, 'users'), {
            name,
            email,
            password: hashedPassword,
            role: userRole,
            plan: 'Belum Memilih Paket',
            createdAt: new Date().toISOString()
        });

        res.status(201).json({ message: 'Registrasi berhasil', userId: newUserRef.id });

    } catch (error) {
        console.error('Error saat register:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
});

// Login User & Admin
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Cari user berdasarkan email
        const usersCol = collection(db, 'users');
        const q = query(usersCol, where("email", "==", email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return res.status(404).json({ message: 'Email atau Password salah!' });
        }

        // Karena email unik, kita ambil dokumen pertama
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();

        // Bandingkan password
        const isMatch = await bcrypt.compare(password, userData.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Email atau Password salah!' });
        }

        // Buat JWT Token
        const payload = {
            id: userDoc.id,
            role: userData.role,
            name: userData.name
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

        res.status(200).json({ 
            message: 'Login berhasil', 
            token, 
            user: { id: userDoc.id, name: userData.name, email: userData.email, role: userData.role, plan: userData.plan }
        });

    } catch (error) {
        console.error('Error saat login:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
});

export default router;
