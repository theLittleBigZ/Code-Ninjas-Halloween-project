// Email sending functionality
export const emailSender = {
    // Initialize EmailJS
    init: function() {
        emailjs.init("MIfpVTY7IHHWF7v1l");
    },

    // Send registration confirmation with QR code
    sendRegistrationEmail: async function(userData, qrUrl) {
        try {
            const response = await emailjs.send(
                "service_c0hpqoq",
                "template_s3qokgs",
                {
                    to_email: userData.email,
                    name: `${userData.parentFirst} ${userData.parentLast}`,
                    qrCodeUrl: qrUrl,
                    photoCount: userData.numPhotos || 1
                }
            );
            return { success: true, response };
        } catch (error) {
            console.error('Error sending registration email:', error);
            return { success: false, error };
        }
    },

    // Send photo email
    sendPhotoEmail: async function(userData, photoUrl, photosRemaining) {
        try {
            const response = await emailjs.send(
                "service_c0hpqoq",
                "template_y84ucwx",
                {
                    to_email: userData.email,
                    name: `${userData.parentFirst} ${userData.parentLast}`,
                    photoUrl: photoUrl,
                    remainingPhotos: photosRemaining,
                    children: userData.children || ''
                }
            );
            return { success: true, response };
        } catch (error) {
            console.error('Error sending photo email:', error);
            return { success: false, error };
        }
    }
};