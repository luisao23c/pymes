import { Router } from 'express';
import { getPhotosByEvent, updatePhoto, deletePhoto, reorderPhotos } from '../controllers/photoController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/event/:eventId', getPhotosByEvent);
router.put('/:id', authenticate, updatePhoto);
router.delete('/:id', authenticate, deletePhoto);
router.put('/reorder/all', authenticate, reorderPhotos);

export default router;
