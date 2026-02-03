import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  notifyManagersAboutFlaggedUser(userId: number) {
    console.log(`USER FLAGGED: ${userId}`);
  }
  notifyUsers(userId: number) {
    console.log(`USER forgiven: ${userId}`);
  }
}
