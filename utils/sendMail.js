const  nodemailer = require('nodemailer');
const sendMail = async (options)=>{
    const transporter = nodemailer.createTransport({
        host:process.env.SMPT_HOST,
        port:process.env.SMPT_PORT,
        secure: true,
        auth:{
            user:process.env.SMPT_MAIL,
            pass:process.env.SMPT_PASSWORD
        }
    })

    const mailOptions = {
        from :process.env.SMPT_MAIL,
        to :options.to,
        subject:options.subject,
        text:options.subject
    }

    await transporter.sendMail(mailOptions)
}

module.exports = sendMail