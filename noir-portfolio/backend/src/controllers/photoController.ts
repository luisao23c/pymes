import { Request, Response } from 'express';
import { Photo, Event } from '../models';
import { processImage, deleteImageFiles } from '../utils/imageProcessor';

export const uploadPhotos = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.body;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const event = await Event.findByPk(eventId);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const photos = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const result = await processImage(file.filename);
      const photo = await Photo.create({
        eventId,
        originalName: file.originalname,
        filename: file.filename,
        originalPath: `/uploads/originals/${file.filename}`,
        compressedPath: result.compressed,
        thumbnailPath: result.thumbnail,
        width: result.width,
        height: result.height,
        size: file.size,
        order: i,
      });
      photos.push(photo);
    }

    const photosCount = await Photo.count({ where: { eventId } });
    await event.update({ photosCount });

    res.status(201).json({ photos, count: photos.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPhotosByEvent = async (req: Request, res: Response) => {
  try {
    const photos = await Photo.findAll({ where: { eventId: req.params.eventId }, order: [['order', 'ASC']] });
    res.json(photos);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updatePhoto = async (req: Request, res: Response) => {
  try {
    const { caption, order } = req.body;
    const photo = await Photo.findByPk(req.params.id);
    if (!photo) return res.status(404).json({ error: 'Photo not found' });

    const updateData: any = {};
    if (caption !== undefined) updateData.caption = caption;
    if (order !== undefined) updateData.order = order;
    await photo.update(updateData);
    res.json(photo);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deletePhoto = async (req: Request, res: Response) => {
  try {
    const photo = await Photo.findByPk(req.params.id);
    if (!photo) return res.status(404).json({ error: 'Photo not found' });

    await deleteImageFiles(photo.originalPath, photo.compressedPath, photo.thumbnailPath);
    await photo.destroy();

    const event = await Event.findByPk(photo.eventId);
    if (event) {
      const photosCount = await Photo.count({ where: { eventId: photo.eventId } });
      await event.update({ photosCount });
    }

    res.json({ message: 'Photo deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const reorderPhotos = async (req: Request, res: Response) => {
  try {
    const { photoIds } = req.body;
    for (let i = 0; i < photoIds.length; i++) {
      await Photo.update({ order: i }, { where: { id: photoIds[i] } });
    }
    res.json({ message: 'Photos reordered' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
