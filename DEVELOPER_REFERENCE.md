# MediCare Developer Quick Reference

## 🚀 Start Development

```bash
cd 'C:\Users\G3NZ\Desktop\Ai(ibrahim)\patient-booking'
npm run dev
```

Then open: **http://localhost:3000**

---

## 📍 Key File Locations

### Pages
- Home: `src/app/page.tsx`
- Booking: `src/app/booking/page.tsx`
- Doctors: `src/app/doctors/page.tsx`
- AI Finder: `src/app/doctors/finder/page.tsx`
- Prescription: `src/app/prescription-analyzer/page.tsx`
- Admin: `src/app/admin/page.tsx`
- About: `src/app/about/page.tsx`
- Contact: `src/app/contact/page.tsx`

### Components
- Navbar: `src/components/Navbar.tsx`
- ChatBot: `src/components/ChatBot.tsx`

### API Routes
- Appointments: `src/app/api/appointments/route.ts`
- Doctors: `src/app/api/doctors/route.ts`
- AI Chat: `src/app/api/ai/chat/route.ts`
- Image Analysis: `src/app/api/ai/analyze-prescription/route.ts`

### Database
- Schema: `prisma/schema.prisma`
- Config: `.env.local`

---

## 🔧 Common Tasks

### Add New Page
1. Create folder: `src/app/new-page/`
2. Create file: `src/app/new-page/page.tsx`
3. Add to Navbar if needed

### Add New API Route
1. Create folder: `src/app/api/new-endpoint/`
2. Create file: `src/app/api/new-endpoint/route.ts`
3. Implement GET/POST/PUT/DELETE

### Modify Styling
- Edit Tailwind classes in component JSX
- Global styles: `src/app/globals.css`
- Config: `tailwind.config.ts`

### Add Database Model
1. Edit: `prisma/schema.prisma`
2. Run: `npx prisma db push`
3. Use in API routes

---

## 🎨 Color System

```tsx
// Primary Blue
className="bg-blue-600 hover:bg-blue-700"

// Success Green
className="bg-green-600"

// Error Red
className="bg-red-600"

// Neutral Gray
className="bg-gray-100 text-gray-900"

// Light Background
className="bg-blue-50"
```

---

## 📱 Responsive Breakpoints

```tsx
// Tailwind responsive
<div className="
  grid
  grid-cols-1          // Mobile
  md:grid-cols-2       // Tablet
  lg:grid-cols-3       // Desktop
  gap-4
">
```

---

## 🤖 Using Gemini AI

### In Chat API
```typescript
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
const result = await model.generateContent(prompt);
```

### In Image Analysis
```typescript
const result = await model.generateContent([
  {
    inlineData: {
      data: base64,
      mimeType: file.type,
    },
  },
  prompt,
]);
```

---

## 📊 Form Handling

### Using React Hook Form
```tsx
const { handleSubmit, watch } = useForm();

const onSubmit = async (data) => {
  const response = await fetch('/api/endpoint', {
    method: 'POST',
    body: JSON.stringify(data)
  });
};
```

---

## 🔒 Environment Variables

**Never commit `.env.local`**

```env
# Database
DATABASE_URL="mongodb+srv://user:password@cluster.mongodb.net/db"

# Gemini API
GEMINI_API_KEY="AIzaSy..."

# Authentication
NEXTAUTH_SECRET="random-long-string"
NEXTAUTH_URL="http://localhost:3000"

# API URL
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
```

---

## 🧪 Testing Features

### Test Chatbot
- Click 💬 button
- Ask questions
- Verify AI response

### Test Booking
- Fill appointment form
- Submit
- Check console for response

### Test Doctor Finder
- Go to `/doctors/finder`
- Enter condition
- See recommendations

### Test Admin
- Go to `/admin`
- Try status updates
- Check appointment list

---

## 📋 Database Models

### User
```prisma
- id, email, password, name, phone, address
- userType: "patient" | "doctor" | "admin"
- specialization, bio, profileImage
- createdAt, updatedAt
```

### Appointment
```prisma
- id, patientId, doctorId
- appointmentDate, timeSlot
- status: "pending" | "confirmed" | "completed" | "cancelled"
- reason, notes, type
```

### MedicalPrescription
```prisma
- id, userId, imageUrl, condition
- prescription, recommendations
- analyzedAt
```

---

## 🛠️ Useful Commands

```bash
# Development
npm run dev

# Build production
npm run build
npm start

# Format code
npm run lint

# Prisma
npx prisma generate        # Generate client
npx prisma db push         # Sync schema with DB
npx prisma studio         # Open visual editor

# Git
git init
git add .
git commit -m "Initial commit"
```

---

## 📚 API Examples

### Create Appointment
```bash
POST /api/appointments
{
  "name": "John",
  "email": "john@example.com",
  "doctor": "dr-ahmed",
  "date": "2024-01-15",
  "time": "10:00",
  "reason": "Checkup"
}
```

### Get Recommendations
```bash
POST /api/doctors/recommend
{
  "condition": "chest pain"
}
```

### Chat with AI
```bash
POST /api/ai/chat
{
  "message": "How do I book?",
  "sessionId": "user-123"
}
```

### Analyze Image
```bash
POST /api/ai/analyze-prescription
FormData:
- file: <image>
- condition: "skin rash"
```

---

## 🎯 Deployment Checklist

- [ ] Set all environment variables
- [ ] Change NEXTAUTH_SECRET
- [ ] Set DATABASE_URL to production MongoDB
- [ ] Set GEMINI_API_KEY
- [ ] Build and test: `npm run build && npm start`
- [ ] Deploy to Vercel/Netlify
- [ ] Test all features on live site
- [ ] Set up monitoring

---

## 🐛 Debugging

### Check Console Errors
- Browser console (F12)
- Terminal output

### Enable Prisma Logging
```env
DEBUG="prisma:*"
```

### Test API Endpoints
```bash
curl -X POST http://localhost:3000/api/appointments \
  -H "Content-Type: application/json" \
  -d '{"name":"Test"}'
```

---

## 📖 Documentation Files

- `README.md` - Complete documentation
- `SETUP_GUIDE.md` - Quick start guide
- `PROJECT_SUMMARY.md` - Project overview
- This file - Developer reference

---

## 🎉 Ready!

Your project is set up and ready to use. Start with:

```bash
npm run dev
```

**Happy coding! 💻**
