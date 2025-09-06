import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

async function testSendGridConnection() {
    console.log('🔍 Testing SendGrid connection...');

    // Check API key
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey || !apiKey.startsWith('SG.')) {
        console.error('❌ Invalid SendGrid API key');
        return;
    }

    console.log('✅ API key format is valid');
    console.log('📧 From email:', process.env.SENDGRID_FROM_EMAIL);
    console.log('📬 To email:', 'mindirebeka@gmail.com');

    // Set API key
    sgMail.setApiKey(apiKey);

    // Test email data - try with a verified sender
    const msg = {
        to: 'mindirebeka@gmail.com',
        from: {
            email: process.env.SENDGRID_FROM_EMAIL || 'test@example.com',
            name: 'NexTicket Notifications'
        },
        subject: 'SendGrid Connection Test',
        text: 'This is a test email to verify SendGrid connection.',
        html: '<strong>This is a test email to verify SendGrid connection.</strong>',
    };

    try {
        console.log('📧 Sending test email...');
        const result = await sgMail.send(msg);
        console.log('✅ Email sent successfully!');
        console.log('📨 Response:', result[0].statusCode);
        console.log('🆔 Message ID:', result[0].headers['x-message-id']);

        // Check if from email is verified
        if (result[0].statusCode === 202) {
            console.log('✅ Email accepted by SendGrid');
            console.log('📬 Check your inbox and spam folder at:', msg.to);
            console.log('⚠️  If you don\'t see the email, check:');
            console.log('   1. Spam/Junk folder');
            console.log('   2. Verify the sender email is confirmed in SendGrid dashboard');
            console.log('   3. Check SendGrid activity feed for delivery status');
        }
    } catch (error: any) {
        console.error('❌ SendGrid Error:', error.message);

        if (error.code === 401) {
            console.error('🔑 API key is invalid or expired');
        } else if (error.code === 403) {
            console.error('🚫 From email address is not verified in SendGrid');
            console.error('📧 Go to SendGrid dashboard > Settings > Sender Authentication');
            console.error('📧 Verify this email:', process.env.SENDGRID_FROM_EMAIL);
        } else if (error.response) {
            console.error('📊 SendGrid Response:', error.response.body);
        }
    }
}

testSendGridConnection();
