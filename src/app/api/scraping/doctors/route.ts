import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { FALLBACK_DOCTORS, normalizeDoctor, type DoctorRecord } from '@/lib/doctors';
import { prisma } from '@/lib/db';

function spawnPython(scriptPath: string, args: string[] = []): ChildProcessWithoutNullStreams {
  const options = { stdio: ['pipe', 'pipe', 'pipe'] as ['pipe', 'pipe', 'pipe'] };

  if (process.platform === 'win32') {
    return spawn('py', ['-3', scriptPath, ...args], options);
  }

  return spawn('python3', [scriptPath, ...args], options);
}

async function scrapeDoctorData(limit?: number): Promise<DoctorRecord[]> {
  // For immediate fix, try Python but fallback quickly
  const scriptPath = path.join(process.cwd(), 'scripts', 'scrape_doctors.py');
  const args = limit ? [limit.toString()] : [];

  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';
    let settled = false;
    let pythonProcess: ChildProcessWithoutNullStreams | null = null;
    let timeoutId: NodeJS.Timeout;

    const finish = (doctors: DoctorRecord[]) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      if (pythonProcess && !pythonProcess.killed) {
        try {
          pythonProcess.kill();
        } catch (e) {
          // Ignore
        }
      }
      resolve(doctors);
    };

    // Set timeout - if Python takes too long, just use fallback
    timeoutId = setTimeout(() => {
      if (!settled) {
        console.warn('Python scraping timeout, using fallback');
        if (pythonProcess) {
          pythonProcess.kill();
        }
        finish(FALLBACK_DOCTORS);
      }
    }, 60000);  // 60 second timeout for scraping (increased from 20s)

    try {
      pythonProcess = spawnPython(scriptPath, args);
    } catch (err) {
      console.warn('Python spawn failed, using fallback:', err);
      finish(FALLBACK_DOCTORS);
      return;
    }

    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (settled) return;

      if (code === 0 && stdout) {
        try {
          const parsed = JSON.parse(stdout);
          if (Array.isArray(parsed) && parsed.length > 0) {
            console.log(`Python returned ${parsed.length} doctors`);
            finish(parsed.map((doc: any, index: number) => normalizeDoctor(doc, index)));
            return;
          }
        } catch (parseError) {
          console.warn('Failed to parse Python output, using fallback');
        }
      }
      
      finish(FALLBACK_DOCTORS);
    });

    pythonProcess.on('error', (err) => {
      if (!settled) {
        console.warn('Python process error, using fallback:', err);
        finish(FALLBACK_DOCTORS);
      }
    });
  });
}

async function syncDoctorsToDb(doctors: DoctorRecord[]) {
  try {
    for (const doctor of doctors) {
      // Check if doctor already exists by email or name+location combo
      const existing = await prisma.doctor.findFirst({
        where: {
          OR: [
            { email: doctor.email },
            {
              AND: [
                { name: doctor.name },
                { location: doctor.location }
              ]
            }
          ]
        }
      });

      if (!existing) {
        // New doctor - add to database
        await prisma.doctor.create({
          data: {
            name: doctor.name,
            specialization: doctor.specialization,
            experience: doctor.experience || 5,
            rating: doctor.rating || 4.5,
            consultationFee: doctor.consultationFee || 200,
            location: doctor.location,
            hospital: doctor.hospital,
            phone: doctor.phone,
            email: doctor.email,
            imageUrl: doctor.imageUrl,
            source: 'scraped',
            profileUrl: doctor.profileUrl,
            scrapedAt: new Date(),
          }
        });
        console.log(`Added new doctor: ${doctor.name}`);
      } else {
        // Update existing doctor
        await prisma.doctor.update({
          where: { id: existing.id },
          data: {
            rating: doctor.rating || existing.rating,
            scrapedAt: new Date(),
          }
        });
      }
    }
    console.log(`Synced ${doctors.length} doctors to database`);
  } catch (error) {
    console.error('Database sync error:', error);
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const specialty = searchParams.get('specialty');
    const location = searchParams.get('location');
    const refresh = searchParams.get('refresh') === 'true';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '24')));
    const delay = parseInt(searchParams.get('delay') || '500');

    let doctors: DoctorRecord[] = [];
    let source = 'fallback';

    try {
      // Always try to scrape fresh data or use fallback
       if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      console.log('Attempting to scrape doctor data...');
      const scrapedDoctors = await scrapeDoctorData(150);
        if (scrapedDoctors && scrapedDoctors.length > 6) {
        // We got real data from Python
        console.log(`Scraped ${scrapedDoctors.length} doctors from live source`);
        doctors = scrapedDoctors.map((doc, index) => normalizeDoctor(doc, index));
        source = 'live-scraper';
        
        // Sync to database in background (don't await)
        syncDoctorsToDb(doctors).catch(err => console.error('Background sync failed:', err));
      } else {
        // Try to get from database
        try {
          const dbDoctors = await prisma.doctor.findMany({
            orderBy: [{ rating: 'desc' }, { experience: 'desc' }],
            take: 100
          });
          if (dbDoctors.length > 0) {
            console.log(`Using ${dbDoctors.length} doctors from database`);
            doctors = dbDoctors.map((doc, index) => normalizeDoctor({
              id: doc.id,
              name: doc.name,
              specialization: doc.specialization,
              experience: doc.experience,
              rating: doc.rating,
              consultationFee: doc.consultationFee,
              location: doc.location,
              hospital: doc.hospital,
              phone: doc.phone || undefined,
              email: doc.email || undefined,
              imageUrl: doc.imageUrl || undefined,
              source: doc.source,
              profileUrl: doc.profileUrl || undefined,
            }, index));
            source = 'database';
          } else {
            // Fallback to hardcoded doctors
            console.log('Using fallback doctors');
            doctors = FALLBACK_DOCTORS;
            source = 'fallback';
          }
        } catch (dbError) {
          console.error('Database query failed:', dbError);
          doctors = FALLBACK_DOCTORS;
          source = 'fallback';
        }
      }
    } catch (processingErr) {
      console.error('Error processing doctors:', processingErr);
      doctors = FALLBACK_DOCTORS;
      source = 'fallback';
    }

    // Ensure we always have some doctors
    if (!doctors || doctors.length === 0) {
      console.warn('No doctors found, using fallback');
      doctors = FALLBACK_DOCTORS;
      source = 'fallback';
    }

    // Apply filters
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
      source,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Fatal scraping error:', error);
    // Return fallback doctors even if everything fails
    return NextResponse.json({
      success: true,
      count: FALLBACK_DOCTORS.length,
      total: FALLBACK_DOCTORS.length,
      page: 1,
      limit: 24,
      hasMore: false,
      doctors: FALLBACK_DOCTORS,
      source: 'fallback',
      timestamp: new Date().toISOString(),
    });
  }
}
