import express from 'express';
import midtransClient from 'midtrans-client';
import dotenv from 'dotenv';
import { db } from '../config/firebaseClient.js';

dotenv.config();

const router = express.Router();

// Initialize Midtrans CoreApi / Snap
let snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY || 'YOUR_MIDTRANS_SERVER_KEY',
    clientKey: process.env.MIDTRANS_CLIENT_KEY || 'YOUR_MIDTRANS_CLIENT_KEY'
});

// Endpoint untuk Generate Token Transaksi
router.post('/charge', async (req, res) => {
    try {
        const { amount, customer_name, customer_email } = req.body;

        const orderId = 'TRX-' + Math.floor(Math.random() * 10000000);

        let parameter = {
            "transaction_details": {
                "order_id": orderId,
                "gross_amount": amount
            },
            "credit_card":{
                "secure" : true
            },
            "customer_details": {
                "first_name": customer_name,
                "email": customer_email,
            }
        };

        const transaction = await snap.createTransaction(parameter);
        
        // Simpan transaksi status pending ke Firebase di sini jika diperlukan
        
        res.status(200).json({ token: transaction.token, redirect_url: transaction.redirect_url });

    } catch (error) {
        console.error('Error in /charge:', error);
        res.status(500).json({ message: error.message });
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
        // Firebase update query...

        res.status(200).send('OK');
    } catch (error) {
        console.error('Error in /webhook:', error);
        res.status(500).send('Internal Server Error');
    }
});

export default router;
