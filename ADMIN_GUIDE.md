# MediCare - Patient Healthcare Booking Platform

## 🏥 Overview

MediCare is a modern, AI-powered healthcare booking platform built with Next.js 15, offering patients the ability to book appointments with verified doctors, receive AI-powered recommendations, and access medical analysis tools.

## ✨ Key Features

### 👥 Patient Features
- **Smart Doctor Booking** - Book appointments with verified doctors by date, time, and specialty
- **AI Doctor Finder** - Get personalized doctor recommendations using Gemini AI
- **Prescription Analyzer** - Upload prescription images for AI-powered analysis
- **Live Chat Support** - 24/7 AI chatbot assistance with Gemini integration
- **Doctor Directory** - Browse and filter doctors by specialization and location
- **Health Dashboard** - Track appointments and medical history

### 🏥 Admin Features
- **Secure Authentication** - Admin login with JWT token-based authentication
- **Appointment Management** - View, confirm, and cancel appointments
- **Doctor Management** - Add, edit, and manage doctors in the system
- **Patient Management** - Track registered patients and their history
- **Analytics & Reports** - View platform statistics and performance metrics
- **Web Scraping** - Automatically scrape and update doctor data from medical directories

## 🔐 Admin Access

### Login Credentials
The following demo credentials are available for testing:

```
Email: admin@medicare.com
Password: Admin@2024

OR

Email: root@medicare.com
Password: Root@2024
```

### How to Access Admin Panel

1. Click the **"Admin"** button in the navbar (top right)
2. You'll be redirected to `/admin-login`
3. Enter your credentials
4. After successful login, you'll have access to the **Admin Dashboard** at `/admin`

**Important:** The admin panel is protected by authentication. Unauthorized users trying to access `/admin` directly will be redirected to the login page.

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **UI**: React 19
- **Styling**: Tailwind CSS 3.x
- **State Management**: React Hooks

### Backend
- **API**: Next.js API Routes (RESTful)
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Prisma
- **Authentication**: NextAuth.js + JWT

### AI & Integrations
- **AI Assistant**: Google Gemini API (Chat & Image Analysis)
- **Web Scraping**: BeautifulSoup4 (Python) / Cheerio (Node.js)
- **Image Processing**: Gemini Vision API

## 📁 Project Structure

```
patient-booking/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Home page
│   │   ├── booking/              # Appointment booking
│   │   ├── doctors/              # Doctor directory & finder
│   │   ├── prescription-analyzer/ # Image analysis
│   │   ├── admin/                # Admin dashboard (protected)
│   │   ├── admin-login/          # Admin login page
│   │   ├── about/                # About company
│   │   ├── contact/              # Contact form
│   │   ├── api/
│   │   │   ├── appointments/     # Appointment CRUD
│   │   │   ├── doctors/          # Doctor CRUD
│   │   │   ├── auth/             # Authentication
│   │   │   ├── ai/               # AI endpoints
│   │   │   └── scraping/         # Web scraping
│   ├── components/
│   │   ├── Navbar.tsx
│   │   └── ChatBot.tsx
│   └── lib/
├── prisma/
│   └── schema.prisma            # Database schema
├── scripts/
│   └── scrape_doctors.py        # Web scraping script
└── .env.local                   # Environment variables
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL (via Supabase)
- Python 3.8+ (for web scraping)

### Installation

1. **Clone the repository**
   ```bash
   cd patient-booking
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your actual credentials:
   ```env
   # Supabase Database
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_KEY=your_service_key
   DATABASE_URL=your_postgresql_url
   
   # Google Gemini API
   GEMINI_API_KEY=your_gemini_api_key
   
   # Admin Authentication
   ADMIN_SECRET=your_admin_secret_key
   
   # Web Scraping
   SCRAPING_INTERVAL=3600000  # 1 hour in milliseconds
   ```

4. **Set up the database**
   ```bash
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   ```
   http://localhost:3000
   ```

## 🔌 API Endpoints

### Appointments
- `GET /api/appointments` - List all appointments
- `POST /api/appointments` - Create appointment
- `PATCH /api/appointments/[id]` - Update appointment status
- `DELETE /api/appointments/[id]` - Cancel appointment

### Doctors
- `GET /api/doctors` - List all doctors
- `POST /api/doctors` - Add new doctor
- `GET /api/doctors/recommend` - Get AI recommendations
- `GET /api/scraping/doctors` - Get scraped doctors

### AI Services
- `POST /api/ai/chat` - Chatbot endpoint
- `POST /api/ai/analyze-prescription` - Analyze prescription images

### Authentication
- `POST /api/auth/admin-login` - Admin login

## 🎨 Design & Color Scheme

The platform uses a modern emerald-teal-cyan gradient color scheme:
- **Primary**: Emerald (#10B981)
- **Secondary**: Teal (#14B8A6)
- **Accent**: Cyan (#06B6D4)

This creates a calming, trustworthy feel appropriate for healthcare.

## 🤖 AI Integration

### Gemini Chat
- Real-time conversation with medical knowledge
- Session-based chat history
- Context-aware responses
- Available 24/7 as a floating widget

### Image Analysis
- Upload prescription/medical images
- AI-powered analysis with severity levels
- Detailed health insights
- Stored analysis results in database

### Doctor Recommendations
- AI analyzes patient symptoms/conditions
- Recommends suitable doctors
- Displays specialization match
- Direct booking integration

## 🕷️ Web Scraping

The platform includes automated doctor data scraping:

```bash
# Manual scraping (from Python)
python scripts/scrape_doctors.py

# Or trigger via API
GET /api/scraping/doctors?specialty=Cardiology&location=Downtown
```

Supported filters:
- `specialty` - Doctor specialization
- `location` - Hospital or clinic location

## 📊 Database Models

### User
- Patient and admin profiles
- Email, phone, address
- Medical history references

### DoctorProfile
- Doctor details (name, qualification, experience)
- Specialization and availability
- Rating system
- Consultation fees

### Appointment
- Booking details
- Status tracking (pending/confirmed/completed/cancelled)
- Patient-Doctor relationship
- Time slot management

### ScrapedDoctor
- Scraped doctor information
- Source tracking
- Auto-indexed for quick searches
- Update timestamps

### ChatMessage
- Conversation history
- User and AI messages
- Session management

### MedicalPrescription
- Image analysis results
- Severity assessment
- Medical insights
- Timestamp tracking

## 🔒 Security Features

- **JWT Authentication**: Secure admin access
- **Password Hashing**: Encrypted credentials
- **Environment Variables**: Sensitive data protection
- **API Validation**: Input sanitization
- **CORS Protection**: Cross-origin request handling
- **Database Encryption**: Supabase security

## 📝 Admin Panel Features

### Dashboard
- Real-time statistics
- Total appointments, doctors, patients
- Quick action buttons

### Tabs
1. **Appointments** - Manage all bookings, update status
2. **Doctors** - Add/edit/remove doctors, view profiles
3. **Patients** - View registered patients, history
4. **Reports** - Analytics, trends, performance metrics

## 🧪 Testing

### Test Admin Accounts
```
admin@medicare.com / Admin@2024
root@medicare.com / Root@2024
```

### Test Doctor Booking
1. Go to `/booking`
2. Select a doctor and date
3. Provide reason for visit
4. Submit booking

### Test AI Features
1. **Chat**: Click floating chat bubble (bottom-right)
2. **Doctor Finder**: Navigate to `/doctors/finder`
3. **Prescription Analysis**: Go to `/prescription-analyzer`

## 🐛 Troubleshooting

### Admin Login Issues
- Clear browser cache and cookies
- Check if token is stored in localStorage
- Verify ADMIN_SECRET in .env.local

### Database Connection
- Confirm Supabase credentials in .env.local
- Run `npx prisma db push` to sync schema
- Check database URL format

### Gemini API Not Working
- Verify API key is valid
- Check API quota and usage
- Ensure API is enabled in Google Cloud Console

### Web Scraping Issues
- Install Python dependencies: `pip install beautifulsoup4 requests`
- Check website accessibility
- Verify scraping endpoints are not blocked

## 📞 Support

For support and questions:
- Contact: support@medicare.com
- Email: help@medicare.com
- Live Chat: Available in-app (24/7)

## 📄 License

This project is proprietary and confidential.

## 🤝 Contributing

Development guidelines and contribution process coming soon.

---

**MediCare** - Empowering Healthcare Through Technology 🏥✨
