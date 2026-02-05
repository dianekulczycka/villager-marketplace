import { Injectable, NotFoundException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as handlebars from 'handlebars';
import { emailConstants, IEmailData } from './const/email.constants';
import { PrismaService } from '../prisma/prisma.service';
import { user_role } from '@prisma/client';
import { USER_ERRORS } from '../user/const/errors';
import { AccountRecoveryRequestDto } from '../user/dto/account-recovery-request.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private transporter: Transporter;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('MAIL_SERVICE_EMAIL') || '',
        pass: this.configService.get<string>('MAIL_SERVICE_PASSWORD') || '',
      },
    });
  }

  private async getManagerEmails(): Promise<string[]> {
    const managers = await this.prisma.user.findMany({
      where: {
        role: user_role.MANAGER,
        isDeleted: 0,
        isBanned: 0,
      },
      select: { email: true },
    });

    return managers.map((m) => m.email);
  }

  private async renderTemplate(
    templateName: string,
    context: Record<string, any>,
  ): Promise<string> {
    const basePath = path.join(process.cwd(), 'src', 'mail', 'templates');

    const layoutSource = await fs.readFile(
      path.join(basePath, 'base.hbs'),
      'utf8',
    );
    const layout = handlebars.compile(layoutSource);

    const templateSource = await fs.readFile(
      path.join(basePath, `${templateName}.hbs`),
      'utf8',
    );
    const template = handlebars.compile(templateSource);

    const body = template(context);

    return layout({ body });
  }

  async send(
    to: string,
    type: keyof typeof emailConstants,
    context: Record<string, any>,
  ): Promise<void> {
    const emailData: IEmailData = emailConstants[type];

    const html = await this.renderTemplate(emailData.template, context);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    await this.transporter.sendMail({
      to,
      subject: emailData.subject,
      html,
    });
  }

  async notifyManagersFlagged(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { email: true },
    });
    if (!user) throw new NotFoundException(USER_ERRORS.NOT_FOUND);
    const managers = await this.getManagerEmails();

    await Promise.all(
      managers.map((m) =>
        this.send(m, 'FLAGGED_ADMIN', {
          userId: id,
          email: user.email,
        }),
      ),
    );
  }

  async notifyManagersBanned(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { email: true },
    });
    if (!user) throw new NotFoundException(USER_ERRORS.NOT_FOUND);
    const managers = await this.getManagerEmails();

    await Promise.all(
      managers.map((m) =>
        this.send(m, 'BANNED_ADMIN', {
          userId: id,
          email: user.email,
        }),
      ),
    );
  }

  async notifyUserFlagged(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { email: true },
    });
    if (!user) throw new NotFoundException(USER_ERRORS.NOT_FOUND);
    await this.send(user.email, 'FLAGGED', {});
  }

  async notifyUserBanned(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { email: true },
    });
    if (!user) throw new NotFoundException(USER_ERRORS.NOT_FOUND);
    await this.send(user.email, 'BANNED', {});
  }

  async sendRecoveryRequest(
    accountRecoveryRequestDto: AccountRecoveryRequestDto,
  ) {
    const { email, actionType: action, text } = accountRecoveryRequestDto;
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (!user) throw new NotFoundException(USER_ERRORS.NOT_FOUND);
    const managers = await this.getManagerEmails();
    await Promise.all(
      managers.map((m) =>
        this.send(m, 'RECOVERY_REQUEST', {
          email,
          action,
          userId: user.id,
          text,
        }),
      ),
    );
  }

  async sendRecoveryApproved(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { email: true },
    });
    if (!user) throw new NotFoundException(USER_ERRORS.NOT_FOUND);
    await this.send(user.email, 'RECOVERY_APPROVE', {});
  }
}
