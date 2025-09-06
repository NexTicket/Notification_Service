#!/usr/bin/env node

import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const envPath = path.join(process.cwd(), '.env');

function askForSendGridKey() {
    return new Promise((resolve) => {
        console.log('\n🔑 SendGrid API Key Setup');
        console.log('========================');
        console.log('Your SendGrid API key should start with "SG."');
        console.log('You can get one from: https://app.sendgrid.com/settings/api_keys');
        console.log('');

        rl.question('Enter your SendGrid API key: ', (apiKey) => {
            if (apiKey.startsWith('SG.')) {
                resolve(apiKey);
            } else {
                console.log('❌ Invalid API key format. SendGrid keys must start with "SG."');
                askForSendGridKey().then(resolve);
            }
        });
    });
}

async function setupSendGrid() {
    try {
        // Read current .env file
        let envContent = '';
        if (fs.existsSync(envPath)) {
            envContent = fs.readFileSync(envPath, 'utf8');
        }

        // Check if SendGrid key is already configured
        if (envContent.includes('SENDGRID_API_KEY=SG.') && !process.argv.includes('--force')) {
            console.log('✅ SendGrid API key is already configured!');
            console.log('💡 If you\'re having issues, run: npx tsx setup-sendgrid.ts --force');
            rl.close();
            return;
        }

        // Ask for SendGrid API key
        const apiKey = await askForSendGridKey();

        // Update or create .env file
        const lines = envContent.split('\n');
        let keyFound = false;

        for (let i = 0; i < lines.length; i++) {
            if ((lines[i] ?? '').startsWith('SENDGRID_API_KEY=')) {
                lines[i] = `SENDGRID_API_KEY=${apiKey}`;
                keyFound = true;
                break;
            }
        }

        if (!keyFound) {
            lines.push(`SENDGRID_API_KEY=${apiKey}`);
        }

        fs.writeFileSync(envPath, lines.join('\n'));
        console.log('✅ SendGrid API key configured successfully!');
        console.log('🎉 You can now run the real email test: npx tsx test-real-email.ts');

    } catch (error) {
        console.error('❌ Error setting up SendGrid:', error);
    } finally {
        rl.close();
    }
}

setupSendGrid();
