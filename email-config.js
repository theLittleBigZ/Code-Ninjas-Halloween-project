// EmailJS configuration
export const emailConfig = {
    serviceID: "default_service", // Replace with your EmailJS service ID
    templateID: "template_halloween", // Replace with your EmailJS template ID
    userID: "YOUR_USER_ID", // Replace with your EmailJS user ID
    init: function() {
        emailjs.init(this.userID);
    }
};