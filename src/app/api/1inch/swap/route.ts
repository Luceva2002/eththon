import { NextRequest, NextResponse } from 'next/server';

const ONEINCH_API_KEY = process.env.ONEINCH_API_KEY;
const ARBITRUM_CHAIN_ID = 42161; // Arbitrum One

/**
 * API Route proxy per ottenere la transazione di swap
 * 
 * Query params:
 * - src: indirizzo token source
 * - dst: indirizzo token destination  
 * - amount: amount in wei del token source
 * - from: indirizzo wallet che esegue lo swap
 * - slippage: slippage tollerato (es. 1 = 1%)
 * - disableEstimate: disabilita stima gas (default: false)
 * - allowPartialFill: permetti fill parziale (default: false)
 * 
 * Esempio: GET /api/1inch/swap?src=0x833...&dst=0x420...&amount=1000000&from=0xabc...&slippage=1
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
  const from = searchParams.get('from');
  const slippage = searchParams.get('slippage') || '1';
  const disableEstimate = searchParams.get('disableEstimate') || 'false';
  const allowPartialFill = searchParams.get('allowPartialFill') || 'false';

  // Valida parametri
  if (!src || !dst || !amount || !from) {
    return NextResponse.json(
      { error: 'Parametri mancanti: src, dst, amount e from sono richiesti' },
      { status: 400 }
    );
  }

  try {
    // Costruisci URL 1inch API
    const params = new URLSearchParams({
      src,
      dst,
      amount,
      from,
      slippage,
      disableEstimate,
      allowPartialFill,
    });

    const url = `https://api.1inch.com/swap/v6.1/${ARBITRUM_CHAIN_ID}/swap?${params.toString()}`;

    console.log('[1inch Swap] Calling:', url);

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
      console.error('[1inch Swap] Error:', response.status, errorText);
      return NextResponse.json(
        { error: `API 1inch error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    // Ritorna dati
    const data = await response.json();
    console.log('[1inch Swap] Success - tx.to:', data.tx?.to);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('[1inch Swap] Exception:', error);
    return NextResponse.json(
      { error: 'Errore interno nel proxy', details: (error as Error).message },
      { status: 500 }
    );
  }
}

