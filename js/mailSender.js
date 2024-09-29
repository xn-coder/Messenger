
function sendMail(sub, body, to) {
    var params = {
      subject: sub,
      body: body,
      to: to,
    };
  
    const serviceID = "web-messenger-gmail";
    const templateID = "web-messenger";
  
    const key = "MuUVIkxGHKbZjI3dx";
    emailjs
      .send(serviceID, templateID, params, key)
      .then((res) => {
      })
      .catch((err) => console.log(err));
  }
  
  export function sendMailRegisterationOtp(username, otp, to) {
      let sub = `Your One-Time Password ${otp} for Web Messenger`
      let body = `Dear ${username},
      
      Thank you for using Web Messenger! To ensure the security of your account, we have generated a One-Time Password (OTP) for you.\n\nYour OTP: ${otp}
      
      This OTP is valid for a single use and expires after a short period. Please enter this code on the Web Messenger platform to complete the verification process.
      
      If you did not request this OTP or if you have any concerns about the security of your account, please contact our support team immediately.\n\nThank you for choosing Web Messenger.
      
      Best regards,\nThe Web Messenger Team`;
      sendMail(sub, body, to)
  }
  
  export function sendMailRegisterationSuccessful(username, to) {
      let sub = "Successful Registration for Web Messenger"
      let body = `Dear ${username},
  
      You have Successfully Registered for Web Messenger!!!
      
      We are delighted to inform you that your registration for our Web Messenger service has been successfully completed! 
      
      Your account is now active, and you can start enjoying the seamless communication experience that our Web Messenger offers. Whether it's connecting with friends, family, or colleagues, our platform is designed to enhance your messaging experience with a user-friendly interface and a range of features.
      
      Thank you for choosing our Web Messenger service. We look forward to providing you with a reliable and enjoyable messaging experience.
      
      Best regards,
      
      Web Messenger Customer Support Team`
  
      sendMail(sub, body, to)
  }
  
  export function sendMailResetPassword(username, otp, to) {
      let sub = "Password Reset OTP for Your Account"
      let body = `Dear ${username},
  
      It seems you've requested a password reset for your account with us. 
      
      To complete the password reset process, please use the following One-Time Password (OTP):
      
      OTP: ${otp}
      
      Please enter this OTP on the password reset page to verify your identity and set a new password for your account. Keep in mind that the OTP is valid for a limited time for security reasons.
      
      Thank you for choosing Web Messenger. We appreciate your trust in us.
      
      Best regards,
      
      Web Messenger
      Customer Support Team`
  
      sendMail(sub, body, to)
  }