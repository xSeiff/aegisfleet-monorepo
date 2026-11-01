import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@hugebot/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ guildId: string }> }
) {
  try {
    const { guildId } = await params;

    // Ensure the guild exists in database
    const config = await prisma.guildConfig.upsert({
      where: { guildId },
      create: {
        guildId,
        antiNukeConfig: {
          create: {
            enabled: true,
            channelDeleteLimit: 3,
            roleDeleteLimit: 3,
            banLimit: 4,
            kickUnauthorizedBots: true,
            quarantineRoleId: null,
          },
        },
        heatConfig: {
          create: {
            enabled: true,
            warnThreshold: 10,
            panicModeThreshold: 100,
          },
        },
        welcomerConfig: {
          create: {
            welcomeMessage: 'Welcome {user} to {server}! You are member #{count} 🎉',
            cardBorderColor: '#6366f1',
          },
        },
        loggingGrid: {
          create: {},
        },
      },
      update: {},
      include: {
        antiNukeConfig: true,
        heatConfig: true,
        welcomerConfig: true,
        loggingGrid: true,
        autoResponders: true,
        ticketPanels: true,
      },
    });

    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    console.error('Error fetching guild settings:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ guildId: string }> }
) {
  try {
    const { guildId } = await params;
    const body = await request.json();

    // 1. Update Core GuildConfig
    await prisma.guildConfig.upsert({
      where: { guildId },
      create: {
        guildId,
        prefix: body.prefix ?? '!',
        language: body.language ?? 'en-US',
        timezone: body.timezone ?? 'UTC',
      },
      update: {
        prefix: body.prefix,
        language: body.language,
        timezone: body.timezone,
      },
    });

    // 2. Update Anti-Nuke Config if provided
    if (body.antiNuke) {
      await prisma.antiNukeConfig.upsert({
        where: { guildId },
        create: {
          guildId,
          enabled: body.antiNuke.enabled ?? true,
          channelDeleteLimit: body.antiNuke.channelDeleteLimit ?? 3,
          roleDeleteLimit: body.antiNuke.roleDeleteLimit ?? 3,
          banLimit: body.antiNuke.banLimit ?? 4,
          kickUnauthorizedBots: body.antiNuke.kickUnauthorizedBots ?? true,
          quarantineRoleId: body.antiNuke.quarantineRoleId,
          timeWindowSeconds: body.antiNuke.timeWindowSeconds ?? 10,
        },
        update: {
          enabled: body.antiNuke.enabled,
          channelDeleteLimit: body.antiNuke.channelDeleteLimit,
          roleDeleteLimit: body.antiNuke.roleDeleteLimit,
          banLimit: body.antiNuke.banLimit,
          kickUnauthorizedBots: body.antiNuke.kickUnauthorizedBots,
          quarantineRoleId: body.antiNuke.quarantineRoleId,
          timeWindowSeconds: body.antiNuke.timeWindowSeconds,
        },
      });
    }

    // 3. Update Heat Config if provided
    if (body.heat) {
      await prisma.heatConfig.upsert({
        where: { guildId },
        create: {
          guildId,
          enabled: body.heat.enabled ?? true,
          warnThreshold: body.heat.warnThreshold ?? 10,
          panicModeThreshold: body.heat.panicModeThreshold ?? 100,
        },
        update: {
          enabled: body.heat.enabled,
          warnThreshold: body.heat.warnThreshold,
          panicModeThreshold: body.heat.panicModeThreshold,
        },
      });
    }

    // 4. Update Welcomer Config if provided
    if (body.welcomer) {
      await prisma.welcomerConfig.upsert({
        where: { guildId },
        create: {
          guildId,
          welcomeMessage: body.welcomer.welcomeMessage ?? 'Welcome {user} to {server}!',
          cardBorderColor: body.welcomer.cardBorderColor ?? '#6366f1',
          showAvatar: body.welcomer.showAvatar ?? true,
        },
        update: {
          welcomeMessage: body.welcomer.welcomeMessage,
          cardBorderColor: body.welcomer.cardBorderColor,
          showAvatar: body.welcomer.showAvatar,
        },
      });
    }

    // 5. Update Logging Channel Grid if provided
    if (body.logging) {
      await prisma.loggingChannelGrid.upsert({
        where: { guildId },
        create: {
          guildId,
          messageDeleteChannelId: body.logging.messageDeleteChannelId,
          messageEditChannelId: body.logging.messageEditChannelId,
          voiceLogChannelId: body.logging.voiceLogChannelId,
          memberLogChannelId: body.logging.memberLogChannelId,
        },
        update: {
          messageDeleteChannelId: body.logging.messageDeleteChannelId,
          messageEditChannelId: body.logging.messageEditChannelId,
          voiceLogChannelId: body.logging.voiceLogChannelId,
          memberLogChannelId: body.logging.memberLogChannelId,
        },
      });
    }

    // 6. Create Ticket Panel if provided
    if (body.ticketPanel) {
      await prisma.ticketPanel.create({
        data: {
          guildId,
          title: body.ticketPanel.title ?? 'Customer Support',
          description: body.ticketPanel.description ?? 'Click to open a support ticket.',
          channelId: body.ticketPanel.channelId ?? '100000000000000000',
          ticketPrefix: body.ticketPanel.ticketPrefix ?? 'ticket',
        },
      });
    }

    // 7. Create Auto-Responder if provided
    if (body.autoResponder) {
      await prisma.autoResponder.create({
        data: {
          guildId,
          triggerText: body.autoResponder.triggerText,
          matchType: body.autoResponder.matchType ?? 'EXACT',
          responseJson: { text: body.autoResponder.reply },
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Configuration successfully committed to PostgreSQL database.',
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error updating guild settings:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
