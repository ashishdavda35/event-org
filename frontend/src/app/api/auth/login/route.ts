import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // For now, return a mock response to test the frontend
    // Replace this with actual backend API call when backend is deployed
    const { email, password } = body;
    
    if (email === 'admin@eventorg.com' && password === 'admin123') {
      return NextResponse.json({
        success: true,
        token: 'mock-jwt-token-for-testing',
        user: {
          id: '1',
          email: 'admin@eventorg.com',
          name: 'Admin User'
        }
      });
    }
    
    return NextResponse.json(
      { success: false, message: 'Invalid credentials' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
