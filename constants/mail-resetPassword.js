
function getMailTemplateResetPassword(user, token, origin) {

  return `
  <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
  <html>
    <head>
      <meta http-equiv="content-type" content="text/html; charset=ISO-8859-15">
      <style>
        .container {
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: 50px auto;
          padding: 20px;
          border: 1px solid #e0e0e0;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }

        h2 {
          color: #333;
          border-bottom: 1px solid #ddd;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }

        p {
          color: #555;
        }

        .signature {
          margin-top: 20px;
          font-style: italic;
        }

        .reset-button {
          display: inline-block;
          padding: 0.4rem 1rem;
          font-size: 0.9rem;
          color: white !important;
          background-color: #01455C;
          border: none;
          border-radius: 0.5rem;
          text-decoration: none;
          cursor: pointer;
        }

        .reset-button:hover {
          background-color: #012E44;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <p>Hello,</p>
        <p>We received a request to reset your password for your account on <a href="${origin}">${origin}</a>.</p>
        <a 
          class="reset-button"
          href="${origin}/#/auth/reset/${user.email}/${token}">
          Reset your password
        </a>
        <p>By clicking the button above, you will open a page to create your new password.</p>
        <p>If you don't want to reset your password, please ignore this email message.</p>
        <div class="signature">
          Best regards,
          <br>
          Happy Plants Team
        </div>
      </div>
    </body>
  </html>
`;
}

module.exports = getMailTemplateResetPassword;