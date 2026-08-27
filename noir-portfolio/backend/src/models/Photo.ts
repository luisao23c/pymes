import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Photo extends Model {
  declare id: number;
  declare eventId: number;
  declare originalName: string;
  declare filename: string;
  declare originalPath: string;
  declare compressedPath: string;
  declare thumbnailPath: string;
  declare width: number;
  declare height: number;
  declare size: number;
  declare order: number;
  declare caption: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Photo.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    eventId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'events', key: 'id' } },
    originalName: { type: DataTypes.STRING(255), allowNull: false },
    filename: { type: DataTypes.STRING(255), allowNull: false },
    originalPath: { type: DataTypes.STRING(500), allowNull: false },
    compressedPath: { type: DataTypes.STRING(500), allowNull: false },
    thumbnailPath: { type: DataTypes.STRING(500), allowNull: false },
    width: { type: DataTypes.INTEGER, defaultValue: 0 },
    height: { type: DataTypes.INTEGER, defaultValue: 0 },
    size: { type: DataTypes.BIGINT, defaultValue: 0 },
    order: { type: DataTypes.INTEGER, defaultValue: 0 },
    caption: { type: DataTypes.STRING(500), defaultValue: '' },
  },
  {
    sequelize,
    tableName: 'photos',
    timestamps: true,
  }
);

export default Photo;
