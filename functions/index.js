const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

// Create a Nodemailer transporter using Mailtrap SMTP
const transporter = nodemailer.createTransport({
    host: "live.smtp.mailtrap.io",
    port: 587,
    auth: {
        user: process.env.MAILTRAP_USER, // Use environment variables
        pass: process.env.MAILTRAP_PASS  // Use environment variables
    }
});

// Cloud Function to send photo email
exports.sendPhotoEmail = functions.region('us-central1').https.onCall(async (data, context) => {
    try {
        // Validate the input data
        if (!data.to || !data.photoUrl || !data.userName) {
            throw new Error('Missing required fields');
        }

        // Create email HTML template
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Your Halloween Photo</title>
                <style>
                    body { font-family: Arial, sans-serif; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .photo { width: 100%; max-width: 500px; margin: 20px 0; }
                    .footer { margin-top: 20px; text-align: center; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Your Halloween Photo is Here! 🎃</h1>
                    <p>Hi ${data.userName},</p>
                    <p>Thank you for visiting our Halloween Photo Booth! Here's your spooky snapshot:</p>
                    <img src="${data.photoUrl}" alt="Halloween Photo" class="photo">
                    <p>We hope you had a fantastic time!</p>
                    <div class="footer">
                        <p>Code Ninjas Halloween Photo Booth 2025</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        // Configure email options
        const mailOptions = {
            from: 'Halloween Photo Booth <noreply@codeninjas.com>',
            to: data.to,
            subject: 'Your Halloween Photo Booth Picture! 🎃',
            html: htmlContent,
            attachments: [
                {
                    filename: 'halloween-photo.jpg',
                    path: data.photoUrl
                }
            ]
        };

        // Send the email
        const info = await transporter.sendMail(mailOptions);
        
        // Return success response
        return {
            success: true,
            messageId: info.messageId
        };

    } catch (error) {
        // Log the error and return error response
        console.error('Error sending email:', error);
        throw new functions.https.HttpsError('internal', 'Error sending email', error.message);
    }
});

// Cloud Function to send registration confirmation
exports.sendRegistrationConfirmation = functions.region('us-central1').https.onCall(async (data, context) => {
    try {
        // Validate the input data
        if (!data.to || !data.userName || !data.qrCode) {
            throw new Error('Missing required fields');
        }

        // Create email HTML template
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Halloween Photo Booth Registration</title>
                <style>
                    body { font-family: Arial, sans-serif; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .qr-code { width: 200px; height: 200px; margin: 20px auto; display: block; }
                    .footer { margin-top: 20px; text-align: center; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Welcome to the Halloween Photo Booth! 🎃</h1>
                    <p>Hi ${data.userName},</p>
                    <p>Thank you for registering for our Halloween Photo Booth! Here's your QR code:</p>
                    <img src="${data.qrCode}" alt="QR Code" class="qr-code">
                    <p>Instructions:</p>
                    <ol>
                        <li>Save this QR code on your phone</li>
                        <li>Show it at the photo booth</li>
                        <li>Strike your spookiest pose!</li>
                        <li>We'll email your photos directly to you</li>
                    </ol>
                    <p>See you at the photo booth!</p>
                    <div class="footer">
                        <p>Code Ninjas Halloween Photo Booth 2025</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        // Configure email options
        const mailOptions = {
            from: 'Halloween Photo Booth <noreply@codeninjas.com>',
            to: data.to,
            subject: 'Welcome to the Halloween Photo Booth! 🎃',
            html: htmlContent
        };

        // Send the email
        const info = await transporter.sendMail(mailOptions);
        
        // Return success response
        return {
            success: true,
            messageId: info.messageId
        };

    } catch (error) {
        // Log the error and return error response
        console.error('Error sending registration email:', error);
        throw new functions.https.HttpsError('internal', 'Error sending registration email', error.message);
    }
});