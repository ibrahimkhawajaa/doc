export interface DoctorRecord {
  id: string;
  name: string;
  specialization: string;
  experience: number;
  rating: number;
  consultationFee: number;
  consultationCurrency?: string;
  location: string;
  hospital: string;
  phone?: string;
  email?: string;
  imageUrl?: string;
  source?: string;
  profileUrl?: string;
}

export function formatConsultationFee(
  fee: number,
  currency: string = 'PKR'
): string {
  if (currency === 'PKR') {
    return `Rs. ${fee.toLocaleString('en-PK')}`;
  }
  return `$${fee}`;
}

export function getSpecialtyIcon(specialization: string): string {
  const spec = specialization.toLowerCase();
  if (spec.includes('cardio')) return '❤️';
  if (spec.includes('pediatr')) return '👶';
  if (spec.includes('neuro')) return '🧠';
  if (spec.includes('derma')) return '💆';
  if (spec.includes('ortho')) return '🦴';
  if (spec.includes('psych')) return '🧘';
  if (spec.includes('dent')) return '🦷';
  if (spec.includes('surg')) return '🔬';
  if (spec.includes('obstet') || spec.includes('gynec')) return '🤰';
  if (spec.includes('internal')) return '🩺';
  return '👨‍⚕️';
}

/** Stable portrait URL per doctor — works without storing image files */
export function getDoctorAvatarUrl(name: string, id: string): string {
  const seed = encodeURIComponent(id || name.replace(/\s+/g, '-'));
  return `https://api.dicebear.com/7.x/personas/png?seed=${seed}&backgroundColor=d1fae5,99f6e4,ccfbf1&size=256`;
}

export function isImageUrl(value?: string): boolean {
  return Boolean(value?.startsWith('http://') || value?.startsWith('https://'));
}

export function normalizeDoctor(
  doctor: Partial<DoctorRecord> & { name: string; specialization: string },
  index = 0
): DoctorRecord {
  const id =
    doctor.id ||
    `doc-${doctor.name.replace(/\s+/g, '-').toLowerCase()}-${index}`;

  const imageUrl = isImageUrl(doctor.imageUrl)
    ? doctor.imageUrl
    : getDoctorAvatarUrl(doctor.name, id);

  return {
    id,
    name: doctor.name,
    specialization: doctor.specialization,
    experience: doctor.experience ?? 8,
    rating: doctor.rating ?? 4.5,
    consultationFee: doctor.consultationFee ?? 200,
    consultationCurrency: doctor.consultationCurrency ?? 'PKR',
    location: doctor.location ?? 'Medical Center',
    hospital: doctor.hospital ?? 'General Hospital',
    phone: doctor.phone,
    email: doctor.email,
    imageUrl,
    source: doctor.source ?? 'medicare',
    profileUrl: doctor.profileUrl,
  };
}

export const FALLBACK_DOCTORS: DoctorRecord[] = [
  normalizeDoctor({
    id: '1',
    name: 'Dr. Ahmed Hassan',
    specialization: 'Cardiology',
    experience: 12,
    rating: 4.8,
    consultationFee: 250,
    location: 'Downtown Medical Center',
    hospital: 'Al-Noor Hospital',
    phone: '+1-800-123-4567',
  }),
  normalizeDoctor({
    id: '2',
    name: 'Dr. Sarah Johnson',
    specialization: 'Pediatrics',
    experience: 8,
    rating: 4.9,
    consultationFee: 200,
    location: 'Central Medical Plaza',
    hospital: 'Modern Healthcare',
    phone: '+1-800-234-5678',
  }),
  normalizeDoctor({
    id: '3',
    name: 'Dr. John Smith',
    specialization: 'Neurology',
    experience: 15,
    rating: 4.7,
    consultationFee: 300,
    location: 'Medical Tower',
    hospital: 'City Hospital',
    phone: '+1-800-345-6789',
  }),
  normalizeDoctor({
    id: '4',
    name: 'Dr. Fatima Ali',
    specialization: 'Dermatology',
    experience: 10,
    rating: 4.6,
    consultationFee: 220,
    location: 'Skin Care Center',
    hospital: 'Royal Medical',
    phone: '+1-800-456-7890',
  }),
  normalizeDoctor({
    id: '5',
    name: 'Dr. Mohammed Khan',
    specialization: 'Orthopedics',
    experience: 13,
    rating: 4.8,
    consultationFee: 280,
    location: 'Bone & Joint Center',
    hospital: 'Premier Hospital',
    phone: '+1-800-567-8901',
  }),
  normalizeDoctor({
    id: '6',
    name: 'Dr. Emily Chen',
    specialization: 'Obstetrics & Gynecology',
    experience: 11,
    rating: 4.9,
    consultationFee: 240,
    location: "Women's Health Center",
    hospital: "Women's Hospital",
    phone: '+1-800-678-9012',
  }),
];
