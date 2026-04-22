import express from 'express';
import { collection, getDocs, doc, updateDoc, deleteDoc, getDoc, query, where } from 'firebase/firestore';
import { db } from '../config/firebaseClient.js';
import bcrypt from 'bcryptjs';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

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
router.put('/:id', requireAuth, async (req, res) => {
    try {
        const userId = req.params.id;
        
        // Authorization check: User can only update their own profile, unless they are admin
        if (req.user.id !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Akses ditolak." });
        }
        const { name, plan, role, gender, phone, email, address } = req.body;
        
        const userRef = doc(db, 'users', userId);
        
        // Memastikan user ada
        const userSnap = await getDoc(userRef);
        if(!userSnap.exists()) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }

        // Buat objek update hanya dengan field yang dikirim (tidak undefined)
        const updates = {};
        if (name !== undefined) updates.name = name;
        if (plan !== undefined) updates.plan = plan;
        if (role !== undefined) updates.role = role;
        if (gender !== undefined) updates.gender = gender;
        if (phone !== undefined) updates.phone = phone;
        if (email !== undefined) updates.email = email;
        if (address !== undefined) updates.address = address;
        
        updates.updatedAt = new Date().toISOString();

        await updateDoc(userRef, updates);

        res.status(200).json({ id: userId, message: "Berhasil diupdate" });
    } catch (error) {
        console.error("Error update user:", error);
        res.status(500).json({ message: error.message });
    }
});

// Hapus User (Oleh Admin)
router.delete('/:id', requireAdmin, async (req, res) => {
    try {
        const userId = req.params.id;
        const userRef = doc(db, 'users', userId);
        
        // Hapus Data User
        await deleteDoc(userRef);

        // Soft delete semua subscriptions milik user
        const subCol = collection(db, 'subscriptions');
        const qSub = query(subCol, where('customerId', '==', userId));
        const subSnap = await getDocs(qSub);
        for (const subDoc of subSnap.docs) {
            await updateDoc(subDoc.ref, { 
                status: -1, 
                isDeleted: 1, 
                deletedAt: new Date().toISOString() 
            });
        }

        // Soft delete semua invoices milik user
        const invCol = collection(db, 'invoices');
        const qInv = query(invCol, where('customerId', '==', userId));
        const invSnap = await getDocs(qInv);
        for (const invDoc of invSnap.docs) {
            await updateDoc(invDoc.ref, { 
                isDeleted: 1, 
                deletedAt: new Date().toISOString() 
            });
        }

        res.status(200).json({ message: "User sukses dihapus beserta seluruh datanya" });
    } catch (error) {
        console.error("Error delete user:", error);
        res.status(500).json({ message: error.message });
    }
});

export default router;
