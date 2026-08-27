import { Router } from 'express';
import { getEvents, getEventBySlug, getEventPhotos, createEvent, updateEvent, deleteEvent, getFeaturedEvent } from '../controllers/eventController';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.get('/', getEvents);
router.get('/featured', getFeaturedEvent);
router.get('/:slug', getEventBySlug);
router.get('/:slug/photos', getEventPhotos);
router.post('/', authenticate, upload.single('coverImage'), createEvent);
router.put('/:id', authenticate, upload.single('coverImage'), updateEvent);
router.delete('/:id', authenticate, deleteEvent);

export default router;
