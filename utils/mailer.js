const path = require("path");
const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const emailConfig = require("../config/emailConfig");

const handlerbarsOptions = {
    viewEngine: {
        extName: "handlebars",
        partialsDir: "./views/emails/",
        defaultLayout: false,
    },
    viewPath: "./views/emails/",
    extName: ".handlebars"
};
let transporter = nodemailer.createTransport({
    ... emailConfig
});
transporter.use("compile", hbs(handlerbarsOptions)); 


const optMaileOptions = (sendTo, subject, otp, time, template = "otp") => {
    return { 
        from:  `trueface <${emailConfig.from}>`,
        to: sendTo,
        subject: subject,
        template,
        context: { 
            otp,
            time,
            appName: "Trueface"
        }

    };

} 

exports.otpMailHandler = async (sendTo, subject, otp, time, templete= "otp") => {
    try {
        return new Promise((resolve, reject) => {
            const mail = optMaileOptions(sendTo, subject, otp, time, templete);
            transporter.sendMail(mail, (err, data) => {
            if (err) {
                return reject(err);
            }
            return resolve({success: true});
        })
        });
    } catch (error) {
        return {error: error};
    }
}