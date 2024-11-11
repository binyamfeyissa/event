import React, { useState } from 'react';
import { X } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface Ticket {
  id: string;
  attendeeName: string;
  ticketNumber: number;
  totalTickets: number;
  checkedIn: boolean;
  status: 'active' | 'void';
}

interface EditTicketFormProps {
  eventId: string;
  ticket: Ticket;
  onClose: () => void;
}

const EditTicketForm: React.FC<EditTicketFormProps> = ({ eventId, ticket, onClose }) => {
  const [formData, setFormData] = useState({
    attendeeName: ticket.attendeeName,
    status: ticket.status
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, 'events', eventId, 'tickets', ticket.id), {
        attendeeName: formData.attendeeName.trim(),
        status: formData.status
      });
      onClose();
    } catch (error) {
      console.error('Error updating ticket:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Edit Ticket</h2>
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
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                status: e.target.value as 'active' | 'void'
              }))}
              className="w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-orange-500"
            >
              <option value="active">Active</option>
              <option value="void">Void</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-orange-500 text-white py-3 rounded-xl hover:bg-orange-600 transition-colors"
          >
            Update Ticket
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditTicketForm;