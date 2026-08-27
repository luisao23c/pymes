import { Request, Response } from 'express';
import { Event, Photo } from '../models';
import { Op } from 'sequelize';
import { deleteImageFiles } from '../utils/imageProcessor';

export const getEvents = async (req: Request, res: Response) => {
  try {
    const { category, featured, page = '1', limit = '20' } = req.query;
    const where: any = {};
    if (category) where.category = category;
    if (featured !== undefined) where.featured = featured === 'true';

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    const { rows: events, count: total } = await Event.findAndCountAll({
      where,
      order: [['date', 'DESC']],
      offset,
      limit: parseInt(limit as string),
    });

    res.json({ events, total, page: parseInt(page as string), pages: Math.ceil(total / parseInt(limit as string)) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getEventBySlug = async (req: Request, res: Response) => {
  try {
    const event = await Event.findOne({ where: { slug: req.params.slug } });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getEventPhotos = async (req: Request, res: Response) => {
  try {
    const event = await Event.findOne({ where: { slug: req.params.slug } });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    const photos = await Photo.findAll({ where: { eventId: event.id }, order: [['order', 'ASC']] });
    res.json(photos);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createEvent = async (req: Request, res: Response) => {
  try {
    const { title, description, date, category, featured } = req.body;
    let slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const existing = await Event.findOne({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const eventData: any = { title, slug, description, date, category, featured: featured === 'true' || featured === true };
    if (req.file) {
      const { processImage } = await import('../utils/imageProcessor');
      const result = await processImage(req.file.filename);
      eventData.coverImage = `/uploads/originals/${req.file.filename}`;
      eventData.coverThumbnail = result.thumbnail;
    }

    const event = await Event.create(eventData);
    res.status(201).json(event);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  try {
    const { title, description, date, category, featured } = req.body;
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const updateData: any = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (date) updateData.date = date;
    if (category) updateData.category = category;
    if (featured !== undefined) updateData.featured = featured === 'true' || featured === true;

    if (req.file) {
      const { processImage, deleteImageFiles: del } = await import('../utils/imageProcessor');
      if (event.coverImage) {
        await del(event.coverImage, '', event.coverThumbnail);
      }
      const result = await processImage(req.file.filename);
      updateData.coverImage = `/uploads/originals/${req.file.filename}`;
      updateData.coverThumbnail = result.thumbnail;
    }

    await event.update(updateData);
    res.json(event);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const photos = await Photo.findAll({ where: { eventId: event.id } });
    const { deleteImageFiles: del } = await import('../utils/imageProcessor');
    for (const photo of photos) {
      await del(photo.originalPath, photo.compressedPath, photo.thumbnailPath);
    }
    await Photo.destroy({ where: { eventId: event.id } });

    if (event.coverImage) {
      await del(event.coverImage, '', event.coverThumbnail);
    }
    await event.destroy();
    res.json({ message: 'Event deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getFeaturedEvent = async (_req: Request, res: Response) => {
  try {
    const event = await Event.findOne({ where: { featured: true }, order: [['date', 'DESC']] });
    res.json(event || null);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
