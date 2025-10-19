import { NextRequest, NextResponse } from 'next/server';

const ONEINCH_API_KEY = process.env.ONEINCH_API_KEY;
const ARBITRUM_CHAIN_ID = 42161; // Arbitrum One

/**
 * API Route proxy per verificare l'allowance di un token per il router 1inch
 * 
 * Query params:
 * - tokenAddress: indirizzo del token da verificare
 * - walletAddress: indirizzo del wallet
 * 
 * Esempio: GET /api/1inch/allowance?tokenAddress=0x833...&walletAddress=0xabc...
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
  const tokenAddress = searchParams.get('tokenAddress');
  const walletAddress = searchParams.get('walletAddress');

  // Valida parametri
  if (!tokenAddress || !walletAddress) {
    return NextResponse.json(
      { error: 'Parametri mancanti: tokenAddress e walletAddress sono richiesti' },
      { status: 400 }
    );
  }

  try {
    // Costruisci URL 1inch API
    const url = `https://api.1inch.com/swap/v6.1/${ARBITRUM_CHAIN_ID}/approve/allowance?tokenAddress=${tokenAddress}&walletAddress=${walletAddress}`;

    console.log('[1inch Allowance] Calling:', url);

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
      console.error('[1inch Allowance] Error:', response.status, errorText);
      return NextResponse.json(
        { error: `API 1inch error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    // Ritorna dati
    const data = await response.json();
    console.log('[1inch Allowance] Success:', data);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('[1inch Allowance] Exception:', error);
    return NextResponse.json(
      { error: 'Errore interno nel proxy', details: (error as Error).message },
      { status: 500 }
    );
  }
}

