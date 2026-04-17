import express from 'express';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebaseClient.js';

const router = express.Router();

// GET semua package (Bisa diakses publik/user/admin)
router.get('/', async (req, res) => {
    try {
        const packagesCol = collection(db, 'packages');
        const snapshot = await getDocs(packagesCol);
        const packageList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        res.status(200).json(packageList);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST package baru (Untuk Admin)
router.post('/', async (req, res) => {
    try {
        const { packageName, speed, price, description, companyCode, status } = req.body;
        
        const newPackageRef = await addDoc(collection(db, 'packages'), {
            packageName,
            speed,
            price: Number(price),
            description: description || '',
            companyCode: companyCode || '',
            status: status !== undefined ? status : 1, // 1 active, 0 inactive
            isDeleted: 0,
            createdDate: new Date().toISOString()
        });

        res.status(201).json({ id: newPackageRef.id, message: 'Paket berhasil ditambahkan' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT update package
router.put('/:id', async (req, res) => {
    try {
        const packageId = req.params.id;
        const updates = req.body;
        
        const packageRef = doc(db, 'packages', packageId);
        const packageSnap = await getDoc(packageRef);

        if (!packageSnap.exists()) {
            return res.status(404).json({ message: "Paket tidak ditemukan" });
        }

        await updateDoc(packageRef, {
            ...updates,
            lastUpdatedDate: new Date().toISOString()
        });

        res.status(200).json({ id: packageId, message: "Paket berhasil diupdate" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE package (soft delete)
router.delete('/:id', async (req, res) => {
    try {
        const packageId = req.params.id;
        const packageRef = doc(db, 'packages', packageId);
        
        await updateDoc(packageRef, {
            isDeleted: 1,
            lastUpdatedDate: new Date().toISOString()
        });

        res.status(200).json({ message: "Paket sukses dihapus" });
    } catch (error) {
         // Fallback ke hard delete jika dibutuhkan, namun ERD mencantumkan isDeleted flag.
         res.status(500).json({ message: error.message });
    }
});

export default router;
