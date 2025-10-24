import admin from 'firebase-admin';

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!serviceAccountPath) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.');
}

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath),
});


export const auth = admin.auth();

/**
 * Fetch user data from Firebase Authentication
 * @param firebaseUid - The user's Firebase UID
 * @returns User data including email and display name
 */
export async function getUserByFirebaseUid(firebaseUid: string) {
    try {
        console.log(`Fetching user data from Firebase for UID: ${firebaseUid}`);
        
        const userRecord = await auth.getUser(firebaseUid);

        if (!userRecord.email) {
            throw new Error(`User ${firebaseUid} does not have an email address`);
        }

        return {
            firebaseUid: userRecord.uid,
            email: userRecord.email,
            ...(userRecord.displayName && { displayName: userRecord.displayName }),
        };
    } catch (error: any) {
        console.error(`Error fetching user from Firebase for ${firebaseUid}:`, error.message);
        throw new Error(`Failed to fetch user from Firebase: ${error.message}`);
    }
}

export default admin;
