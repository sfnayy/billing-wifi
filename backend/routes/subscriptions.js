import express from 'express';
import { collection, getDocs, addDoc, doc, updateDoc, getDoc, query, where } from 'firebase/firestore';
import { db } from '../config/firebaseClient.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET semua langganan
router.get('/', async (req, res) => {
    try {
        const subCol = collection(db, 'subscriptions');
        const snapshot = await getDocs(subCol);
        const subList = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        res.status(200).json(subList);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET langganan berdasarkan customerID
router.get('/customer/:customerId', async (req, res) => {
    try {
        const { customerId } = req.params;
        const subCol = collection(db, 'subscriptions');
        const q = query(subCol, where('customerId', '==', customerId), where('isDeleted', '==', 0));
        const snapshot = await getDocs(q);
        const subList = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        res.status(200).json(subList);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST buat langganan baru (dan otomatis buat tagihan) — User login
router.post('/', async (req, res) => {
    try {
        const { customerId, packageId, companyCode, durationDays } = req.body;

        const days = durationDays ? parseInt(durationDays) : 30;
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + days);

        const pkgRef = doc(db, 'packages', packageId);
        const pkgSnap = await getDoc(pkgRef);
        let calculatedPrice = 0;
        let pkgName = '';

        if (pkgSnap.exists()) {
            const pkgData = pkgSnap.data();
            pkgName = pkgData.packageName;
            calculatedPrice = Math.round((pkgData.price / 30) * days);
        } else {
            return res.status(404).json({ message: 'Paket tidak ditemukan' });
        }

        const newSubRef = await addDoc(collection(db, 'subscriptions'), {
            customerId,
            packageId,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            companyCode: companyCode || '',
            status: 1,
            isDeleted: 0,
            createdDate: new Date().toISOString(),
        });

        // Update field plan di users
        const userRef = doc(db, 'users', customerId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            await updateDoc(userRef, { plan: pkgName });
        }

        // Otomatis buat tagihan
        const invoiceDate = new Date();
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 7);
        const newInvoiceRef = await addDoc(collection(db, 'invoices'), {
            subscriptionId: newSubRef.id,
            customerId,
            invoiceDate: invoiceDate.toISOString(),
            dueDate: dueDate.toISOString(),
            totalAmount: calculatedPrice,
            companyCode: companyCode || '',
            status: 0,
            isDeleted: 0,
            createdDate: new Date().toISOString(),
        });

        res.status(201).json({
            id: newSubRef.id,
            invoiceId: newInvoiceRef.id,
            amount: calculatedPrice,
            message: 'Langganan dan tagihan berhasil dibuat',
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT update langganan — Admin only
router.put('/:id', requireAdmin, async (req, res) => {
    try {
        const subId = req.params.id;
        const updates = req.body;

        const subRef = doc(db, 'subscriptions', subId);
        const snap = await getDoc(subRef);
        if (!snap.exists()) {
            return res.status(404).json({ message: 'Langganan tidak ditemukan.' });
        }

        await updateDoc(subRef, {
            ...updates,
            lastUpdatedDate: new Date().toISOString(),
        });

        res.status(200).json({ id: subId, message: 'Langganan diupdate' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE langganan (soft delete) — Admin only
router.delete('/:id', requireAdmin, async (req, res) => {
    try {
        const subId = req.params.id;
        const subRef = doc(db, 'subscriptions', subId);

        const snap = await getDoc(subRef);
        if (!snap.exists()) {
            return res.status(404).json({ message: 'Langganan tidak ditemukan.' });
        }

        const subData = snap.data();

        // Reset plan user jika ada
        if (subData.customerId) {
            const userRef = doc(db, 'users', subData.customerId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                await updateDoc(userRef, { plan: 'Belum Memilih Paket' });
            }
        }

        await updateDoc(subRef, {
            status: -1,
            isDeleted: 1,
            deletedAt: new Date().toISOString(),
            lastUpdatedDate: new Date().toISOString(),
        });

        res.status(200).json({ message: 'Langganan berhasil dibatalkan.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
