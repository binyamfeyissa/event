export interface Event {
  id: string;
  couple: string;
  date: string;
  location: string;
  image: string;
  guests: number;
  websiteTemplate?: string;
  websiteUrl?: string;
  status: 'draft' | 'active' | 'completed';
}

export interface WebsiteTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
  features: string[];
}