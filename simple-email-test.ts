import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

async function testSimpleEmail() {
    console.log('🧪 Testing simple SendGrid email...');
    console.log('API Key:', process.env.SENDGRID_API_KEY?.substring(0, 20) + '...');
    console.log('From Email:', process.env.SENDGRID_FROM_EMAIL);
    
    sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
    
    const msg = {
        to: 'mindirebeka@gmail.com',
        from: 'mindi.22@cse.mrt.ac.lk', // Your verified sender
        subject: 'Simple Test Email',
        text: 'This is a simple test email from NexTicket notification service.',
        html: '<h2>Test Email</h2><p>This is a simple test email from NexTicket notification service.</p>',
    };
    
    try {
        console.log('📧 Sending simple email...');
        const response = await sgMail.send(msg);
        console.log('✅ Email sent successfully!');
        console.log('Response status:', response[0].statusCode);
        console.log('Response headers:', response[0].headers);
        console.log('Message ID:', response[0].headers['x-message-id']);
    } catch (error: any) {
        console.error('❌ Email sending failed:');
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        console.error('Response body:', error.response?.body);
        console.error('Full error:', error);
    }
}

testSimpleEmail();
