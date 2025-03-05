import express from 'express';
import { createStore, getStores } from '../controllers/storeController';

const router = express.Router();

router.post('/stores', createStore);
router.get('/stores', getStores);

export default router;