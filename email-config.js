// EmailJS configuration
export const emailConfig = {
    serviceID: "service_c0hpqoq",
    registrationTemplateID: "template_s3qokgs",
    photoTemplateID: "template_y84ucwx",
    userID: "MIfpVTY7IHHWF7v1l",
    init: function() {
        emailjs.init(this.userID);
    }
};