import QRCode from 'qrcode';
import { randomUUID } from 'crypto';
import { uploadQRCodeToGCS } from '../config/gcs.js';

/**
 * Generates a QR code from a data string and uploads it to Google Cloud Storage
 * @param qrDataString - The string data to encode in the QR code
 * @returns The public URL of the uploaded QR code image
 */
export const generateAndUploadQRCode = async (qrDataString: string): Promise<string> => {
    try {
        console.log(`Generating QR code from data string (length: ${qrDataString.length})`);
        
        // Generate QR code as a buffer (PNG image)
        const qrBuffer = await QRCode.toBuffer(qrDataString, {
            type: 'png',
            width: 500,
            margin: 2,
            errorCorrectionLevel: 'H', // High error correction
            color: {
                dark: '#000000',
                light: '#FFFFFF',
            },
        });

    console.log(`QR code buffer generated (size: ${qrBuffer.length} bytes)`);

        // Generate a unique filename
        const filename = `qrcodes/${randomUUID()}.png`;
    console.log(`Uploading to GCS as: ${filename}`);

        // Upload to Google Cloud Storage
        const publicUrl = await uploadQRCodeToGCS(qrBuffer, filename);

    console.log(`QR code uploaded successfully: ${publicUrl}`);
        return publicUrl;
    } catch (error) {
        console.error('❌ Error generating and uploading QR code:', error);
        throw new Error(`QR code generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

/**
 * Generates a QR code as a data URL (base64) for immediate use (optional fallback)
 * @param qrDataString - The string data to encode in the QR code
 * @returns Base64 data URL of the QR code
 */
export const generateQRCodeDataURL = async (qrDataString: string): Promise<string> => {
    try {
        const dataURL = await QRCode.toDataURL(qrDataString, {
            width: 500,
            margin: 2,
            errorCorrectionLevel: 'H',
        });

        return dataURL;
    } catch (error) {
        console.error('Error generating QR code data URL:', error);
        throw new Error(`QR code generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};
