import express from 'express';
import auth from '../middleware/auth.js';
import {   
    initiatePayment,    
    verifyPayment,    
    getOrderHistory, 
    getOrderById,
    handleWebhook 
} from '../controllers/paymentController.js';

const router = express.Router();

router.post('/initiate', auth, initiatePayment);
router.get('/verify/:reference', auth, verifyPayment);
router.get('/orders', auth, getOrderHistory);
router.get('/orders/:orderId', auth, getOrderById);
router.post('/webhook', handleWebhook); // No auth needed for webhook

export default router;