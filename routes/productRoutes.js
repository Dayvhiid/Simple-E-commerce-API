import express from 'express';
import auth from '../middleware/auth.js';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/productController.js';

const router = express.Router();

router.post('/', auth, createProduct); // Protected route
router.get('/', getProducts); // Public route
router.get('/:id', getProductById);
router.put('/:id', auth, updateProduct); // Protected route
router.delete('/:id', auth, deleteProduct); // Protected route
export default router;