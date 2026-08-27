import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Event extends Model {
  declare id: number;
  declare title: string;
  declare slug: string;
  declare description: string;
  declare date: Date;
  declare category: string;
  declare coverImage: string;
  declare coverThumbnail: string;
  declare photosCount: number;
  declare featured: boolean;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Event.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING(255), allowNull: false },
    slug: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    description: { type: DataTypes.TEXT, defaultValue: '' },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    category: {
      type: DataTypes.ENUM('bodas', 'retratos', 'paisajes', 'eventos', 'editorial', 'otro'),
      defaultValue: 'otro',
    },
    coverImage: { type: DataTypes.STRING(500), defaultValue: '' },
    coverThumbnail: { type: DataTypes.STRING(500), defaultValue: '' },
    photosCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    featured: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    sequelize,
    tableName: 'events',
    timestamps: true,
    hooks: {
      beforeValidate: (event: Event) => {
        if (!event.slug && event.title) {
          event.slug = event.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        }
      },
    },
  }
);

export default Event;
