import express from 'express';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, getDoc, query, where } from 'firebase/firestore';
import { db } from '../config/firebaseClient.js';

const router = express.Router();

// GET semua tagihan
router.get('/', async (req, res) => {
    try {
        const invCol = collection(db, 'invoices');
        const snapshot = await getDocs(invCol);
        const invList = snapshot.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(inv => !inv.isDeleted); // Exclude soft-deleted
        res.status(200).json(invList);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET tagihan oleh SubscriptionID
router.get('/subscription/:subId', async (req, res) => {
    try {
        const { subId } = req.params;
        const invCol = collection(db, 'invoices');
        const q = query(invCol, where('subscriptionId', '==', subId));
        const snapshot = await getDocs(q);
        const invList = snapshot.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(inv => !inv.isDeleted);
        res.status(200).json(invList);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET tagihan oleh CustomerID
router.get('/customer/:customerId', async (req, res) => {
    try {
        const { customerId } = req.params;
        const invCol = collection(db, 'invoices');
        const q = query(invCol, where('customerId', '==', customerId));
        const snapshot = await getDocs(q);
        const invList = snapshot.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(inv => !inv.isDeleted);
        res.status(200).json(invList);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST buat tagihan baru
router.post('/', async (req, res) => {
    try {
        const { subscriptionId, customerId, totalAmount, companyCode, dueDate } = req.body;

        const invoiceDate = new Date();
        const due = dueDate ? new Date(dueDate) : new Date();
        if (!dueDate) due.setDate(due.getDate() + 7); // Default jatuh tempo 7 hari

        const newInvRef = await addDoc(collection(db, 'invoices'), {
            subscriptionId: subscriptionId || '',
            customerId: customerId || '',
            invoiceDate: invoiceDate.toISOString(),
            dueDate: due.toISOString(),
            totalAmount: Number(totalAmount),
            companyCode: companyCode || '',
            status: 0, // 0 pending, 1 paid
            isDeleted: 0,
            createdDate: new Date().toISOString()
        });

        res.status(201).json({ id: newInvRef.id, message: 'Tagihan dibuat' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT update tagihan (status, nominal, due date, dll)
router.put('/:id', async (req, res) => {
    try {
        const invId = req.params.id;
        const invRef = doc(db, 'invoices', invId);

        const snap = await getDoc(invRef);
        if (!snap.exists()) {
            return res.status(404).json({ message: 'Tagihan tidak ditemukan.' });
        }

        const allowedFields = ['status', 'totalAmount', 'dueDate', 'invoiceDate', 'companyCode', 'notes'];
        const updates = {};
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = field === 'totalAmount' ? Number(req.body[field]) : req.body[field];
            }
        }
        updates.lastUpdatedDate = new Date().toISOString();

        await updateDoc(invRef, updates);
        res.status(200).json({ message: 'Tagihan berhasil diperbarui.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE tagihan (soft delete)
router.delete('/:id', async (req, res) => {
    try {
        const invId = req.params.id;
        const invRef = doc(db, 'invoices', invId);

        const snap = await getDoc(invRef);
        if (!snap.exists()) {
            return res.status(404).json({ message: 'Tagihan tidak ditemukan.' });
        }

        await updateDoc(invRef, {
            isDeleted: 1,
            deletedAt: new Date().toISOString(),
            lastUpdatedDate: new Date().toISOString()
        });

        res.status(200).json({ message: 'Tagihan berhasil dihapus.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
