import 'dotenv/config'
import nodemailer from 'nodemailer';

const VerificationEmail = (token, email) => {
    const transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.VerifiyEmail,
            pass: process.env.VerifiyPassword
        }
    });

    const mailConfigration = {
        from: process.env.VerifiyEmail,
        to: email,

        subject: "Email Verification",

        text: `Hello,

          Thank you for registering with us.
           Please verify your email by clicking the link below:

            http://localhost:5173/EmailVerify/${token}

                If you did not create this account, please ignore this email.

               Best regards,
           Your Team`

    };

    transport.sendMail(mailConfigration, function (error, info) {
        if (error) {
            console.error("Email sending error:", error);
            return;
        }

        console.log('Succesefully sent mail');
        console.log(info);

    })

}

export default VerificationEmail




