import Event from './Event';
import Photo from './Photo';
import Message from './Message';
import User from './User';

Event.hasMany(Photo, { foreignKey: 'eventId', as: 'photos', onDelete: 'CASCADE' });
Photo.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });

export { Event, Photo, Message, User };
