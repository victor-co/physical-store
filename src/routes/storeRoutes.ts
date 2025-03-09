import express from 'express';
import { createStore, getNearbyStores } from '../controllers/storeController';
import { validateCreateStore, validateGetNearbyStores } from '../middlewares/validationMiddleware';

const router = express.Router();

router.post('/stores', validateCreateStore, createStore);
router.get('/stores/nearby', validateGetNearbyStores, getNearbyStores);

export default router;