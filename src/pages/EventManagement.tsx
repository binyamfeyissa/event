import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, Download, Plus, Edit2, Trash2, Search } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { QRCodeCanvas } from 'qrcode.react';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import * as XLSX from 'xlsx';
import { collection, query, onSnapshot, addDoc, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useEvents } from '../hooks/useEvents';
import WebsiteSection from '../components/WebsiteSection';
import AddTicketForm from '../components/AddTicketForm';
import EditTicketForm from '../components/EditTicketForm';
import DeleteConfirmation from '../components/DeleteConfirmation';

interface Ticket {
  id: string;
  attendeeName: string;
  ticketNumber: number;
  totalTickets: number;
  checkedIn: boolean;
  status: 'active' | 'void';
  createdAt: Date;
}

interface Attendee {
  id: string;
  name: string;
  ticketCount: number;
  tickets: Ticket[];
}

const EventManagement = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { events, updateEvent, deleteEvent } = useEvents();
  const event = events.find(e => e.id === eventId);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [filteredAttendees, setFilteredAttendees] = useState<Attendee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'tickets' | 'website'>('tickets');
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const [currentTicketCode, setCurrentTicketCode] = useState<string>('');
  const [showAddTicketForm, setShowAddTicketForm] = useState(false);
  const [showEditTicketForm, setShowEditTicketForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditEvent, setShowEditEvent] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;

    setLoading(true);
    // Subscribe to tickets collection
    const ticketsQuery = query(collection(db, 'events', eventId, 'tickets'));
    const unsubscribe = onSnapshot(ticketsQuery, (snapshot) => {
      const ticketData: { [key: string]: Ticket[] } = {};
      
      snapshot.docs.forEach(doc => {
        const ticket = {
          id: doc.id,
          ...doc.data()
        } as Ticket;
        
        if (!ticketData[ticket.attendeeName]) {
          ticketData[ticket.attendeeName] = [];
        }
        ticketData[ticket.attendeeName].push(ticket);
      });

      const newAttendees = Object.entries(ticketData).map(([name, tickets]) => ({
        id: tickets[0].id,
        name,
        ticketCount: tickets.length,
        tickets: tickets.sort((a, b) => a.ticketNumber - b.ticketNumber)
      }));

      setAttendees(newAttendees);
      setFilteredAttendees(newAttendees);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [eventId]);

  useEffect(() => {
    const filtered = attendees.filter(attendee => 
      attendee.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAttendees(filtered);
  }, [searchTerm, attendees]);

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();

    reader.onload = async (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as string[][];

      for (const row of rows.slice(1)) {
        const [name, ticketCount] = row;
        const count = parseInt(ticketCount, 10);

        for (let i = 0; i < count; i++) {
          const ticketId = Math.random().toString(36).substr(2, 9);
          await setDoc(doc(db, 'events', eventId!, 'tickets', ticketId), {
            attendeeName: name.trim(),
            ticketNumber: i + 1,
            totalTickets: count,
            checkedIn: false,
            status: 'active',
            createdAt: new Date()
          });
        }
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const generateTicketPDF = async (attendee: Attendee, ticket: Ticket) => {
    setCurrentTicketCode(ticket.id);
    await new Promise(resolve => setTimeout(resolve, 100));

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a5'
    });

    // Background color
    pdf.setFillColor(251, 247, 245);
    pdf.rect(0, 0, pdf.internal.pageSize.width, pdf.internal.pageSize.height, 'F');

    // Event Title
    pdf.setFontSize(24);
    pdf.setTextColor(33, 33, 33);
    pdf.text(event?.couple || '', pdf.internal.pageSize.width / 2, 40, { align: 'center' });

    // Ticket Info
    pdf.setFontSize(16);
    pdf.text(`Ticket ${ticket.ticketNumber} of ${ticket.totalTickets}`, pdf.internal.pageSize.width / 2, 60, { align: 'center' });

    // QR Code
    if (qrCodeRef.current) {
      const canvas = qrCodeRef.current.querySelector('canvas');
      if (canvas) {
        const qrCodeDataUrl = canvas.toDataURL('image/png');
        pdf.addImage(qrCodeDataUrl, 'PNG', 
          (pdf.internal.pageSize.width - 50) / 2,
          70,
          50, 50
        );
      }
    }

    // Ticket Details
    pdf.setFontSize(12);
    const details = [
      `TICKET CODE: ${ticket.id}`,
      `ATTENDEE: ${attendee.name}`,
      `EVENT: ${event?.couple}`,
      `DATE: ${new Date(event?.date || '').toLocaleDateString()}`,
      `LOCATION: ${event?.location}`
    ];

    details.forEach((detail, index) => {
      pdf.text(detail, pdf.internal.pageSize.width / 2, 140 + (index * 10), { align: 'center' });
    });

    return pdf;
  };

  const downloadTickets = async (attendee: Attendee) => {
    const zip = new JSZip();

    for (const ticket of attendee.tickets) {
      const pdf = await generateTicketPDF(attendee, ticket);
      const pdfBlob = pdf.output('blob');
      zip.file(`${attendee.name}_ticket_${ticket.ticketNumber}_of_${ticket.totalTickets}.pdf`, pdfBlob);
    }

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${attendee.name}_tickets.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllTickets = async () => {
    const zip = new JSZip();

    for (const attendee of attendees) {
      for (const ticket of attendee.tickets) {
        const pdf = await generateTicketPDF(attendee, ticket);
        const pdfBlob = pdf.output('blob');
        zip.file(`${attendee.name}_ticket_${ticket.ticketNumber}_of_${ticket.totalTickets}.pdf`, pdfBlob);
      }
    }

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event?.couple}_all_tickets.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleVoidTicket = async (ticketId: string) => {
    await updateDoc(doc(db, 'events', eventId!, 'tickets', ticketId), {
      status: 'void'
    });
  };

  const handleDeleteTicket = async (ticketId: string) => {
    await deleteDoc(doc(db, 'events', eventId!, 'tickets', ticketId));
  };

  const handleDeleteEvent = async () => {
    if (!eventId) return;
    await deleteEvent(eventId);
    navigate('/');
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false
  });

  if (loading || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="hidden" ref={qrCodeRef}>
        <QRCodeCanvas value={currentTicketCode} size={100} />
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold">{event.couple}</h1>
          <p className="text-gray-600">{new Date(event.date).toLocaleDateString()}</p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setShowEditEvent(true)}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl"
          >
            <Edit2 className="w-4 h-4" />
            Edit Event
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl"
          >
            <Trash2 className="w-4 h-4" />
            Delete Event
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('tickets')}
              className={`px-4 py-2 rounded-xl transition-colors ${
                activeTab === 'tickets'
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-600 hover:bg-orange-50'
              }`}
            >
              Tickets
            </button>
            <button
              onClick={() => setActiveTab('website')}
              className={`px-4 py-2 rounded-xl transition-colors ${
                activeTab === 'website'
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-600 hover:bg-orange-50'
              }`}
            >
              Website
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'tickets' ? (
        <>
          <div className="bg-white rounded-3xl p-6 sm:p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Event Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-600">
              <div>
                <p className="font-medium">Date</p>
                <p>{new Date(event.date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="font-medium">Location</p>
                <p>{event.location}</p>
              </div>
              <div>
                <p className="font-medium">Expected Guests</p>
                <p>{event.guests}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div
              {...getRootProps()}
              className={`flex-1 border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-orange-500 bg-orange-50' : 'border-gray-300'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                Upload Excel File
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Name, Number of Tickets
              </p>
            </div>

            <button
              onClick={() => setShowAddTicketForm(true)}
              className="flex-1 flex items-center justify-center gap-2 bg-orange-500 text-white rounded-3xl p-6 sm:p-8 hover:bg-orange-600 transition-colors"
            >
              <Plus className="w-6 h-6" />
              Add Single Ticket
            </button>
          </div>

          <div className="flex justify-between items-center mb-4">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search attendees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border focus:ring-2 focus:ring-orange-500"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
            <button
              onClick={downloadAllTickets}
              className="ml-4 flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
            >
              <Download className="w-5 h-5" />
              Download All Tickets
            </button>
          </div>

          <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Tickets</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAttendees.map((attendee) => (
                    <tr key={attendee.id}>
                      <td className="px-6 py-4">{attendee.name}</td>
                      <td className="px-6 py-4">{attendee.ticketCount}</td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          {attendee.tickets.map((ticket) => (
                            <span
                              key={ticket.id}
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                                ticket.status === 'void'
                                  ? 'bg-red-100 text-red-800'
                                  : ticket.checkedIn
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              Ticket #{ticket.ticketNumber}: {ticket.status === 'void' ? 'Void' : ticket.checkedIn ? 'Checked In' : 'Not Checked In'}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedTicket(attendee.tickets[0]);
                              setShowEditTicketForm(true);
                            }}
                            className="text-orange-500 hover:text-orange-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => downloadTickets(attendee)}
                            className="text-orange-500 hover:text-orange-600"
                          >
                            Download
                          </button>
                          {attendee.tickets.some(t => t.status === 'active') && (
                            <button
                              onClick={() => {
                                attendee.tickets
                                  .filter(t => t.status === 'active')
                                  .forEach(t => handleVoidTicket(t.id));
                              }}
                              className="text-red-500 hover:text-red-600"
                            >
                              Void All
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <WebsiteSection eventId={eventId!} event={event} />
      )}

      {showAddTicketForm && (
        <AddTicketForm
          eventId={eventId!}
          onClose={() => setShowAddTicketForm(false)}
        />
      )}

      {showEditTicketForm && selectedTicket && (
        <EditTicketForm
          eventId={eventId!}
          ticket={selectedTicket}
          onClose={() => {
            setShowEditTicketForm(false);
            setSelectedTicket(null);
          }}
        />
      )}

      {showDeleteConfirm && (
        <DeleteConfirmation
          title="Delete Event"
          message="Are you sure you want to delete this event? This action cannot be undone."
          onConfirm={handleDeleteEvent}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
};

export default EventManagement;