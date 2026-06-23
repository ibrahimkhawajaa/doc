/**
 * Next.js Instrumentation Hook
 * Runs when the server starts
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const { startScraperScheduler } = await import('@/lib/scraper-scheduler');
      
      // Start scheduler to run every hour (adjust interval as needed)
      const intervalMinutes = parseInt(process.env.SCRAPER_INTERVAL_MINUTES || '60');
      startScraperScheduler(intervalMinutes);
      
      console.log('✅ Scraper scheduler initialized successfully');
    } catch (error) {
      console.error('Failed to initialize scraper scheduler:', error);
    }
  }
}
