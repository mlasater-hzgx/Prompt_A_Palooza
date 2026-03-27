import nodemailer from 'nodemailer';
import { prisma } from '../config/database';
import { NotificationType } from '@prisma/client';
import { config } from '../config';
import { logger } from '../utils/logger';

interface SendNotificationParams {
  type: NotificationType;
  title: string;
  message: string;
  userId: string;
  incidentId?: string;
  sendEmail?: boolean;
}

// Create SMTP transport (lazy init)
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter && config.smtp.host) {
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    });
  }
  return transporter;
}

export async function sendNotification(params: SendNotificationParams) {
  const { type, title, message, userId, incidentId, sendEmail = true } = params;

  // Create in-app notification
  const notification = await prisma.notification.create({
    data: {
      type,
      title,
      message,
      userId,
      incidentId: incidentId ?? null,
    },
  });

  // Send email if configured
  if (sendEmail) {
    try {
      const transport = getTransporter();
      if (transport) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user?.email) {
          await transport.sendMail({
            from: config.smtp.from,
            to: user.email,
            subject: title,
            text: message,
            html: `<div style="font-family: Roboto, Arial, sans-serif; max-width: 600px;">
              <div style="background: #000; padding: 16px;">
                <span style="font-family: Oswald, sans-serif; color: #FFD100; font-size: 1.4rem; font-weight: 700; letter-spacing: 0.08em;">HERZOG</span>
              </div>
              <div style="border-bottom: 3px solid #FFD100;"></div>
              <div style="padding: 24px;">
                <h2 style="font-family: Oswald, sans-serif; text-transform: uppercase; color: #000;">${title}</h2>
                <p style="color: #58595B; line-height: 1.6;">${message}</p>
              </div>
            </div>`,
          });
          logger.info({ userId, type, title }, 'Email notification sent');
        }
      }
    } catch (err) {
      logger.error(err, 'Failed to send email notification');
      // Don't throw - email failure shouldn't break the flow
    }
  }

  return notification;
}

export async function getNotificationsForUser(userId: string, unreadOnly = false) {
  return prisma.notification.findMany({
    where: {
      userId,
      ...(unreadOnly ? { isRead: false } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}

export async function markNotificationRead(id: string, userId: string) {
  return prisma.notification.update({
    where: { id, userId },
    data: { isRead: true, readAt: new Date() },
  });
}

export async function markAllNotificationsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({
    where: { userId, isRead: false },
  });
}
