export class NotificationDTO {
  constructor(notification) {
    this.id = notification.id;
    this.type = notification.type;
    this.channel = notification.channel;
    this.title = notification.title;
    this.message = notification.message;
    this.status = notification.status;
    this.payload = notification.payload;
    this.isRead = notification.isRead;
    this.createdAt = notification.createdAt;
  }
}
