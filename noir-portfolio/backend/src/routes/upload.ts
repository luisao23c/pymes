import { Router } from 'express';
import { uploadPhotos } from '../controllers/photoController';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.post('/photos', authenticate, upload.array('photos', 50), uploadPhotos);

export default router;
