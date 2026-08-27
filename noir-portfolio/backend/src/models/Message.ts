import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Message extends Model {
  declare id: number;
  declare name: string;
  declare email: string;
  declare phone: string;
  declare message: string;
  declare eventSlug: string;
  declare status: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Message.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    email: { type: DataTypes.STRING(255), allowNull: false },
    phone: { type: DataTypes.STRING(50), defaultValue: '' },
    message: { type: DataTypes.TEXT, allowNull: false },
    eventSlug: { type: DataTypes.STRING(255), defaultValue: '' },
    status: {
      type: DataTypes.ENUM('unread', 'read', 'responded'),
      defaultValue: 'unread',
    },
  },
  {
    sequelize,
    tableName: 'messages',
    timestamps: true,
  }
);

export default Message;
