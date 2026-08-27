import { Request, Response } from 'express';
import { Message } from '../models';

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, message, eventSlug } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email and message are required' });
    }
    await Message.create({ name, email, phone, message, eventSlug });
    res.status(201).json({ message: 'Message sent successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const { status, page = '1', limit = '20' } = req.query;
    const where: any = {};
    if (status) where.status = status;

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    const { rows: messages, count: total } = await Message.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      offset,
      limit: parseInt(limit as string),
    });
    const unreadCount = await Message.count({ where: { status: 'unread' } });

    res.json({ messages, total, unreadCount, page: parseInt(page as string), pages: Math.ceil(total / parseInt(limit as string)) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateMessageStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const message = await Message.findByPk(req.params.id);
    if (!message) return res.status(404).json({ error: 'Message not found' });
    await message.update({ status });
    res.json(message);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteMessage = async (req: Request, res: Response) => {
  try {
    const message = await Message.findByPk(req.params.id);
    if (!message) return res.status(404).json({ error: 'Message not found' });
    await message.destroy();
    res.json({ message: 'Message deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMessageStats = async (_req: Request, res: Response) => {
  try {
    const total = await Message.count();
    const unread = await Message.count({ where: { status: 'unread' } });
    const read = await Message.count({ where: { status: 'read' } });
    const responded = await Message.count({ where: { status: 'responded' } });
    res.json({ total, unread, read, responded });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
