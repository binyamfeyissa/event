import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface WebsiteFormProps {
  eventId: string;
  templateId: string;
  onClose: () => void;
}

const WebsiteForm: React.FC<WebsiteFormProps> = ({
  eventId,
  templateId,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    photos: [] as string[],
  });

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
    },
    onDrop: (acceptedFiles) => {
      // In a real app, you'd upload these to Firebase Storage
      const newPhotos = acceptedFiles.map((file) =>
        URL.createObjectURL(file)
      );
      setFormData((prev) => ({
        ...prev,
        photos: [...prev.photos, ...newPhotos],
      }));
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    // Upload photos to Firebase Storage
    // Create website document in Firestore
    onClose();
  };

  return (
    <div className="bg-white rounded-3xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Website Details</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Website Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            className="w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            className="w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-orange-500"
            rows={4}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Google Maps Location
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                location: e.target.value,
              }))
            }
            className="w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-orange-500"
            placeholder="Paste Google Maps URL"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Photos
          </label>
          <div
            {...getRootProps()}
            className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-orange-500 transition-colors"
          >
            <input {...getInputProps()} />
            <p className="text-gray-600">
              Drag and drop photos here, or click to select
            </p>
          </div>
          {formData.photos.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-4">
              {formData.photos.map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-24 object-cover rounded-xl"
                />
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-orange-500 text-white py-3 rounded-xl hover:bg-orange-600 transition-colors"
        >
          Create Website
        </button>
      </form>
    </div>
  );
};

export default WebsiteForm;