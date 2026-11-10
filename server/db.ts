import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export interface User {
  _id: string;
  fullName: string;
  mobileNumber: string;
  village: string;
  passwordHash: string;
  role: 'villager' | 'admin';
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

export interface Notification {
  _id: string;
  userId: string;
  complaintId: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface DatabaseSchema {
  users: User[];
  complaints: Complaint[];
  notifications: Notification[];
  nextComplaintNumber: number;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'cleaniss_db.json');

class DatabaseStore {
  private data: DatabaseSchema = {
    users: [],
    complaints: [],
    notifications: [],
    nextComplaintNumber: 1006,
  };

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        this.seedInitialData();
        this.persist();
      }
    } catch (err) {
      console.error('Failed to load database, seeding fresh data:', err);
      this.seedInitialData();
      this.persist();
    }
  }

  private persist() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving cleaniss_db.json:', err);
    }
  }

  private seedInitialData() {
    const adminPasswordHash = bcrypt.hashSync('Admin@123', 10);
    const villagerPasswordHash = bcrypt.hashSync('Village@123', 10);

    const adminUser: User = {
      _id: 'usr-admin-01',
      fullName: 'Sri K. Venkateswara Rao (Panchayat Secretary)',
      mobileNumber: '9848012345',
      village: 'Chandrugudem',
      passwordHash: adminPasswordHash,
      role: 'admin',
      createdAt: new Date('2026-01-01T08:00:00Z').toISOString(),
    };

    const villagerUser: User = {
      _id: 'usr-villager-01',
      fullName: 'Ramesh Babu',
      mobileNumber: '9440112233',
      village: 'Chandrugudem',
      passwordHash: villagerPasswordHash,
      role: 'villager',
      createdAt: new Date('2026-01-02T09:30:00Z').toISOString(),
    };

    const villagerUser2: User = {
      _id: 'usr-villager-02',
      fullName: 'Lakshmi Devi',
      mobileNumber: '9440556677',
      village: 'Chandrugudem',
      passwordHash: villagerPasswordHash,
      role: 'villager',
      createdAt: new Date('2026-01-05T10:15:00Z').toISOString(),
    };

    this.data.users = [adminUser, villagerUser, villagerUser2];

    this.data.complaints = [
      {
        _id: 'cmp-1001',
        complaintId: 'CLN-1001',
        userId: 'usr-villager-01',
        userName: 'Ramesh Babu',
        userMobile: '9440112233',
        category: 'Drainage Blockage',
        description: 'Underground silt and plastic waste blocking main drain line causing foul smell near temple approach.',
        village: 'Chandrugudem',
        location: 'Ramalayam Temple Street, Door No 3-45',
        photoUrl: '/src/assets/images/village_cleanliness_drive_1794321991944.jpg',
        latitude: 16.7335,
        longitude: 80.6421,
        status: 'Pending',
        priority: 'High',
        adminRemarks: '',
        createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
      },
      {
        _id: 'cmp-1002',
        complaintId: 'CLN-1002',
        userId: 'usr-villager-01',
        userName: 'Ramesh Babu',
        userMobile: '9440112233',
        category: 'Waste Accumulation',
        description: 'Vegetable waste and dry packaging piled up near weekly bazaar entrance.',
        village: 'Chandrugudem',
        location: 'Main Bazaar Road, near Rythu Seva Kendram',
        photoUrl: '/src/assets/images/village_cleanliness_drive_1794321991944.jpg',
        latitude: 16.7318,
        longitude: 80.6405,
        status: 'In Progress',
        priority: 'Urgent',
        adminRemarks: 'Tractor team dispatched with 4 sanitation workers. Clearance underway with lime bleaching.',
        createdAt: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      },
      {
        _id: 'cmp-1003',
        complaintId: 'CLN-1003',
        userId: 'usr-villager-02',
        userName: 'Lakshmi Devi',
        userMobile: '9440556677',
        category: 'Overflowing Drains',
        description: 'Excess drain water spilling onto cement road in front of primary health sub-centre.',
        village: 'Chandrugudem',
        location: 'Near Primary Health Centre (PHC) Gate',
        photoUrl: '/src/assets/images/hero_chandrugudem_village_1794321990689.jpg',
        latitude: 16.7342,
        longitude: 80.6433,
        status: 'Pending',
        priority: 'High',
        adminRemarks: 'Scheduled for drain suction tanker after morning bazaar shift.',
        createdAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
      },
      {
        _id: 'cmp-1004',
        complaintId: 'CLN-1004',
        userId: 'usr-villager-01',
        userName: 'Ramesh Babu',
        userMobile: '9440112233',
        category: 'Water Stagnation',
        description: 'Rain runoff pool stagnating for 4 days near school bus shelter, risking mosquito breeding.',
        village: 'Chandrugudem',
        location: 'Zilla Parishad High School Road',
        photoUrl: '/src/assets/images/hero_chandrugudem_village_1794321990689.jpg',
        latitude: 16.736,
        longitude: 80.6398,
        status: 'Resolved',
        priority: 'Medium',
        adminRemarks: 'Silt removed and gravel leveled. Stagnant water channeled to main stormwater drain.',
        createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
      },
      {
        _id: 'cmp-1005',
        complaintId: 'CLN-1005',
        userId: 'usr-villager-02',
        userName: 'Lakshmi Devi',
        userMobile: '9440556677',
        category: 'Street Cleanliness',
        description: 'Dust and fallen neem leaves need sweeping along community overhead water tank road.',
        village: 'Chandrugudem',
        location: 'Water Tank Road, Ward 4',
        photoUrl: '/src/assets/images/panchayat_office_building_1794321991895.jpg',
        latitude: 16.7322,
        longitude: 80.6445,
        status: 'Resolved',
        priority: 'Low',
        adminRemarks: 'Regular sweeping carried out and green waste shifted to vermicompost yard.',
        createdAt: new Date(Date.now() - 96 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
      },
    ];

    this.data.notifications = [
      {
        _id: 'notif-1',
        userId: 'usr-villager-01',
        complaintId: 'CLN-1002',
        message: 'Your complaint #CLN-1002 status was updated to In Progress. Sanitation team deployed.',
        read: false,
        createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      },
      {
        _id: 'notif-2',
        userId: 'usr-villager-01',
        complaintId: 'CLN-1004',
        message: 'Your complaint #CLN-1004 has been Resolved successfully! Thank you for keeping Chandrugudem clean.',
        read: true,
        createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
      },
    ];

    this.data.nextComplaintNumber = 1006;
  }

  // User operations
  findUserByMobile(mobileNumber: string): User | undefined {
    return this.data.users.find((u) => u.mobileNumber === mobileNumber.trim());
  }

  findUserById(id: string): User | undefined {
    return this.data.users.find((u) => u._id === id);
  }

  createUser(user: Omit<User, '_id' | 'createdAt'>): User {
    const newUser: User = {
      ...user,
      _id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    this.data.users.push(newUser);
    this.persist();
    return newUser;
  }

  getAllUsers(): User[] {
    return this.data.users;
  }

  // Complaint operations
  getComplaints(filters?: {
    userId?: string;
    status?: string;
    category?: string;
    village?: string;
    search?: string;
  }): Complaint[] {
    let list = [...this.data.complaints];

    if (filters?.userId) {
      list = list.filter((c) => c.userId === filters.userId);
    }

    if (filters?.status && filters.status !== 'All') {
      list = list.filter((c) => c.status.toLowerCase() === filters.status!.toLowerCase());
    }

    if (filters?.category && filters.category !== 'All') {
      list = list.filter((c) => c.category === filters.category);
    }

    if (filters?.village && filters.village !== 'All') {
      list = list.filter((c) => c.village.toLowerCase() === filters.village!.toLowerCase());
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.complaintId.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.userName.toLowerCase().includes(q) ||
          c.userMobile.includes(q)
      );
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getComplaintByIdOrNumber(idOrNum: string): Complaint | undefined {
    const clean = idOrNum.trim().toUpperCase();
    return this.data.complaints.find(
      (c) => c._id === idOrNum || c.complaintId.toUpperCase() === clean
    );
  }

  createComplaint(data: {
    userId: string;
    userName: string;
    userMobile: string;
    category: ComplaintCategory;
    description: string;
    village: string;
    location: string;
    photoUrl?: string;
    latitude?: number | null;
    longitude?: number | null;
  }): Complaint {
    const complaintNumber = this.data.nextComplaintNumber++;
    const complaintId = `CLN-${complaintNumber}`;
    const now = new Date().toISOString();

    const newComplaint: Complaint = {
      _id: `cmp-${Date.now()}`,
      complaintId,
      userId: data.userId,
      userName: data.userName,
      userMobile: data.userMobile,
      category: data.category,
      description: data.description,
      village: data.village || 'Chandrugudem',
      location: data.location,
      photoUrl: data.photoUrl || '',
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      status: 'Pending',
      priority: 'Medium',
      adminRemarks: '',
      createdAt: now,
      updatedAt: now,
    };

    this.data.complaints.unshift(newComplaint);

    // Create initial notification for user
    this.createNotification({
      userId: data.userId,
      complaintId,
      message: `Complaint #${complaintId} has been successfully submitted to Chandrugudem Panchayat. 🌱`,
    });

    this.persist();
    return newComplaint;
  }

  updateComplaint(
    id: string,
    updates: {
      status?: ComplaintStatus;
      priority?: ComplaintPriority;
      adminRemarks?: string;
    }
  ): Complaint | null {
    const complaint = this.data.complaints.find((c) => c._id === id || c.complaintId === id);
    if (!complaint) return null;

    const oldStatus = complaint.status;
    if (updates.status) complaint.status = updates.status;
    if (updates.priority) complaint.priority = updates.priority;
    if (updates.adminRemarks !== undefined) complaint.adminRemarks = updates.adminRemarks;
    complaint.updatedAt = new Date().toISOString();

    // Trigger notification if status changed or remarks added
    if (updates.status && updates.status !== oldStatus) {
      let notifMsg = `Your complaint #${complaint.complaintId} status changed to ${updates.status}.`;
      if (updates.status === 'Resolved') {
        notifMsg = `Your complaint #${complaint.complaintId} has been Resolved successfully! 🌱`;
      } else if (updates.status === 'In Progress') {
        notifMsg = `Your complaint #${complaint.complaintId} is now In Progress. Action initiated by Panchayat team.`;
      }
      this.createNotification({
        userId: complaint.userId,
        complaintId: complaint.complaintId,
        message: notifMsg,
      });
    } else if (updates.adminRemarks && updates.adminRemarks !== '') {
      this.createNotification({
        userId: complaint.userId,
        complaintId: complaint.complaintId,
        message: `Admin added remarks to #${complaint.complaintId}: "${updates.adminRemarks}"`,
      });
    }

    this.persist();
    return complaint;
  }

  getStats(userId?: string) {
    const list = userId
      ? this.data.complaints.filter((c) => c.userId === userId)
      : this.data.complaints;

    const total = list.length;
    const pending = list.filter((c) => c.status === 'Pending').length;
    const inProgress = list.filter((c) => c.status === 'In Progress').length;
    const resolved = list.filter((c) => c.status === 'Resolved').length;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    return {
      total,
      pending,
      inProgress,
      resolved,
      resolutionRate,
    };
  }

  // Notifications
  getUserNotifications(userId: string): Notification[] {
    return this.data.notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  createNotification(data: { userId: string; complaintId: string; message: string }): Notification {
    const notif: Notification = {
      _id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: data.userId,
      complaintId: data.complaintId,
      message: data.message,
      read: false,
      createdAt: new Date().toISOString(),
    };
    this.data.notifications.unshift(notif);
    this.persist();
    return notif;
  }

  markNotificationRead(id: string, userId: string): boolean {
    const notif = this.data.notifications.find((n) => n._id === id && n.userId === userId);
    if (notif) {
      notif.read = true;
      this.persist();
      return true;
    }
    return false;
  }

  markAllNotificationsRead(userId: string): number {
    let count = 0;
    this.data.notifications.forEach((n) => {
      if (n.userId === userId && !n.read) {
        n.read = true;
        count++;
      }
    });
    if (count > 0) this.persist();
    return count;
  }
}

export const db = new DatabaseStore();
