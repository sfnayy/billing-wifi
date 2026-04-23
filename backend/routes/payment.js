import express from 'express';
import midtransClient from 'midtrans-client';
import dotenv from 'dotenv';
import { db } from '../config/firebaseClient.js';
import { doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';

dotenv.config();

const router = express.Router();

function normalizeBaseUrl(url) {
    if (!url || typeof url !== 'string') return '';
    return url.replace(/\/+$/, '');
}

function getFrontendBaseUrl(req) {
    const fromEnv = normalizeBaseUrl(process.env.FRONTEND_URL);
    if (fromEnv) return fromEnv;

    const origin = normalizeBaseUrl(req.get('origin'));
    if (origin) return origin;

    // As a last resort for local dev.
    return 'http://localhost:5173';
}

// Initialize Midtrans CoreApi / Snap
let snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY || 'YOUR_MIDTRANS_SERVER_KEY',
    clientKey: process.env.MIDTRANS_CLIENT_KEY || 'YOUR_MIDTRANS_CLIENT_KEY'
});

// Endpoint untuk Generate Token Transaksi
router.post('/charge', async (req, res) => {
    try {
        const { amount, customer_name, customer_email, invoice_ids } = req.body;

        const orderId = 'TRX-' + Date.now() + Math.floor(Math.random() * 1000);
        const frontendBaseUrl = getFrontendBaseUrl(req);

        let parameter = {
            "transaction_details": {
                "order_id": orderId,
                "gross_amount": amount
            },
            "credit_card": {
                "secure": true
            },
            "customer_details": {
                "first_name": customer_name,
                "email": customer_email,
            },
            "callbacks": {
                "finish": `${frontendBaseUrl}/user/payment/finish?order_id=${encodeURIComponent(orderId)}`
            }
        };

        const transaction = await snap.createTransaction(parameter);

        // Simpan transaksi status pending ke Firebase menggunakan orderId (atau invoiceID) sebagai Document ID
        await setDoc(doc(db, 'payments', orderId), {
            invoiceIds: invoice_ids || [], // Track which software invoices are covered
            customer_name: customer_name,
            customer_email: customer_email,
            amount: amount,
            status: 'pending',
            createdAt: new Date().toISOString()
        });

        res.status(200).json({ token: transaction.token, redirect_url: transaction.redirect_url });

    } catch (error) {
        console.error('Error in /charge:', error);
        res.status(500).json({ message: error.message });
    }
});

// Endpoint untuk mengecek status transaksi (berguna jika webhook tidak sampai)
router.get('/status/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        if (!orderId) return res.status(400).json({ message: 'orderId is required' });

        const statusResponse = await snap.transaction.status(orderId);
        const transactionStatus = statusResponse.transaction_status;
        const fraudStatus = statusResponse.fraud_status;

        const paymentRef = doc(db, 'payments', orderId);

        let finalStatus = transactionStatus;
        if (transactionStatus === 'capture') {
            if (fraudStatus === 'challenge') finalStatus = 'challenge';
            else if (fraudStatus === 'accept') finalStatus = 'success';
        } else if (transactionStatus === 'settlement') {
            finalStatus = 'success';
        } else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
            finalStatus = 'failed';
        } else if (transactionStatus === 'pending') {
            finalStatus = 'pending';
        }

        // Update firestore if record exists; if not, still return status.
        try {
            await updateDoc(paymentRef, { status: finalStatus, updatedAt: new Date().toISOString() });
        } catch (e) {
            // ignore (e.g. missing doc)
        }

        // Update linked invoices on success (best-effort)
        if (finalStatus === 'success') {
            try {
                const snapDoc = await getDoc(paymentRef);
                if (snapDoc.exists() && snapDoc.data().invoiceIds) {
                    const relatedIds = snapDoc.data().invoiceIds;
                    for (const invId of relatedIds) {
                        const invRef = doc(db, 'invoices', invId);
                        await updateDoc(invRef, {
                            status: 1,
                            lastUpdatedDate: new Date().toISOString()
                        });
                    }
                }
            } catch (e) {
                console.log("Error updating linked invoices", e);
            }
        }

        res.status(200).json({
            order_id: orderId,
            transaction_status: transactionStatus,
            mapped_status: finalStatus
        });
    } catch (error) {
        // Midtrans may return 404 if transaction doesn't exist yet / wrong order id
        const message = error?.message || 'Unknown error';
        const apiResp = error?.ApiResponse;
        const midtransStatusCode =
            (typeof apiResp === 'string' && (() => { try { return JSON.parse(apiResp)?.status_code; } catch { return undefined; } })()) ||
            apiResp?.status_code;

        if (message.includes("Transaction doesn't exist") || midtransStatusCode === '404' || midtransStatusCode === 404) {
            return res.status(404).json({
                order_id: req.params.orderId,
                mapped_status: 'not_found',
                message: "Transaksi belum ditemukan di Midtrans (order_id tidak valid atau belum terbuat)."
            });
        }

        console.error('Error in /status/:orderId:', error);
        res.status(500).json({ message });
    }
});

// Endpoint untuk Webhook Midtrans (Notifikasi Pembayaran)
router.post('/webhook', async (req, res) => {
    try {
        const statusResponse = await snap.transaction.notification(req.body);
        let orderId = statusResponse.order_id;
        let transactionStatus = statusResponse.transaction_status;
        let fraudStatus = statusResponse.fraud_status;

        console.log(`Transaction notification received. Order ID: ${orderId}. Transaction status: ${transactionStatus}. Fraud status: ${fraudStatus}`);

        // Update status pembayaran di database Firebase berdasarkan orderId
        const paymentRef = doc(db, 'payments', orderId);

        let finalStatus = transactionStatus;
        if (transactionStatus === 'capture') {
            if (fraudStatus === 'challenge') {
                finalStatus = 'challenge';
            } else if (fraudStatus === 'accept') {
                finalStatus = 'success';
            }
        } else if (transactionStatus === 'settlement') {
            finalStatus = 'success';
        } else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
            finalStatus = 'failed';
        } else if (transactionStatus === 'pending') {
            finalStatus = 'pending';
        }

        await updateDoc(paymentRef, {
            status: finalStatus,
            updatedAt: new Date().toISOString()
        });

        // Update Invoices jika sukses
        if (finalStatus === 'success') {
            try {
                const snapDoc = await getDoc(paymentRef);
                if (snapDoc.exists() && snapDoc.data().invoiceIds) {
                    const relatedIds = snapDoc.data().invoiceIds;
                    for (const invId of relatedIds) {
                        const invRef = doc(db, 'invoices', invId);
                        await updateDoc(invRef, {
                            status: 1, // Lunas
                            lastUpdatedDate: new Date().toISOString()
                        });
                    }
                }
            } catch (e) {
                console.log("Error updating linked invoices", e);
            }
        }

        res.status(200).send('OK');
    } catch (error) {
        console.error('Error in /webhook:', error);
        res.status(500).send('Internal Server Error');
    }
});

export default router;
