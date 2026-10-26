import { NextRequest, NextResponse } from 'next/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET() {
  return NextResponse.json(
    { ok: true, message: 'STOCKOS FINAL activo - MBR / CARLSO' },
    { headers: corsHeaders }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    return NextResponse.json(
      { ok: true, received: true, data: body, timestamp: new Date().toISOString() },
      { headers: corsHeaders }
    );
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500, headers: corsHeaders });
  }
}
