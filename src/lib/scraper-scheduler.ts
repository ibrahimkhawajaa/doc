import { spawn } from 'child_process';
import path from 'path';
import { prisma } from './db';

interface ScrapingStats {
  lastRunAt: Date | null;
  nextRunAt: Date | null;
  successCount: number;
  failureCount: number;
  isRunning: boolean;
  doctorsAdded: number;
}

let scrapingStats: ScrapingStats = {
  lastRunAt: null,
  nextRunAt: null,
  successCount: 0,
  failureCount: 0,
  isRunning: false,
  doctorsAdded: 0,
};

let schedulerInterval: NodeJS.Timeout | null = null;

async function scrapeDoctorsBackground(): Promise<{ success: boolean; count: number }> {
  if (scrapingStats.isRunning) {
    console.log('Scraping already in progress, skipping...');
    return { success: false, count: 0 };
  }

  scrapingStats.isRunning = true;

  try {
    return new Promise((resolve) => {
      const scriptPath = path.join(process.cwd(), 'scripts', 'scrape_doctors.py');
      let stdout = '';
      let stderr = '';
      let settled = false;
      const timeoutMs = 120000; // 2 minutes

      const timeout = setTimeout(() => {
        if (!settled) {
          settled = true;
          console.warn('Scraper timeout');
          scrapingStats.isRunning = false;
          resolve({ success: false, count: 0 });
        }
      }, timeoutMs);

      const command = process.platform === 'win32' ? 'py' : 'python3';
      const args = process.platform === 'win32' ? ['-3', scriptPath, '100'] : [scriptPath, '100'];

      try {
        const child = spawn(command, args, { stdio: ['pipe', 'pipe', 'pipe'] });

        child.stdout.on('data', (data) => {
          stdout += data.toString();
        });

        child.stderr.on('data', (data) => {
          stderr += data.toString();
        });

        child.on('close', async (code) => {
          if (settled) return;
          settled = true;
          clearTimeout(timeout);
          scrapingStats.isRunning = false;

          try {
            if (code === 0 && stdout) {
              const doctors = JSON.parse(stdout);
              if (Array.isArray(doctors) && doctors.length > 0) {
                // Save to database
                let addedCount = 0;
                for (const doctor of doctors) {
                  try {
                    const existing = await prisma.doctor.findFirst({
                      where: {
                        OR: [
                          { email: doctor.email },
                          {
                            AND: [{ name: doctor.name }, { location: doctor.location }],
                          },
                        ],
                      },
                    });

                    if (!existing) {
                      await prisma.doctor.create({
                        data: {
                          name: doctor.name,
                          specialization: doctor.specialization || 'General',
                          experience: doctor.experience || 5,
                          rating: doctor.rating || 4.5,
                          consultationFee: doctor.consultationFee || 200,
                          location: doctor.location || 'Pakistan',
                          hospital: doctor.hospital || 'Not specified',
                          phone: doctor.phone,
                          email: doctor.email,
                          imageUrl: doctor.imageUrl,
                          source: 'scheduled-scraper',
                          profileUrl: doctor.profileUrl,
                          scrapedAt: new Date(),
                        },
                      });
                      addedCount++;
                    }
                  } catch (err) {
                    console.error(`Failed to add doctor ${doctor.name}:`, err);
                  }
                }
                scrapingStats.doctorsAdded += addedCount;
                scrapingStats.successCount++;
                console.log(`Scheduled scraper: Added ${addedCount} new doctors`);
                resolve({ success: true, count: addedCount });
                return;
              }
            }
          } catch (err) {
            console.error('Scraper parse error:', err);
          }

          scrapingStats.failureCount++;
          resolve({ success: false, count: 0 });
        });

        child.on('error', (err) => {
          if (!settled) {
            settled = true;
            clearTimeout(timeout);
            scrapingStats.isRunning = false;
            scrapingStats.failureCount++;
            console.error('Scraper spawn error:', err);
            resolve({ success: false, count: 0 });
          }
        });
      } catch (err) {
        if (!settled) {
          settled = true;
          clearTimeout(timeout);
          scrapingStats.isRunning = false;
          scrapingStats.failureCount++;
          console.error('Scraper error:', err);
          resolve({ success: false, count: 0 });
        }
      }
    });
  } catch (err) {
    scrapingStats.isRunning = false;
    scrapingStats.failureCount++;
    console.error('Unexpected scraper error:', err);
    return { success: false, count: 0 };
  }
}

export function startScraperScheduler(intervalMinutes: number = 60) {
  if (schedulerInterval) {
    console.log('Scraper scheduler already running');
    return;
  }

  console.log(`Starting doctor scraper scheduler (every ${intervalMinutes} minutes)`);

  // Run immediately on startup
  scrapeDoctorsBackground().catch(console.error);

  // Schedule periodic runs
  schedulerInterval = setInterval(() => {
    scrapingStats.nextRunAt = new Date(Date.now() + intervalMinutes * 60 * 1000);
    scrapeDoctorsBackground().catch(console.error);
  }, intervalMinutes * 60 * 1000);

  scrapingStats.nextRunAt = new Date(Date.now() + intervalMinutes * 60 * 1000);
}

export function stopScraperScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log('Scraper scheduler stopped');
  }
}

export function getScraperStats(): ScrapingStats {
  return { ...scrapingStats };
}

export async function triggerImmediateScrap(): Promise<{ success: boolean; count: number }> {
  return scrapeDoctorsBackground();
}
