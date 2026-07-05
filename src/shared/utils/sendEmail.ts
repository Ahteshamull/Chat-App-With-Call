import nodemailer from 'nodemailer';
import config from '../../config';

const sendEmail = async (to: string, subject: string, html: string) => {
  const transporter = nodemailer.createTransport({
    host: config.email.host,
    port: Number(config.email.port),
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  });

  await transporter.sendMail({
    from: config.email.user,
    to,
    subject,
    html,
  });
};

export default sendEmail;
