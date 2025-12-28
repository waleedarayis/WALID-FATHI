
export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  avatar: string;
  status: 'Active' | 'Inactive' | 'Pending';
  lastTransport: string;
}

export interface Message {
  id: string;
  clientId: string;
  clientName: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  priority: 'High' | 'Medium' | 'Low';
}

export interface Location {
  lat: number;
  lng: number;
  name: string;
  timestamp?: string;
}

export interface RouteStop {
  id: string;
  location: string;
  type: 'Pickup' | 'Delivery';
  carModel: string;
  status: 'Completed' | 'In Progress' | 'Scheduled';
  estimatedTime: string;
}

export interface TrafficSegment {
  id: string;
  intensity: 'Low' | 'Moderate' | 'Heavy';
  label: string;
}

export interface TransportState {
  currentLocation: Location;
  activeRoute: RouteStop[];
  speed: number;
  heading: number;
  trafficSegments?: TrafficSegment[];
}
