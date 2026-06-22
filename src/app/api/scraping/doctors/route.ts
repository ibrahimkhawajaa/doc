import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { FALLBACK_DOCTORS, normalizeDoctor, type DoctorRecord } from '@/lib/doctors';

function spawnPython(scriptPath: string, args: string[] = []): ChildProcessWithoutNullStreams {
  const options = { stdio: ['pipe', 'pipe', 'pipe'] as ['pipe', 'pipe', 'pipe'] };

  if (process.platform === 'win32') {
    return spawn('py', ['-3', scriptPath, ...args], options);
  }

  return spawn('python3', [scriptPath, ...args], options);
}

async function scrapeDoctorData(limit?: number): Promise<DoctorRecord[]> {
  const scriptPath = path.join(process.cwd(), 'scripts', 'scrape_doctors.py');
  const args = limit ? [limit.toString()] : [];

  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';
    let settled = false;

    const finish = (doctors: DoctorRecord[]) => {
      if (settled) return;
      settled = true;
      resolve(doctors);
    };

    let python: ChildProcessWithoutNullStreams;

    try {
      python = spawnPython(scriptPath, args);
    } catch {
      finish(FALLBACK_DOCTORS);
      return;
    }

    python.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    python.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    python.on('close', (code) => {
      if (code !== 0) {
        console.error('Python script error:', stderr);
        finish(FALLBACK_DOCTORS);
        return;
      }

      try {
        const parsed = JSON.parse(stdout);
        if (Array.isArray(parsed)) {
          finish(parsed.map((doc, index) => normalizeDoctor(doc, index)));
        } else {
          finish(FALLBACK_DOCTORS);
        }
      } catch (error) {
        console.error('Parse error:', error, stdout);
        finish(FALLBACK_DOCTORS);
      }
    });

    python.on('error', (err) => {
      console.error('Python spawn error:', err);
      finish(FALLBACK_DOCTORS);
    });

    setTimeout(() => {
      python.kill();
      console.error('Scraping timeout');
      finish(FALLBACK_DOCTORS);
    }, 180000);
  });
}

async function syncDoctorsToDb(doctors: DoctorRecord[]) {
  for (const doctor of doctors) {
    await prisma.doctor.upsert({
      where: { id: doctor.id },
      update: {
        name: doctor.name,
        specialization: doctor.specialization,
        experience: doctor.experience,
        rating: doctor.rating,
        consultationFee: doctor.consultationFee,
        location: doctor.location,
        hospital: doctor.hospital,
        phone: doctor.phone,
        imageUrl: doctor.imageUrl,
        source: doctor.source ?? 'scraper',
        profileUrl: doctor.profileUrl,
        scrapedAt: new Date(),
      },
      create: {
        id: doctor.id,
        name: doctor.name,
        specialization: doctor.specialization,
        experience: doctor.experience,
        rating: doctor.rating,
        consultationFee: doctor.consultationFee,
        location: doctor.location,
        hospital: doctor.hospital,
        phone: doctor.phone,
        imageUrl: doctor.imageUrl,
        source: doctor.source ?? 'scraper',
        profileUrl: doctor.profileUrl,
        scrapedAt: new Date(),
      },
    });
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const specialty = searchParams.get('specialty');
    const location = searchParams.get('location');
    const refresh = searchParams.get('refresh') === 'true';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '24')));
    const delay = parseInt(searchParams.get('delay') || '500'); // Delay in ms

    let doctors: DoctorRecord[];

    if (refresh) {
      // Add delay before scraping
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      const scrapedDoctors = await scrapeDoctorData(100);
      await syncDoctorsToDb(scrapedDoctors);
      doctors = scrapedDoctors.map((doc, index) => normalizeDoctor(doc, index));
    } else {
      const dbDoctors = await prisma.doctor.findMany({ 
        orderBy: { rating: 'desc' }
      });
      
      // If we have fewer than 10 doctors, automatically scrape for more
      if (dbDoctors.length < 10) {
        console.log(`Only ${dbDoctors.length} doctors in DB. Auto-scraping for infinite scroll...`);
        if (delay > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        // Scrape in larger batches to enable pagination
        const scrapedDoctors = await scrapeDoctorData(100);
        await syncDoctorsToDb(scrapedDoctors);
        doctors = scrapedDoctors.map((doc, index) => normalizeDoctor(doc, index));
      } else {
        doctors = dbDoctors.map((doc, index) =>
          normalizeDoctor(
            {
              id: doc.id,
              name: doc.name,
              specialization: doc.specialization,
              experience: doc.experience,
              rating: doc.rating,
              consultationFee: doc.consultationFee,
              location: doc.location,
              hospital: doc.hospital,
              phone: doc.phone ?? undefined,
              email: doc.email ?? undefined,
              imageUrl: doc.imageUrl ?? undefined,
              source: doc.source,
              profileUrl: doc.profileUrl ?? undefined,
            },
            index
          )
        );
      }
    }

    let filtered = doctors;

    if (specialty) {
      filtered = filtered.filter((doc) =>
        doc.specialization.toLowerCase().includes(specialty.toLowerCase())
      );
    }

    if (location) {
      filtered = filtered.filter(
        (doc) =>
          doc.location.toLowerCase().includes(location.toLowerCase()) ||
          doc.hospital.toLowerCase().includes(location.toLowerCase())
      );
    }

    // Apply pagination
    const total = filtered.length;
    const startIdx = (page - 1) * limit;
    const endIdx = startIdx + limit;
    const paginatedDoctors = filtered.slice(startIdx, endIdx);

    const hasMore = endIdx < total;

    return NextResponse.json({
      success: true,
      count: paginatedDoctors.length,
      total,
      page,
      limit,
      hasMore,
      doctors: paginatedDoctors,
      source: refresh ? 'live-scraper' : 'database',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Scraping error:', error);
    return NextResponse.json({
      success: true,
      count: FALLBACK_DOCTORS.length,
      total: FALLBACK_DOCTORS.length,
      page: 1,
      limit: 12,
      hasMore: false,
      doctors: FALLBACK_DOCTORS,
      source: 'fallback',
      timestamp: new Date().toISOString(),
    });
  }
}
