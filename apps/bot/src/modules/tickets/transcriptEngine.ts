import { TextChannel, Message } from 'discord.js';

export class HtmlTranscriptEngine {
  public async generateTranscript(channel: TextChannel, ticketNumber: number): Promise<string> {
    const messages = await channel.messages.fetch({ limit: 100 });
    const sorted = Array.from(messages.values()).reverse();

    const messagesHtml = sorted
      .map((msg: Message) => {
        const time = new Date(msg.createdTimestamp).toLocaleString();
        const avatar = msg.author.displayAvatarURL();
        const content = this.escapeHtml(msg.content);
        const attachments = msg.attachments
          .map((att) => `<div class="attachment"><a href="${att.url}" target="_blank">📎 ${att.name}</a></div>`)
          .join('');

        return `
        <div class="message-row">
          <img class="avatar" src="${avatar}" alt="avatar" />
          <div class="message-content">
            <div class="header">
              <span class="author">${this.escapeHtml(msg.author.tag)}</span>
              <span class="timestamp">${time}</span>
            </div>
            <div class="text">${content}</div>
            ${attachments}
          </div>
        </div>
        `;
      })
      .join('\n');

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Transcript - Ticket #${ticketNumber}</title>
      <style>
        body { background: #313338; color: #dbdee1; font-family: 'gg sans', 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 24px; }
        .container { max-width: 900px; margin: 0 auto; background: #2b2d31; border-radius: 8px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
        .title { font-size: 24px; font-weight: bold; color: #fff; border-bottom: 1px solid #3f4147; padding-bottom: 12px; margin-bottom: 20px; }
        .message-row { display: flex; gap: 16px; margin-bottom: 16px; line-height: 1.4; }
        .avatar { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; }
        .header { display: flex; gap: 8px; align-items: baseline; margin-bottom: 4px; }
        .author { font-weight: 600; color: #fff; font-size: 15px; }
        .timestamp { font-size: 12px; color: #949ba4; }
        .text { font-size: 14px; word-break: break-word; }
        .attachment { margin-top: 6px; }
        .attachment a { color: #00a8fc; text-decoration: none; font-size: 13px; }
        .footer { margin-top: 30px; border-top: 1px solid #3f4147; padding-top: 12px; font-size: 12px; color: #949ba4; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="title">Ticket #${ticketNumber} Transcript - ${this.escapeHtml(channel.name)}</div>
        <div class="messages">
          ${messagesHtml}
        </div>
        <div class="footer">Archived by Galaxy Bot Support Engine • Total Messages: ${sorted.length}</div>
      </div>
    </body>
    </html>
    `;
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
