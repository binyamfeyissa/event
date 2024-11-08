import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Upload, Download, Search } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface Attendee {
  id: string;
  name: string;
  ticketCount: number;
  checkedIn: boolean;
  tickets: string[];
}

const TicketManager = () => {
  const { eventId } = useParams();
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = text.split('\n');
      const newAttendees: Attendee[] = rows.slice(1).map((row, index) => {
        const [name, ticketCount] = row.split(',');
        return {
          id: `${index}-${Date.now()}`,
          name: name.trim(),
          ticketCount: parseInt(ticketCount.trim(), 10),
          checkedIn: false,
          tickets: Array(parseInt(ticketCount.trim(), 10))
            .fill(0)
            .map(() => Math.random().toString(36).substr(2, 9)),
        };
      });
      setAttendees(newAttendees);
    };

    reader.readAsText(file);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv'],
    },
    multiple: false,
  });

  const filteredAttendees = attendees.filter((attendee) =>
    attendee.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Ticket Manager</h1>
        <div className="flex gap-4">
          <button className="btn btn-primary flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Tickets
          </button>
        </div>
      </div>

      <div
        {...getRootProps()}
        className={`mb-8 border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-orange-500 bg-orange-50' : 'border-gray-300'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">
          Drag and drop your CSV file here, or click to select
        </p>
        <p className="text-sm text-gray-500 mt-2">
          File should contain: Name, Number of Tickets
        </p>
      </div>

      <div className="relative mb-8">
        <input
          type="text"
          placeholder="Search attendees..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-12 py-4 bg-white rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
      </div>

      <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                Name
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                Tickets
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredAttendees.map((attendee) => (
              <tr key={attendee.id}>
                <td className="px-6 py-4">{attendee.name}</td>
                <td className="px-6 py-4">{attendee.ticketCount}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                      attendee.checkedIn
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {attendee.checkedIn ? 'Checked In' : 'Not Checked In'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TicketManager;