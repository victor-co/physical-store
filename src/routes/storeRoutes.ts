import express from 'express';
import { createStore, getNearbyStores } from '../controllers/storeController';

const router = express.Router();

router.post('/stores', createStore);
router.get('/stores/nearby', getNearbyStores);

export default router;