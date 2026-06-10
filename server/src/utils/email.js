const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  host: 'smtp.qq.com',
  port: 465,
  secure: true,
  auth: {
    user: '3494699717@qq.com',
    pass: 'habwaqefosahcidi',
  },
})

/** 发送邮箱验证码 */
async function sendCode(email, code, type = 'register') {
  const isReset = type === 'reset'
  await transporter.sendMail({
    from: '"MATO"前端学习平台 <3494699717@qq.com>',
    to: email,
    subject: isReset ? '重置密码验证码' : '邮箱验证码',
    html: `
      <h2>${isReset ? '重置密码验证码' : '注册验证码'}</h2>
      <p>您的验证码是：</p>
      <h1>${code}</h1>
      <p>5分钟内有效</p>
    `,
  })
}

module.exports = sendCode