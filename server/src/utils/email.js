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

const LOGO_URL = 'https://fastly.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg'

/** 发送邮箱验证码 */
async function sendCode(email, code, type = 'register') {
  const isReset = type === 'reset'
  const title = isReset ? '重置密码' : '注册账号'
  const actionText = isReset ? '您正在重置 MATO 平台的登录密码' : '您正在注册 MATO 前端学习平台账号'

  const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          
          <!-- 头部横幅 -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);padding:40px 30px;text-align:center;">
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <img src="${LOGO_URL}" alt="MATO" width="48" height="48" style="display:block;margin:0 auto 16px;filter:drop-shadow(0 2px 8px rgba(0,0,0,0.3));">
                    <h1 style="margin:0 0 8px;color:#ffd700;font-size:28px;font-weight:800;letter-spacing:3px;text-transform:uppercase;">MATO</h1>
                    <p style="margin:0;color:rgba(255,255,255,0.75);font-size:14px;font-weight:500;">前端学习 · 代码实战 · 技能进阶</p>
                    <div style="margin-top:20px;height:3px;background:linear-gradient(90deg,transparent,#ffd700,transparent);border-radius:2px;"></div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 正文区域 -->
          <tr>
            <td style="padding:36px 40px;">
              <h2 style="margin:0 0 12px;color:#1a1a2e;font-size:22px;font-weight:700;">${title}验证码</h2>
              <p style="margin:0 0 8px;color:#555;font-size:15px;line-height:1.7;">${actionText}。</p>
              <p style="margin:0 0 24px;color:#888;font-size:13px;">请使用以下验证码完成验证：</p>

              <!-- 验证码 -->
              <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:28px;">
                <tr>
                  <td align="center" style="background:#f8f9fb;border:2px dashed #e0e0e0;border-radius:8px;padding:24px;">
                    <span style="font-family:'Courier New',monospace;font-size:36px;font-weight:800;color:#1a1a2e;letter-spacing:8px;">${code}</span>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 20px;color:#999;font-size:13px;text-align:center;">
                ⏱ 验证码 5 分钟内有效，请勿泄露给他人
              </p>

              <!-- 分隔线 -->
              <div style="height:1px;background:#eee;margin:0 0 20px;"></div>

              <!-- 宣传语 -->
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="text-align:center;color:#aaa;font-size:12px;line-height:1.8;">
                    <p style="margin:0 0 6px;font-weight:600;color:#888;">🚀 MATO — 从零到一，构建你的前端技能树</p>
                    <p style="margin:0;">HTML · CSS · JavaScript · 闯关挑战 · 在线实战</p>
                    <p style="margin:6px 0 0;">📧 3494699717@qq.com | 🌐 MATO 前端学习平台</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 页脚 -->
          <tr>
            <td style="background:#1a1a2e;padding:20px 40px;text-align:center;">
              <p style="margin:0;color:rgba(255,255,255,0.5);font-size:11px;line-height:1.6;">
                © 2026 MATO 前端学习平台 版权所有<br>
                此邮件由系统自动发送，请勿直接回复。
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  await transporter.sendMail({
    from: '"MATO 前端学习平台" <3494699717@qq.com>',
    to: email,
    subject: isReset ? '【MATO】重置密码验证码' : '【MATO】注册验证码 — 开启你的前端学习之旅',
    html,
  })
}

module.exports = sendCode
