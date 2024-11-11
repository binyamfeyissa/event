import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Download } from 'lucide-react';
import { storage, db } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL, listAll } from 'firebase/storage';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import Masonry from 'react-masonry-css';

interface Props {
  eventId: string;
  event: any;
}

const WebsiteSection: React.FC<Props> = ({ eventId, event }) => {
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadPhotos();
  }, [eventId]);

  const loadPhotos = async () => {
    const photosRef = ref(storage, `events/${eventId}/photos`);
    const photosList = await listAll(photosRef);
    const urls = await Promise.all(
      photosList.items.map(item => getDownloadURL(item))
    );
    setPhotos(urls);
  };

  const onDrop = async (acceptedFiles: File[]) => {
    setUploading(true);
    try {
      const newPhotos = [];
      for (const file of acceptedFiles) {
        const photoRef = ref(storage, `events/${eventId}/photos/${Date.now()}-${file.name}`);
        await uploadBytes(photoRef, file);
        const url = await getDownloadURL(photoRef);
        newPhotos.push(url);
      }

      // Update Firestore with new photo URLs
      const eventRef = doc(db, 'events', eventId);
      await updateDoc(eventRef, {
        photos: arrayUnion(...newPhotos)
      });

      setPhotos(prev => [...prev, ...newPhotos]);
    } catch (error) {
      console.error('Error uploading photos:', error);
    }
    setUploading(false);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    }
  });

  const downloadThankYouCard = () => {
    // Implementation for thank you card download
    console.log('Downloading thank you card...');
  };

  return (
    <div className="max-w-6xl mx-auto bg-[#FAF7F5] p-8 rounded-3xl">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-serif mb-4">{event.couple}</h1>
        <p className="text-xl text-gray-600 mb-8">
          {new Date(event.date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
        <p className="text-gray-600 max-w-2xl mx-auto">
          May all the love be to God. Your warmth, love, and laughter filled our hearts with joy
          and made the day truly magical. Thank you for being a part of our journey and for the
          beautiful memories we created together.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
            ${uploading ? 'opacity-50' : ''} hover:border-orange-500`}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Upload Photos</p>
          {uploading && <p className="text-sm text-gray-500 mt-2">Uploading...</p>}
        </div>

        <button
          onClick={downloadThankYouCard}
          className="border-2 border-orange-500 rounded-xl p-8 text-center hover:bg-orange-50 transition-colors"
        >
          <Download className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <p className="text-orange-500">Download Thank You Card</p>
        </button>
      </div>

      <h2 className="text-4xl font-serif text-center mb-12">Our Wedding Gallery</h2>
      
      <Masonry
        breakpointCols={{
          default: 3,
          1100: 3,
          700: 2,
          500: 1
        }}
        className="flex -ml-4 w-auto"
        columnClassName="pl-4 bg-clip-padding"
      >
        {photos.map((photo, index) => (
          <div key={index} className="mb-4">
            <img
              src={photo}
              alt={`Wedding photo ${index + 1}`}
              className="w-full rounded-xl"
              loading="lazy"
            />
          </div>
        ))}
      </Masonry>
    </div>
  );
};

export default WebsiteSection;