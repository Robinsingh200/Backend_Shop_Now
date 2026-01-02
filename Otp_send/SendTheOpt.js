import 'dotenv/config'
import nodemailer from 'nodemailer';


const sendOtp = async (otp, gmail) => {

    const transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.VerifiyEmail,
            pass: process.env.VerifiyPassword
        }
    });

    const mailConfigration = {
        from: process.env.VerifiyEmail,
        to: gmail,

        subject: "For forget passworf Opt",

        text: `This Your forget otp password : ${otp}
                       thanks`
    };

    transport.sendMail(mailConfigration, function (error, info) {
        if (error) {
            console.error("Email sending error:", error);
            return;
        }

        console.log('Succesefully sent to the mail of otp');
        console.log(info);

    })

}

export default sendOtp
