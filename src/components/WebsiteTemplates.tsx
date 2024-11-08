import React from 'react';
import type { WebsiteTemplate } from '../types';

const templates: WebsiteTemplate[] = [
  {
    id: 'elegant-minimal',
    name: 'Elegant Minimal',
    description: 'A clean and modern design perfect for sophisticated couples',
    preview: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80',
    features: ['Photo Gallery', 'RSVP System', 'Thank You Cards', 'QR Code Integration']
  },
  {
    id: 'romantic-classic',
    name: 'Romantic Classic',
    description: 'Timeless design with romantic elements and soft colors',
    preview: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80',
    features: ['Guest Book', 'Timeline', 'Photo Uploads', 'Location Map']
  }
];

interface WebsiteTemplatesProps {
  onSelect: (templateId: string) => void;
}

const WebsiteTemplates: React.FC<WebsiteTemplatesProps> = ({ onSelect }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {templates.map((template) => (
        <div
          key={template.id}
          className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
        >
          <img
            src={template.preview}
            alt={template.name}
            className="w-full h-48 object-cover"
          />
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-2">{template.name}</h3>
            <p className="text-gray-600 mb-4">{template.description}</p>
            <div className="mb-4">
              <h4 className="font-medium mb-2">Features:</h4>
              <ul className="list-disc list-inside text-gray-600">
                {template.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => onSelect(template.id)}
              className="w-full bg-orange-50 text-orange-500 py-2 rounded-xl hover:bg-orange-100 transition-colors"
            >
              Select Template
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WebsiteTemplates;