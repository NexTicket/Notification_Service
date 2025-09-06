import { sendTicketPurchaseNotification } from './src/services/ticketPurchaseService';

async function testRealEmail() {
    console.log('🧪 Testing real email sending...');

    const testData = {
        orderId: 'test-order-123',
        userId: 'mindirebeka@gmail.com', // Your real email
        eventId: 'test-event-123',
        ticketDetails: {
            quantity: 2,
            totalAmount: 150
        }
    };

    try {
        console.log('📧 Sending email to:', testData.userId);
        const result = await sendTicketPurchaseNotification(testData);

        if (result.success) {
            console.log('✅ Email sent successfully!');
            console.log('📬 Check your inbox at:', testData.userId);
        } else {
            console.log('❌ Email sending failed:', result.error);
        }
    } catch (error) {
        console.error('💥 Error:', error);
    }
}

// Run the test
testRealEmail();