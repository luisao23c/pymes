import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

const UPLOADS_DIR = path.join(__dirname, '../../uploads');

export const processImage = async (filename: string): Promise<{ compressed: string; thumbnail: string; width: number; height: number }> => {
  const originalPath = path.join(UPLOADS_DIR, 'originals', filename);
  const compressedDir = path.join(UPLOADS_DIR, 'compressed');
  const thumbnailsDir = path.join(UPLOADS_DIR, 'thumbnails');

  await fs.mkdir(compressedDir, { recursive: true });
  await fs.mkdir(thumbnailsDir, { recursive: true });

  const metadata = await sharp(originalPath).metadata();

  const compressedFilename = `compressed_${filename.replace(/\.[^.]+$/, '.webp')}`;
  const compressedPath = path.join(compressedDir, compressedFilename);
  await sharp(originalPath)
    .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(compressedPath);

  const thumbnailFilename = `thumb_${filename.replace(/\.[^.]+$/, '.webp')}`;
  const thumbnailPath = path.join(thumbnailsDir, thumbnailFilename);
  await sharp(originalPath)
    .resize(400, 300, { fit: 'cover' })
    .webp({ quality: 75 })
    .toFile(thumbnailPath);

  return {
    compressed: `/uploads/compressed/${compressedFilename}`,
    thumbnail: `/uploads/thumbnails/${thumbnailFilename}`,
    width: metadata.width || 0,
    height: metadata.height || 0,
  };
};

export const deleteImageFiles = async (originalPath: string, compressedPath: string, thumbnailPath: string) => {
  const paths = [originalPath, compressedPath, thumbnailPath];
  for (const p of paths) {
    try {
      const fullPath = path.join(__dirname, '../..', p);
      await fs.unlink(fullPath);
    } catch {
      // File might not exist
    }
  }
};
