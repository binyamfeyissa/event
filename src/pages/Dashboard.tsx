import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useEvents } from '../hooks/useEvents';
import { EventForm } from '../components/EventForm';
import WebsiteTemplates from '../components/WebsiteTemplates';

const Dashboard = () => {
  const { events, loading, addEvent, updateEvent } = useEvents();
  const [showEventForm, setShowEventForm] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEvents = events.filter(event =>
    event.couple.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTemplateSelect = async (templateId: string) => {
    if (selectedEventId) {
      await updateEvent(selectedEventId, {
        websiteTemplate: templateId,
        websiteUrl: `https://wedding.example.com/${selectedEventId}`
      });
      setShowTemplates(false);
      setSelectedEventId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Wedding Events</h1>
        <button
          onClick={() => setShowEventForm(true)}
          className="bg-orange-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-orange-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Event
        </button>
      </div>

      <div className="relative mb-8">
        <input
          type="text"
          placeholder="Search events..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-12 py-4 bg-white rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
      </div>

      {showTemplates ? (
        <>
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Select Website Template</h2>
            <button
              onClick={() => setShowTemplates(false)}
              className="text-gray-600 hover:text-gray-800"
            >
              Back to Events
            </button>
          </div>
          <WebsiteTemplates onSelect={handleTemplateSelect} />
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <img
                src={event.image}
                alt={event.couple}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{event.couple}</h3>
                <div className="space-y-2 text-gray-600">
                  <p>📅 {new Date(event.date).toLocaleDateString()}</p>
                  <p>📍 {event.location}</p>
                  <p>👥 {event.guests} Guests</p>
                  {event.websiteUrl && (
                    <p>🌐 <a href={event.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">View Website</a></p>
                  )}
                </div>
                <div className="mt-4 space-y-2">
                  {!event.websiteTemplate && (
                    <button
                      onClick={() => {
                        setSelectedEventId(event.id);
                        setShowTemplates(true);
                      }}
                      className="w-full bg-orange-50 text-orange-500 py-2 rounded-xl hover:bg-orange-100 transition-colors"
                    >
                      Create Website
                    </button>
                  )}
                  <button className="w-full border border-orange-500 text-orange-500 py-2 rounded-xl hover:bg-orange-50 transition-colors">
                    Manage Event
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showEventForm && (
        <EventForm
          onSubmit={addEvent}
          onClose={() => setShowEventForm(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;