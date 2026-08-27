import { Router } from 'express';
import { sendMessage, getMessages, updateMessageStatus, deleteMessage, getMessageStats } from '../controllers/messageController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', sendMessage);
router.get('/', authenticate, getMessages);
router.get('/stats', authenticate, getMessageStats);
router.put('/:id/status', authenticate, updateMessageStatus);
router.delete('/:id', authenticate, deleteMessage);

export default router;
