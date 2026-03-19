import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendEmail = async ({ to, subject, text, html }) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || '"HalleyX Workflow" <no-reply@halleyx.com>',
            to,
            subject,
            text,
            html,
        });
        console.log(`[EMAIL] Message sent: %s`, info.messageId);
        // If using Ethereal, log the preview URL
        if (process.env.SMTP_HOST === 'smtp.ethereal.email') {
            console.log(`[EMAIL] Preview URL: %s`, nodemailer.getTestMessageUrl(info));
        }
        return info;
    } catch (error) {
        console.error('[EMAIL] Error sending email:', error);
        throw error;
    }
};

export default transporter;
