import { sendEmail } from "./sendGridService";
import { TicketPurchaseData } from "../types/index";
import { ExternalApiService } from "./externalAPIService";
import { error } from "console";

const externalApi = new ExternalApiService();

export async function sendTicketPurchaseNotification(data:TicketPurchaseData){
    try{
        //Fetch order data for the email
        const eventData = await externalApi.getEventDetails(data.eventId);
        const orderData = await externalApi.getOrderDetails(data.orderId);

        if(!eventData||!orderData){
            throw new Error('Failed to fetch event or order details');
        }

        //Generate QR code
        const qrCodeBase64 = await generateQRCode(data.orderId);

        const emailContent = `
        <h2>Ticket Purchase Confirmation</h2>
        <p>Dear Customer,</p>
        <p>Thank you for purchasing tickets for <strong>${eventData.title}</strong>!</p>
        <p><strong>Event Details:</strong></p>
        <ul>
            <li>Date: ${new Date(eventData.date).toLocaleDateString()}</li>
            <li>Venue: ${eventData.venue}</li>
            <li>Quantity: ${data.ticketDetails.quantity}</li>
            <li>Total Amount: $${data.ticketDetails.totalAmount}</li>
        </ul>
        <p>Your QR code is attached. Please bring it to the event.</p>
        <p>Best regards,<br>NexTicket Team</p>
        `;

        await sendEmail({
            recipient: data.userId, //Assuming userId is email, or fetch from User Service
            subject: `Your Tickets for ${eventData.title}`,
            content: emailContent,
            attachments: [{
                content: qrCodeBase64,
                filename: 'ticket_qr.png',
                type: 'image/png'
        }]
        });
        return {success: true};
} catch(error){
    console.log('Error sending ticket purchase notification: ',error);
    return {
        succcess: false,
        error: typeof error === "object" && error !== null && "message" in error
            ? (error as { message: string }).message
            : String(error)
    };
}
}

//Need to implement QR code generation
async function generateQRCode(orderId: string): Promise<string> {
    // Use a library like 'qrcode' to generate QR code
    // For now, return a placeholder
    return 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='; // 1x1 transparent PNG
}
