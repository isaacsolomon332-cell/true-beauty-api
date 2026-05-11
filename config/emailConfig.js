// At the very top of your config file
require('dotenv').config(); 

console.log("DEBUG: Email User is", process.env.EMAIL_USER); // Add this to check!

module.exports = {
  service: 'gmail', // Adding this is safer for Gmail
  host: 'smtp.gmail.com',
  port: 465,        // Change to 465
  secure: true,     // Change to true for port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  from: process.env.EMAIL_FROM || 'Trueface Beauty Contest <isaacsolomon332@gmail.com>'
};