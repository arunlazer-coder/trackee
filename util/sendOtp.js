const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
    service: 'gmail', // or any other email service you prefer
    auth: {
        user: 'infoatz.info@gmail.com', // your email address
        pass: 'pdsshshjxircpofd' // your email password or app-specific password
    }
});

// Function to send OTP
const sendOtp = async ({to, name}, otp, template=REGISTER) => {

    const templateDir = {
        REGISTER:{path:'../mailTemplate/otp.html', subject:'Your OTP for Trackkee'},
        FORGOT:{path:'../mailTemplate/forgot.html', subject:'Your OTP for Trackkee'}
    }
    if(!templateDir[template]){
        console.error('Invalid template');
        return false;
    }
    try {
        const templatePath = path.join(__dirname, templateDir[template].path);
        let htmlTemplate = fs.readFileSync(templatePath, 'utf8');

        // Replace {{otp}} with actual OTP value
        htmlTemplate = htmlTemplate.replace('{{otp}}', otp).replace('{{name}}', name).replace('{{email}}', to);
        const logoImagePath = path.join(__dirname, '../assets/infoatz.jpg'); // Your image path

        const info = await transporter.sendMail({
            from: 'infoatz.info@gmail.com', // sender address
            to, // receiver address
            subject: templateDir[template].subject, // Subject line
            html: htmlTemplate,
            attachments: [
                {
                  filename: 'infoatz.jpg', // Filename in the email
                  path: logoImagePath, // Path to the image file
                  cid: 'logo_image' // Same cid used in the HTML to embed the image
                }
              ]
        });
        console.log('Message sent: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending OTP:', error);
        return false;
    }
};

module.exports = sendOtp;
