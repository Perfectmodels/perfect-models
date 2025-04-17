
import React from 'react';
import { Event } from '@/types/modelTypes';
import { Calendar } from 'lucide-react';

interface EventsListProps {
  events: Event[];
}

const EventsList: React.FC<EventsListProps> = ({ events }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <div key={event.id} className="bg-white shadow-md rounded-md overflow-hidden">
          <div className="h-48 overflow-hidden">
            <img 
              src={event.image || "https://via.placeholder.com/600x400?text=Événement"} 
              alt={event.name} 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-4">
            <h3 className="font-playfair text-xl mb-2">{event.name}</h3>
            {event.location && (
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Lieu:</span> {event.location}
              </p>
            )}
            {event.date && (
              <p className="text-sm text-gray-600 mb-2 flex items-center">
                <Calendar size={14} className="mr-1" />
                <span className="font-medium mr-1">Date:</span> {event.date}
              </p>
            )}
            <p className="text-gray-700">{event.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EventsList;
