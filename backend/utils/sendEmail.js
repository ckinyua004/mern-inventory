const nodemailer = require('nodemailer')

const sendEmail = async (subject, message, send_to, send_from, reply_to) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: 587,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    })

    // Sending Email Options
    const mailOptions = {
        from: send_from,
        to: send_to,
        replyTo: reply_to,
        subject: subject,
        //text: message,
        //html: `<p>${message}</p>`
        html: message
    }

    // Sending Email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            throw new Error('Email not sent, please try again later');
        } else {
            console.log('Email sent successfully:', info.response);
            console.log('Email sent successfully:', info);
            return info.response;
        }
    })
}

module.exports = sendEmail;