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

// Update data User (Biasa digunakan admin mengubah paket/nama)
router.put('/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const { name, plan, role } = req.body;
        
        const userRef = doc(db, 'users', userId);
        
        // Memastikan user ada
        const userSnap = await getDoc(userRef);
        if(!userSnap.exists()) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }

        await updateDoc(userRef, {
            name: name || userSnap.data().name,
            plan: plan || userSnap.data().plan,
            role: role || userSnap.data().role,
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
