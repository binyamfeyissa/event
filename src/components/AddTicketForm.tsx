import React, { useState } from 'react';
import { X } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface AddTicketFormProps {
  eventId: string;
  onClose: () => void;
}

const AddTicketForm: React.FC<AddTicketFormProps> = ({ eventId, onClose }) => {
  const [formData, setFormData] = useState({
    attendeeName: '',
    ticketCount: '1' // Initialize as string to avoid NaN warning
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const count = parseInt(formData.ticketCount, 10);

    try {
      for (let i = 0; i < count; i++) {
        const ticketId = Math.random().toString(36).substr(2, 9);
        await setDoc(doc(db, 'events', eventId, 'tickets', ticketId), {
          attendeeName: formData.attendeeName.trim(),
          ticketNumber: i + 1,
          totalTickets: count,
          checkedIn: false,
          status: 'active',
          createdAt: new Date()
        });
      }
      onClose();
    } catch (error) {
      console.error('Error adding ticket:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Add New Ticket</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Attendee Name
            </label>
            <input
              type="text"
              value={formData.attendeeName}
              onChange={(e) => setFormData(prev => ({ ...prev, attendeeName: e.target.value }))}
              className="w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Tickets
            </label>
            <input
              type="number"
              min="1"
              value={formData.ticketCount}
              onChange={(e) => setFormData(prev => ({ ...prev, ticketCount: e.target.value }))}
              className="w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-orange-500 text-white py-3 rounded-xl hover:bg-orange-600 transition-colors"
          >
            Add Ticket
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTicketForm;