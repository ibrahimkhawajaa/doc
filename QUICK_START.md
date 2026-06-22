## 🚀 Quick Start Guide - MediCare Platform

### Step 1: Start the Development Server
```bash
cd patient-booking
npm run dev
```
The app will be available at `http://localhost:3000`

---

### Step 2: Access the Platform

#### **👥 For Patients**
- **Home Page**: `http://localhost:3000`
- **Browse Doctors**: `http://localhost:3000/doctors`
- **Book Appointment**: `http://localhost:3000/booking`
- **Find Doctor AI**: `http://localhost:3000/doctors/finder`
- **Analyze Prescription**: `http://localhost:3000/prescription-analyzer`

#### **🏥 For Admins**
1. Click **"Admin"** button in navbar (top right)
2. You'll be redirected to: `http://localhost:3000/admin-login`
3. Use these credentials:

```
Email: admin@medicare.com
Password: Admin@2024

OR

Email: root@medicare.com
Password: Root@2024
```

4. After login, access the dashboard at: `http://localhost:3000/admin`

---

### Step 3: Explore Admin Dashboard

#### **📊 Tabs Available**

| Tab | Features |
|-----|----------|
| **📅 Appointments** | View, confirm, and cancel appointments |
| **👨‍⚕️ Doctors** | Add new doctors, edit, delete |
| **👥 Patients** | View registered patients |
| **📊 Reports** | Analytics and performance metrics |

#### **⚡ Quick Actions**
- Confirm appointment: Click "Confirm" button
- Cancel appointment: Click "Cancel" button
- Add doctor: Fill form in Doctors tab
- Logout: Click "Logout" button (top right)

---

### Step 4: Test Key Features

#### **Search for Doctors**
1. Go to `/doctors`
2. Search by specialty (e.g., "Cardiology")
3. Filter by location (e.g., "Downtown")
4. Sort by rating, experience, or fee
5. Click "Book Now" on doctor card

#### **AI Doctor Finder**
1. Navigate to `/doctors/finder`
2. Describe your symptoms
3. AI will recommend suitable doctors
4. Click to book with recommended doctor

#### **Prescription Analyzer**
1. Go to `/prescription-analyzer`
2. Upload an image
3. Describe your condition
4. Get AI analysis results

#### **Live Chat**
- Click the floating chat bubble (bottom right)
- Chat with AI assistant 24/7

---

### Step 5: Configuration (Optional)

#### **To Connect Real Database (Supabase)**
1. Sign up at [supabase.co](https://supabase.co)
2. Create a new project
3. Copy your PostgreSQL connection URL
4. Update `.env.local`:
   ```env
   DATABASE_URL=postgresql://user:password@db.supabase.co/postgres
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_KEY=your_service_key
   ```
5. Run: `npx prisma db push`

#### **To Add Gemini API Key**
1. Get key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Update `.env.local`:
   ```env
   GEMINI_API_KEY=your_api_key
   ```

#### **To Enable Web Scraping**
1. Install Python dependencies:
   ```bash
   pip install beautifulsoup4 requests
   ```
2. Visit: `http://localhost:3000/api/scraping/doctors`
3. Add real medical website URLs to `scripts/scrape_doctors.py`

---

### 🎨 Color Scheme
The platform uses a modern emerald-teal-cyan theme:
- Buttons: Green gradients
- Highlights: Emerald, Teal, Cyan
- Text: Dark Gray on light backgrounds

---

### 🔐 Security Notes
- ✅ Admin panel is protected by login
- ✅ Tokens are stored in localStorage
- ✅ Logout clears all credentials
- ✅ Use strong passwords in production

---

### 📚 Documentation Files
- `README.md` - General project overview
- `ADMIN_GUIDE.md` - Detailed admin features
- `ENHANCEMENT_SUMMARY.md` - What's new in this version
- `PROJECT_SUMMARY.md` - Technical architecture

---

### ❓ Common Issues & Solutions

#### Admin login not working?
- Clear browser cache (Ctrl+Shift+Delete)
- Check if email/password is correct
- Try incognito mode

#### Doctors not loading?
- Check internet connection
- The app uses mock data by default
- Real data requires Supabase setup

#### AI features not working?
- Verify GEMINI_API_KEY in .env.local
- Check API quota on Google console
- Make sure API is enabled

---

### 🎯 What You Can Do Now

✅ Browse the beautiful UI
✅ Practice booking appointments
✅ Test admin panel
✅ Chat with AI assistant
✅ Analyze prescription images
✅ Manage doctors and appointments
✅ View analytics and reports

---

### 📞 Next Steps

1. **Try the Platform**: Spend 10 minutes exploring
2. **Test Admin Features**: Log in and manage appointments
3. **Set Up Database**: Connect your Supabase account
4. **Add Real Data**: Configure web scraping
5. **Deploy**: Push to production when ready

---

### 💡 Pro Tips

- Use keyboard shortcut `Ctrl+K` for quick navigation
- Mobile app is fully responsive
- Admin panel works on tablets
- Chat is available on all pages
- Bookmark `/admin-login` for quick access

---

### 🚀 Happy Healthcare Booking!

Your MediCare platform is ready. Start exploring at:
**http://localhost:3000**

For detailed admin features, see `ADMIN_GUIDE.md`

---

*Need help? Check the documentation files included in the project.*
