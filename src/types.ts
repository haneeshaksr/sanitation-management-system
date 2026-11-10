export type UserRole = 'villager' | 'admin';

export interface User {
  _id: string;
  fullName: string;
  mobileNumber: string;
  village: string;
  role: UserRole;
  createdAt: string;
}

export type ComplaintCategory =
  | 'Waste Accumulation'
  | 'Drainage Blockage'
  | 'Overflowing Drains'
  | 'Water Stagnation'
  | 'Street Cleanliness';

export type ComplaintStatus = 'Pending' | 'In Progress' | 'Resolved';
export type ComplaintPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface Complaint {
  _id: string;
  complaintId: string;
  userId: string;
  userName: string;
  userMobile: string;
  category: ComplaintCategory;
  description: string;
  village: string;
  location: string;
  photoUrl: string;
  latitude: number | null;
  longitude: number | null;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  adminRemarks: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  _id: string;
  userId: string;
  complaintId: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface ComplaintStats {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  resolutionRate: number;
}

export interface AwarenessSchedule {
  day: string;
  task: string;
}

export interface WasteCategory {
  type: string;
  items: string[];
  destination: string;
}

export interface HelplineItem {
  label: string;
  phone: string;
}

export interface AwarenessData {
  village: string;
  mandal: string;
  district: string;
  state: string;
  panchayatOffice: string;
  helplineNumbers: HelplineItem[];
  schedule: AwarenessSchedule[];
  wasteCategories: WasteCategory[];
}
