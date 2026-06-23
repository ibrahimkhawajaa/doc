import { NextRequest, NextResponse } from 'next/server';
import { getScraperStats, triggerImmediateScrap } from '@/lib/scraper-scheduler';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const action = searchParams.get('action');

    // Get current stats
    if (action === 'stats') {
      const stats = getScraperStats();
      return NextResponse.json({
        success: true,
        stats,
      });
    }

    // Trigger immediate scraping
    if (action === 'trigger') {
      const result = await triggerImmediateScrap();
      return NextResponse.json({
        success: true,
        result,
        message: result.success 
          ? `Successfully added ${result.count} new doctors`
          : 'Scraping failed or found no new doctors',
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action. Use ?action=stats or ?action=trigger',
    }, { status: 400 });
  } catch (error) {
    console.error('Scraper API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process request',
    }, { status: 500 });
  }
}
