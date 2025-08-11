const orderConfirmEmail = ({ name, otp })=>{
    return `
<div>
    <p>Dear, ${name}</p>
    <p>You're requested a Order confirmation. Please use following OTP code to confirm your order.</p>
    <div style="background:green; font-size:20px;padding:20px;text-align:center;font-weight : 800;">
        ${otp}
    </div>
    <p>This otp is valid for 1 hour only. Enter this otp in the Mindzspark website to proceed with your order.</p>
    <p>Thanks</p>
    <p>MindzSpark</p>
</div>
    `
}

export default orderConfirmEmail