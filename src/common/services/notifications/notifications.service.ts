import { Injectable, BadRequestException } from '@nestjs/common';
import { db, messaging } from '../../../firebase/firebase-admin.config';

interface SendPushParams {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

@Injectable()
export class NotificationsService {
  async sendPushToUserAndLog(params: SendPushParams) {
    const { userId, title, body, data = {} } = params;

    // Validate userId to avoid passing an empty/undefined value to Firestore.doc()
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      throw new BadRequestException('userId is required and must be a non-empty string');
    }

    // 1. Buscar usuario en Firestore
    const userSnap = await db.collection('users').doc(userId).get();
    if (!userSnap.exists) {
      // log user_not_found...
      return { success: false, reason: 'user_not_found' };
    }
    
    const userData = userSnap.data() || {};
    let token = userData.fcm_token as string | undefined;
    
    // Fallback: tomar el token más reciente de subcolección
    if (!token) {
      const tokensSnap = await db
        .collection('users')
        .doc(userId)
        .collection('fcm_tokens')
        .orderBy('created_at', 'desc') // usa el campo que SÍ tienes
        .limit(1)
        .get();
    
      if (!tokensSnap.empty) {
        const latest = tokensSnap.docs[0].data();
        token = latest.fcm_token as string | undefined;
      }
    }
    
    if (!token) {
      await this.log({
        userId,
        title,
        body,
        status: 'no_fcm_token',
        message: 'No hay fcm_token ni en raíz ni en subcolección',
        data,
      });
      return { success: false, reason: 'no_fcm_token' };
    }

    // 2. Armar mensaje (data DEBE ser string:string)
    const normalizedData: Record<string, string> = {};
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        normalizedData[key] = String(value);
      }
    });

    const message = {
      token,
      notification: {
        title,
        body,
      },
      data: normalizedData,
    };

    try {
      const responseId = await messaging.send(message);

      // 3. Log éxito
      await this.log({
        userId,
        title,
        body,
        token,
        status: 'sent',
        responseId,
        data,
      });

      return { success: true, responseId };
    } catch (error: any) {
      // 4. Log error
      await this.log({
        userId,
        title,
        body,
        token,
        status: 'error',
        message: error?.message || 'Error desconocido al enviar FCM',
        data,
      });

      return { success: false, reason: 'error_sending', error: error?.message };
    }
  }

  private async log(args: {
    userId: string;
    title: string;
    body: string;
    token?: string;
    status: 'sent' | 'error' | 'no_fcm_token' | 'user_not_found';
    responseId?: string;
    message?: string;
    data?: any;
  }) {
    const {
      userId,
      title,
      body,
      token,
      status,
      responseId,
      message,
      data,
    } = args;

    const logRef = db.collection('notifications_sent').doc();

    await logRef.set({
      user_id: userId,
      title,
      body,
      token: token ?? null,
      status,
      response_id: responseId ?? null,
      message: message ?? null,
      data: data ?? {},
      created_at: new Date(),
    });
  }
}
