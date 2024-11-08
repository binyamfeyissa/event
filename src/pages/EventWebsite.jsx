import React from 'react';
import { useParams } from 'react-router-dom';
import { useEvents } from '../hooks/useEvents';

const EventWebsite = () => {
  const { eventId } = useParams();
  const { events } = useEvents();
  const event = events.find(e => e.id === eventId);

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Event not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-screen">
        <img
          src={event.image}
          alt={event.couple}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center text-white text-center">
          <div>
            <h1 className="text-6xl font-serif mb-4">{event.couple}</h1>
            <p className="text-xl">
              {new Date(event.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
      </section>

      {/* Details Section */}
      <section className="max-w-4xl mx-auto py-20 px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-serif mb-6">Our Special Day</h2>
          <p className="text-gray-600 leading-relaxed">
            Join us in celebrating our love story as we begin this beautiful journey together.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="text-center">
            <h3 className="text-2xl font-serif mb-4">Ceremony</h3>
            <p className="text-gray-600 mb-2">
              {new Date(event.date).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit'
              })}
            </p>
            <p className="text-gray-600">{event.location}</p>
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-serif mb-4">Reception</h3>
            <p className="text-gray-600 mb-2">
              {new Date(new Date(event.date).getTime() + 2 * 60 * 60 * 1000).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit'
              })}
            </p>
            <p className="text-gray-600">{event.location}</p>
          </div>
        </div>
      </section>

      {/* Photo Upload Section */}
      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-serif mb-6">Share Your Photos</h2>
          <p className="text-gray-600 mb-8">
            Help us capture every moment by sharing your photos from our special day.
          </p>
          <button className="bg-orange-500 text-white px-8 py-3 rounded-xl hover:bg-orange-600 transition-colors">
            Upload Photos
          </button>
        </div>
      </section>

      {/* Thank You Card Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-serif mb-6">Thank You</h2>
          <p className="text-gray-600 mb-8">
            Download your personalized thank you card and share your memories with us.
          </p>
          <button className="border-2 border-orange-500 text-orange-500 px-8 py-3 rounded-xl hover:bg-orange-50 transition-colors">
            Download Thank You Card
          </button>
        </div>
      </section>
    </div>
  );
};

export default EventWebsite;