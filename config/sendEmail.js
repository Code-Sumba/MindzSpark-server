import { Resend } from 'resend';
import dotenv from 'dotenv'
dotenv.config()

let resend = null;

if(process.env.RESEND_API){
    resend = new Resend(process.env.RESEND_API);
} else {
    console.log("Provide RESEND_API in the .env file for email functionality")
}

const sendEmail = async({sendTo, subject, html })=>{
    try {
        if (!resend) {
            console.log("Email service not configured - skipping email send");
            return { success: false, message: "Email service not configured" };
        }
        
        const { data, error } = await resend.emails.send({
            from: "MindzSpark <onboarding@resend.dev>",
            to: sendTo,
            subject: subject,
            html: html,
        });

        if (error) {
            return console.error({ error });
        }

        return data
    } catch (error) {
        console.log(error)
        return { success: false, error: error.message };
    }
}

export default sendEmail

