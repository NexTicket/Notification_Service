import { Storage } from '@google-cloud/storage';

const projectId = process.env.GCS_PROJECT_ID;
const keyFilename = process.env.GCS_KEY_FILE;

if (!projectId) {
  throw new Error('GCS_PROJECT_ID environment variable is not set.');
}
if (!keyFilename) {
  throw new Error('GCS_KEY_FILE environment variable is not set.');
}


// Initialize Google Cloud Storage client
const storage = new Storage({
  projectId: projectId,
  keyFilename: keyFilename,
});

const bucketName = process.env.GCS_BUCKET_NAME || 'nexticket-qr-codes';
const bucket = storage.bucket(bucketName);

export const uploadQRCodeToGCS = async (
    buffer: Buffer,
    filename: string
): Promise<string> => {
    try {
        const file = bucket.file(filename);

        await file.save(buffer, {
            metadata: {
                contentType: 'image/png',
                cacheControl: 'private, max-age=0, no-cache', // Ensure no caching for private files
            },
        });

        console.log(`QR code uploaded to GCS: ${filename}`);
        return filename; // Return the filename for Signed URL generation
    } catch (error) {
        console.error('Error uploading QR code to GCS:', error);
        throw new Error(`Failed to upload QR code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

export const generateSignedUrl = async (
    filename: string,
    expiration: number = 7 * 24 * 60 * 60 // Default to 7 days
): Promise<string> => {
    try {
        const file = bucket.file(filename);
        const [url] = await file.getSignedUrl({
            action: 'read',
            expires: Date.now() + expiration * 1000, // Convert expiration to milliseconds
        });

        console.log(`Signed URL generated: ${url}`);
        return url;
    } catch (error) {
        console.error('Error generating Signed URL:', error);
        throw new Error(`Failed to generate Signed URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

export const deleteQRCodeFromGCS = async (filename: string): Promise<void> => {
    try {
        await bucket.file(filename).delete();
        console.log(`QR code deleted from GCS: ${filename}`);
    } catch (error) {
        console.error('Error deleting QR code from GCS:', error);
        throw new Error(`Failed to delete QR code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

export { storage, bucket };
