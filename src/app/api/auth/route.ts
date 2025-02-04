import { NextRequest, NextResponse } from 'next/server';
import { auth } from 'firebase-admin';
import { getApp, getApps, initializeApp, cert } from 'firebase-admin/app';

// Initialize Firebase Admin
const app = !getApps().length
    ? initializeApp({
        credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    })
    : getApp();

export async function validateToken(req: NextRequest) {
    try {
        const token = req.headers.get('Authorization')?.split('Bearer ')[1];
        if (!token) throw new Error('No token provided');

        const decodedToken = await auth().verifyIdToken(token);
        return decodedToken;
    } catch (error) {
        console.error('Token validation error:', error);
        return null;
    }
}