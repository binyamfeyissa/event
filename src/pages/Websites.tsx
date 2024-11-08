import React, { useState } from 'react';
import { useEvents } from '../hooks/useEvents';
import WebsiteForm from '../components/WebsiteForm';
import WebsiteTemplates from '../components/WebsiteTemplates';

const Websites = () => {
  const { events } = useEvents();
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    setShowTemplates(false);
    setShowForm(true);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Wedding Websites</h1>

      {!selectedEvent && !showTemplates && !showForm && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
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
                <p className="text-gray-600 mb-4">
                  {new Date(event.date).toLocaleDateString()}
                </p>
                {event.websiteUrl ? (
                  <a
                    href={event.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary block text-center"
                  >
                    View Website
                  </a>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedEvent(event.id);
                      setShowTemplates(true);
                    }}
                    className="btn btn-primary block w-full"
                  >
                    Create Website
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showTemplates && (
        <WebsiteTemplates onSelect={handleTemplateSelect} />
      )}

      {showForm && selectedEvent && selectedTemplate && (
        <WebsiteForm
          eventId={selectedEvent}
          templateId={selectedTemplate}
          onClose={() => {
            setShowForm(false);
            setSelectedEvent(null);
            setSelectedTemplate(null);
          }}
        />
      )}
    </div>
  );
};

export default Websites;