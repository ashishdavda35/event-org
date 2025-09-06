import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // For now, return a mock response to test the frontend
    // Replace this with actual backend API call when backend is deployed
    const { email, password, name } = body;
    
    if (email && password && name) {
      return NextResponse.json({
        success: true,
        token: 'mock-jwt-token-for-testing',
        user: {
          id: '1',
          email: email,
          name: name
        }
      });
    }
    
    return NextResponse.json(
      { success: false, message: 'Missing required fields' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
