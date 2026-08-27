import dotenv from 'dotenv';
dotenv.config();

import sequelize from '../config/database';
import { User, Event } from '../models';

const seed = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to MariaDB');
    await sequelize.sync({ force: true });
    console.log('Tables recreated');

    const admin = await User.create({
      username: 'admin',
      email: 'admin@noir.com',
      password: 'admin123',
      role: 'admin',
    });
    console.log('Admin user created: admin@noir.com / admin123');

    const sampleEvents = [
      {
        title: 'Boda Marina & Carlos',
        slug: 'boda-marina-carlos',
        description: 'Una celebración mágica en la costa, capturando cada momento de amor y alegría.',
        date: '2024-10-15',
        category: 'bodas' as const,
        coverImage: '',
        coverThumbnail: '',
        featured: true,
        photosCount: 0,
      },
      {
        title: 'Retratos Urbanos',
        slug: 'retratos-urbanos',
        description: 'Sesión de retratos en el corazón de la ciudad, luces y sombras que cuentan historias.',
        date: '2024-09-20',
        category: 'retratos' as const,
        coverImage: '',
        coverThumbnail: '',
        featured: false,
        photosCount: 0,
      },
      {
        title: 'Atardecer en la Montaña',
        slug: 'atardecer-montana',
        description: 'Paisajes naturales capturados en los momentos más dramáticos del día.',
        date: '2024-08-10',
        category: 'paisajes' as const,
        coverImage: '',
        coverThumbnail: '',
        featured: false,
        photosCount: 0,
      },
      {
        title: 'Festival de Música',
        slug: 'festival-musica',
        description: 'La energía y el color de un festival nocturno, capturado en Negro y Blanco.',
        date: '2024-07-05',
        category: 'eventos' as const,
        coverImage: '',
        coverThumbnail: '',
        featured: false,
        photosCount: 0,
      },
    ];

    await Event.bulkCreate(sampleEvents);
    console.log('Sample events created');

    console.log('Seed completed');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
