import { NextRequest, NextResponse } from 'next/server';

const ONEINCH_API_KEY = process.env.ONEINCH_API_KEY;
const ARBITRUM_CHAIN_ID = 42161; // Arbitrum One

/**
 * API Route proxy per ottenere la transazione di approvazione per il router 1inch
 * 
 * Query params:
 * - tokenAddress: indirizzo del token da approvare
 * - amount (opzionale): amount da approvare, se non specificato = infinito
 * 
 * Esempio: GET /api/1inch/approve?tokenAddress=0x833...&amount=1000000
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
  const amount = searchParams.get('amount');

  // Valida parametri
  if (!tokenAddress) {
    return NextResponse.json(
      { error: 'Parametro mancante: tokenAddress è richiesto' },
      { status: 400 }
    );
  }

  try {
    // Costruisci URL 1inch API
    let url = `https://api.1inch.com/swap/v6.1/${ARBITRUM_CHAIN_ID}/approve/transaction?tokenAddress=${tokenAddress}`;
    
    if (amount) {
      url += `&amount=${amount}`;
    }

    console.log('[1inch Approve] Calling:', url);

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
      console.error('[1inch Approve] Error:', response.status, errorText);
      return NextResponse.json(
        { error: `API 1inch error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    // Ritorna dati
    const data = await response.json();
    console.log('[1inch Approve] Success:', data);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('[1inch Approve] Exception:', error);
    return NextResponse.json(
      { error: 'Errore interno nel proxy', details: (error as Error).message },
      { status: 500 }
    );
  }
}

