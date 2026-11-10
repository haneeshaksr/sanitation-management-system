import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import path from 'path';
import bcrypt from 'bcryptjs';
import { db, ComplaintCategory, ComplaintStatus, ComplaintPriority } from './server/db.js';
import { authenticate, requireAdmin, generateToken, sanitizeUser, AuthRequest } from './server/auth.js';

const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO with CORS enabled
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH'],
  },
});

app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Socket.IO connection handling
io.on('connection', (socket) => {
  // Villager can join user room for targeted notifications
  socket.on('join:user', (userId: string) => {
    if (userId) {
      socket.join(`user:${userId}`);
    }
  });

  // Admin joins panchayat room
  socket.on('join:admin', () => {
    socket.join('panchayat:admin');
  });

  socket.on('disconnect', () => {
    // cleanup automatically handled by socket.io
  });
});

// Broadcast helper functions
export function broadcastComplaintCreated(complaint: any) {
  io.emit('complaint:created', complaint);
  io.emit('stats:updated', db.getStats());
}

export function broadcastComplaintUpdated(complaint: any) {
  // Broadcast to all clients for real-time tables
  io.emit('complaint:updated', complaint);
  // Send targeted event to user's room
  io.to(`user:${complaint.userId}`).emit('notification:new', {
    complaintId: complaint.complaintId,
    status: complaint.status,
    remarks: complaint.adminRemarks,
    message:
      complaint.status === 'Resolved'
        ? `Your complaint #${complaint.complaintId} has been Resolved successfully! 🌱`
        : `Your complaint #${complaint.complaintId} status is now ${complaint.status}.`,
  });
  io.emit('stats:updated', db.getStats());
}

// ==========================================
// AUTH ROUTES
// ==========================================

// Villager Registration
app.post('/api/auth/register', (req, res) => {
  try {
    const { fullName, mobileNumber, village, password, confirmPassword } = req.body;

    if (!fullName || !mobileNumber || !password) {
      return res.status(400).json({ error: 'Please provide full name, mobile number, and password.' });
    }

    const cleanMobile = mobileNumber.trim();
    if (cleanMobile.length < 10) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    const existing = db.findUserByMobile(cleanMobile);
    if (existing) {
      return res.status(400).json({ error: 'A user with this mobile number is already registered. Please login.' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const newUser = db.createUser({
      fullName: fullName.trim(),
      mobileNumber: cleanMobile,
      village: village?.trim() || 'Chandrugudem',
      passwordHash,
      role: 'villager',
    });

    const token = generateToken(newUser);
    return res.status(201).json({
      message: 'Registration successful! Welcome to CleanISS.',
      user: sanitizeUser(newUser),
      token,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Registration failed.' });
  }
});

// Login (Both Villager & Panchayat Admin)
app.post('/api/auth/login', (req, res) => {
  try {
    const { mobileNumber, password } = req.body;

    if (!mobileNumber || !password) {
      return res.status(400).json({ error: 'Please enter mobile number and password.' });
    }

    const cleanMobile = mobileNumber.trim();
    const user = db.findUserByMobile(cleanMobile);

    if (!user) {
      return res.status(401).json({ error: 'No account found with this mobile number.' });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect password. Please try again.' });
    }

    const token = generateToken(user);
    return res.json({
      message: 'Login successful!',
      user: sanitizeUser(user),
      token,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Login failed.' });
  }
});

// Current user verification
app.get('/api/auth/me', authenticate, (req: AuthRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  return res.json({ user: sanitizeUser(req.user) });
});

// ==========================================
// COMPLAINT ROUTES
// ==========================================

// Get complaints list
app.get('/api/complaints', authenticate, (req: AuthRequest, res) => {
  try {
    const { status, category, village, search, viewAll } = req.query;

    const isAdmin = req.user?.role === 'admin';
    const filterUserId = isAdmin && viewAll === 'true' ? undefined : req.user?._id;

    const complaints = db.getComplaints({
      userId: filterUserId,
      status: status as string,
      category: category as string,
      village: village as string,
      search: search as string,
    });

    return res.json({ complaints });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch complaints' });
  }
});

// Public / Authenticated complaint lookup by ID (for Track Complaint)
app.get('/api/complaints/:idOrNumber', (req, res) => {
  const { idOrNumber } = req.params;
  const complaint = db.getComplaintByIdOrNumber(idOrNumber);
  if (!complaint) {
    return res.status(404).json({ error: `Complaint #${idOrNumber} not found in Chandrugudem records.` });
  }
  return res.json({ complaint });
});

// Submit a new complaint
app.post('/api/complaints', authenticate, (req: AuthRequest, res) => {
  try {
    const { category, description, village, location, photoUrl, latitude, longitude } = req.body;

    if (!category || !description || !location) {
      return res.status(400).json({
        error: 'Please fill in required fields: Category, Description, and Location / Landmark.',
      });
    }

    const complaint = db.createComplaint({
      userId: req.user!._id,
      userName: req.user!.fullName,
      userMobile: req.user!.mobileNumber,
      category: category as ComplaintCategory,
      description: description.trim(),
      village: village?.trim() || req.user!.village || 'Chandrugudem',
      location: location.trim(),
      photoUrl: photoUrl || '',
      latitude: typeof latitude === 'number' ? latitude : null,
      longitude: typeof longitude === 'number' ? longitude : null,
    });

    // Real-time broadcast
    broadcastComplaintCreated(complaint);

    return res.status(201).json({
      message: 'Complaint Submitted Successfully! 🌱',
      complaint,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to submit complaint.' });
  }
});

// Admin updates complaint status, priority, and remarks
app.patch('/api/complaints/:id/status', requireAdmin, (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status, priority, adminRemarks } = req.body;

    const updated = db.updateComplaint(id, {
      status: status as ComplaintStatus,
      priority: priority as ComplaintPriority,
      adminRemarks: typeof adminRemarks === 'string' ? adminRemarks.trim() : undefined,
    });

    if (!updated) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }

    // Real-time broadcast to all clients and targeted villager
    broadcastComplaintUpdated(updated);

    return res.json({
      message: `Complaint #${updated.complaintId} status updated successfully.`,
      complaint: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to update complaint.' });
  }
});

// Get statistics summary
app.get('/api/stats', authenticate, (req: AuthRequest, res) => {
  try {
    const isAdmin = req.user?.role === 'admin';
    const userId = isAdmin ? undefined : req.user?._id;
    const stats = db.getStats(userId);
    const globalStats = db.getStats(); // admin or village wide
    return res.json({ stats, globalStats });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to compute stats' });
  }
});

// Public stats for landing page
app.get('/api/public-stats', (_req, res) => {
  const stats = db.getStats();
  return res.json({ stats });
});

// ==========================================
// NOTIFICATIONS
// ==========================================

app.get('/api/notifications', authenticate, (req: AuthRequest, res) => {
  const notifs = db.getUserNotifications(req.user!._id);
  return res.json({ notifications: notifs });
});

app.patch('/api/notifications/:id/read', authenticate, (req: AuthRequest, res) => {
  const success = db.markNotificationRead(req.params.id, req.user!._id);
  return res.json({ success });
});

app.patch('/api/notifications/read-all', authenticate, (req: AuthRequest, res) => {
  const count = db.markAllNotificationsRead(req.user!._id);
  return res.json({ updated: count });
});

// ==========================================
// ADMIN USER MANAGEMENT & REPORTS
// ==========================================

app.get('/api/admin/users', requireAdmin, (_req, res) => {
  const users = db.getAllUsers().map(sanitizeUser);
  return res.json({ users });
});

app.get('/api/admin/report-export', requireAdmin, (_req, res) => {
  const complaints = db.getComplaints();
  return res.json({
    generatedAt: new Date().toISOString(),
    village: 'Chandrugudem, Mylavaram Mandal, NTR District, Andhra Pradesh',
    summary: db.getStats(),
    records: complaints,
  });
});

// ==========================================
// AWARENESS & SCHEDULE
// ==========================================

app.get('/api/awareness', (_req, res) => {
  return res.json({
    village: 'Chandrugudem',
    mandal: 'Mylavaram',
    district: 'NTR District',
    state: 'Andhra Pradesh',
    panchayatOffice: 'Gram Panchayat Secretariat, Main Road, Chandrugudem - 521230',
    helplineNumbers: [
      { label: 'Chandrugudem Panchayat Secretary', phone: '+91 98480 12345' },
      { label: 'Sanitation Inspector (Mylavaram)', phone: '+91 94401 98765' },
      { label: 'AP Swachh Sankalpam Toll-Free', phone: '14420' },
      { label: 'CM Grievance Redressal (Spandana)', phone: '1902' },
    ],
    schedule: [
      { day: 'Every Day (7:00 AM - 10:00 AM)', task: 'Door-to-door segregated waste collection by sanitation rickshaws' },
      { day: 'Tuesday & Friday', task: 'Deep drain desilting and mosquito larvicide spraying' },
      { day: 'Every Saturday', task: 'Community cleanliness drive and public school & water tank sanitization' },
      { day: '1st & 15th of Every Month', task: 'Gram Panchayat Sanitation Committee review & grievance hearing' },
    ],
    wasteCategories: [
      {
        type: 'Wet Waste (Green Bin)',
        items: ['Vegetable & fruit peels', 'Leftover food & tea leaves', 'Fallen leaves & garden waste'],
        destination: 'Village Vermicompost Yard',
      },
      {
        type: 'Dry Waste (Blue Bin)',
        items: ['Plastic wrappers & bottles', 'Paper, cardboard, newspapers', 'Glass containers & metals'],
        destination: 'Solid Waste Processing Centre',
      },
      {
        type: 'Hazardous Waste (Red Bin)',
        items: ['Sanitary napkins & diapers', 'Medicines & pesticide bottles', 'Batteries & electrical wires'],
        destination: 'Safe Scientific Incineration',
      },
    ],
  });
});

// Image upload helper (converts base64 and verifies payload)
app.post('/api/upload', authenticate, (req, res) => {
  const { imageBase64, filename } = req.body;
  if (!imageBase64) {
    return res.status(400).json({ error: 'No image payload provided.' });
  }
  // For development and portability, we accept data URLs or store inline
  return res.json({
    url: imageBase64,
    name: filename || 'uploaded_issue.jpg',
  });
});

// Setup Vite middlewares for dev or static files for production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const port = Number(process.env.PORT) || 3000;

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(port, '0.0.0.0', () => {
    console.log(`CleanISS server running on port ${port} (mode: ${isProd ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
