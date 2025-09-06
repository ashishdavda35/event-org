import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pollCode = searchParams.get('code');
    
    if (!pollCode) {
      return NextResponse.json({ error: 'Poll code is required' }, { status: 400 });
    }

    // First, login as admin
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@eventorg.com',
        password: 'admin123'
      })
    });

    if (!loginResponse.ok) {
      let errorMessage = 'Login failed';
      try {
        const errorData = await loginResponse.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // If response is not JSON, get text
        const errorText = await loginResponse.text();
        errorMessage = errorText || errorMessage;
      }
      return NextResponse.json({ error: `Login failed: ${errorMessage}` }, { status: 500 });
    }

    const loginData = await loginResponse.json();
    const { token } = loginData;

    // Then, get poll results
    const resultsResponse = await fetch(`http://localhost:5000/api/polls/${pollCode}/results`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!resultsResponse.ok) {
      let errorMessage = 'Results failed';
      try {
        const errorData = await resultsResponse.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // If response is not JSON, get text
        const errorText = await resultsResponse.text();
        errorMessage = errorText || errorMessage;
      }
      return NextResponse.json({ error: `Results failed: ${errorMessage}` }, { status: 500 });
    }

    const resultsData = await resultsResponse.json();
    return NextResponse.json(resultsData);

  } catch (error: any) {
    console.error('API route error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
