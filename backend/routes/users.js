import express from 'express';
import { collection, getDocs, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebaseClient.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Get Semua User (Digunakan Oleh Admin)
router.get('/', async (req, res) => {
    try {
        const usersCol = collection(db, 'users');
        const userSnapshot = await getDocs(usersCol);
        
        // Sembunyikan password dari response list
        const userList = userSnapshot.docs.map(doc => {
            const data = doc.data();
            delete data.password;
            return { id: doc.id, ...data };
        });

        res.status(200).json(userList);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get Spesifik User
router.get('/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }
        
        const data = userSnap.data();
        delete data.password;
        res.status(200).json({ id: userSnap.id, ...data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update data User (Profil atau Admin)
router.put('/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const { name, plan, role, gender, phone, email, address } = req.body;
        
        const userRef = doc(db, 'users', userId);
        
        // Memastikan user ada
        const userSnap = await getDoc(userRef);
        if(!userSnap.exists()) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }

        const currentData = userSnap.data();

        await updateDoc(userRef, {
            name: name !== undefined ? name : currentData.name,
            plan: plan !== undefined ? plan : currentData.plan,
            role: role !== undefined ? role : currentData.role,
            gender: gender !== undefined ? gender : currentData.gender || '',
            phone: phone !== undefined ? phone : currentData.phone || '',
            email: email !== undefined ? email : currentData.email,
            address: address !== undefined ? address : currentData.address || '',
            updatedAt: new Date().toISOString()
        });

        res.status(200).json({ id: userId, message: "Berhasil diupdate" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Hapus User (Oleh Admin)
router.delete('/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const userRef = doc(db, 'users', userId);
        
        await deleteDoc(userRef);
        res.status(200).json({ message: "User sukses dihapus" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
