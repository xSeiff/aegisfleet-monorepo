import { createCanvas, loadImage } from '@napi-rs/canvas';

export interface WelcomeCardOptions {
  username: string;
  avatarUrl: string;
  serverName: string;
  memberCount: number;
  bgUrl?: string | null;
  borderColor?: string;
  textColor?: string;
}

export interface RankCardOptions {
  username: string;
  avatarUrl: string;
  currentLevel: number;
  currentXp: number;
  requiredXp: number;
  rankPosition: number;
  customBgUrl?: string | null;
  borderColor?: string;
}

export class GalaxyCardRenderer {
  public async renderWelcomeCard(options: WelcomeCardOptions): Promise<Buffer> {
    const width = 800;
    const height = 360;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // 1. Background
    if (options.bgUrl) {
      try {
        const bg = await loadImage(options.bgUrl);
        ctx.drawImage(bg, 0, 0, width, height);
      } catch {
        ctx.fillStyle = '#1e1f22';
        ctx.fillRect(0, 0, width, height);
      }
    } else {
      ctx.fillStyle = '#1e1f22';
      ctx.fillRect(0, 0, width, height);
    }

    // Gradient Overlay
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.4)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.85)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Border
    ctx.strokeStyle = options.borderColor || '#5865F2';
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, width - 6, height - 6);

    // Avatar with circular mask and shadow
    const avatarRadius = 64;
    const avatarX = width / 2;
    const avatarY = 110;

    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();

    try {
      const avatarImg = await loadImage(options.avatarUrl);
      ctx.drawImage(avatarImg, avatarX - avatarRadius, avatarY - avatarRadius, avatarRadius * 2, avatarRadius * 2);
    } catch {
      ctx.fillStyle = '#5865F2';
      ctx.fill();
    }
    ctx.restore();

    // Circular Avatar Ring
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, avatarRadius + 3, 0, Math.PI * 2, true);
    ctx.strokeStyle = options.borderColor || '#5865F2';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Typography
    ctx.textAlign = 'center';
    ctx.fillStyle = options.textColor || '#FFFFFF';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText(`WELCOME`, width / 2, 220);

    ctx.font = 'bold 24px sans-serif';
    ctx.fillStyle = '#5865F2';
    ctx.fillText(options.username.toUpperCase(), width / 2, 255);

    ctx.font = '18px sans-serif';
    ctx.fillStyle = '#B5BAC1';
    ctx.fillText(`You are member #${options.memberCount} of ${options.serverName}`, width / 2, 295);

    return canvas.toBuffer('image/png');
  }

  public async renderRankCard(options: RankCardOptions): Promise<Buffer> {
    const width = 900;
    const height = 280;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#18191c';
    ctx.fillRect(0, 0, width, height);

    // Border Accent
    ctx.strokeStyle = options.borderColor || '#7289DA';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, width - 4, height - 4);

    // Avatar
    const avatarRadius = 55;
    const avatarX = 85;
    const avatarY = 140;

    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();

    try {
      const avatar = await loadImage(options.avatarUrl);
      ctx.drawImage(avatar, avatarX - avatarRadius, avatarY - avatarRadius, avatarRadius * 2, avatarRadius * 2);
    } catch {
      ctx.fillStyle = '#7289DA';
      ctx.fill();
    }
    ctx.restore();

    ctx.beginPath();
    ctx.arc(avatarX, avatarY, avatarRadius + 2, 0, Math.PI * 2, true);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Text details
    ctx.textAlign = 'left';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText(options.username, 175, 110);

    ctx.textAlign = 'right';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillStyle = '#7289DA';
    ctx.fillText(`RANK #${options.rankPosition}   LEVEL ${options.currentLevel}`, width - 50, 110);

    // XP Progress Bar
    const barX = 175;
    const barY = 160;
    const barWidth = 675;
    const barHeight = 28;
    const progress = Math.min(1, Math.max(0, options.currentXp / options.requiredXp));

    // Bar Background
    ctx.fillStyle = '#2f3136';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barWidth, barHeight, 14);
    ctx.fill();

    // Bar Fill
    if (progress > 0) {
      ctx.fillStyle = options.borderColor || '#7289DA';
      ctx.beginPath();
      ctx.roundRect(barX, barY, barWidth * progress, barHeight, 14);
      ctx.fill();
    }

    // Progress Text
    ctx.textAlign = 'right';
    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#B5BAC1';
    ctx.fillText(`${options.currentXp.toLocaleString()} / ${options.requiredXp.toLocaleString()} XP`, width - 50, 225);

    return canvas.toBuffer('image/png');
  }
}
