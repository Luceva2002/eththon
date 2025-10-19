import { NextRequest, NextResponse } from 'next/server';

const ONEINCH_API_KEY = process.env.ONEINCH_API_KEY;
const ARBITRUM_CHAIN_ID = 42161; // Arbitrum One

/**
 * API Route proxy per ottenere una quote di swap (senza eseguirlo)
 * 
 * Query params:
 * - src: indirizzo token source
 * - dst: indirizzo token destination
 * - amount: amount in wei del token source
 * 
 * Esempio: GET /api/1inch/quote?src=0x833...&dst=0x420...&amount=1000000
 */
export async function GET(request: NextRequest) {
  // Verifica API key
  if (!ONEINCH_API_KEY) {
    return NextResponse.json(
      { error: 'API key 1inch non configurata. Aggiungi ONEINCH_API_KEY in .env.local' },
      { status: 500 }
    );
  }

  // Estrai parametri
  const { searchParams } = new URL(request.url);
  const src = searchParams.get('src');
  const dst = searchParams.get('dst');
  const amount = searchParams.get('amount');

  // Valida parametri
  if (!src || !dst || !amount) {
    return NextResponse.json(
      { error: 'Parametri mancanti: src, dst e amount sono richiesti' },
      { status: 400 }
    );
  }

  try {
    // Costruisci URL 1inch API
    const url = `https://api.1inch.com/swap/v6.1/${ARBITRUM_CHAIN_ID}/quote?src=${src}&dst=${dst}&amount=${amount}`;

    console.log('[1inch Quote] Calling:', url);

    // Chiamata a 1inch API
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ONEINCH_API_KEY}`,
        'Accept': 'application/json',
      },
    });

    // Gestisci errori
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[1inch Quote] Error:', response.status, errorText);
      return NextResponse.json(
        { error: `API 1inch error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    // Ritorna dati
    const data = await response.json();
    console.log('[1inch Quote] Success - dstAmount:', data.dstAmount);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('[1inch Quote] Exception:', error);
    return NextResponse.json(
      { error: 'Errore interno nel proxy', details: (error as Error).message },
      { status: 500 }
    );
  }
}

