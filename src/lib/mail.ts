export async function sendOTPEmail(to: string, otp: string): Promise<void> {
  console.log(`OTP for ${to}: ${otp}`)
}