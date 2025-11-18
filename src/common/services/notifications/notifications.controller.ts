import { Body, Controller, Post } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

class SendNotificationDto {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('send')
  async send(@Body() body: SendNotificationDto) {
    return this.notificationsService.sendPushToUserAndLog(body);
  }
}
