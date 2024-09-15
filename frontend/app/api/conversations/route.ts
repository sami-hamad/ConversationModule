import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getConversations } from '../../lib/api';

export async function GET(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const conversations = await getConversations(token.access_token as string);
        return NextResponse.json({ conversations });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
    }
}
