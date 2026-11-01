import {
  GuildMember,
  Message,
  ButtonInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from 'discord.js';
import { prisma, CaptchaMode } from '@hugebot/database';

export class JoinGateSecurity {
  public async handleMemberJoin(member: GuildMember): Promise<boolean> {
    const config = await prisma.joinGateConfig.findUnique({
      where: { guildId: member.guild.id },
    });

    if (!config || !config.enabled) return true;

    // 1. Minimum Account Age Check
    const accountAgeHours = (Date.now() - member.user.createdTimestamp) / (1000 * 60 * 60);
    if (accountAgeHours < config.minAccountAgeHours) {
      console.warn(`[JoinGate] Kicking new account ${member.user.tag} (Age: ${accountAgeHours.toFixed(1)}h < ${config.minAccountAgeHours}h)`);
      await member.kick(`JoinGate: Account age below threshold (${accountAgeHours.toFixed(1)}h < ${config.minAccountAgeHours}h)`).catch(() => null);
      return false;
    }

    // 2. Default Avatar Filter
    if (config.requireAvatar && !member.user.avatar) {
      console.warn(`[JoinGate] Kicking ${member.user.tag} for default avatar requirement`);
      await member.kick('JoinGate: Account has default avatar').catch(() => null);
      return false;
    }

    // 3. Username Invite Shield
    if (config.blockInvitesInName) {
      const inviteRegex = /(discord\.(gg|io|me|li)|discordapp\.com\/invite)\/[a-zA-Z0-9]+/i;
      if (inviteRegex.test(member.user.username) || (member.user.displayName && inviteRegex.test(member.user.displayName))) {
        console.warn(`[JoinGate] Banning ${member.user.tag} for advertising invite link in username`);
        await member.ban({ reason: 'JoinGate: Advertising Discord invite in username' }).catch(() => null);
        return false;
      }
    }

    // 4. Captcha Gate
    if (config.captchaMode !== CaptchaMode.DISABLED) {
      // User must verify before role assignment
      return false;
    }

    // Auto-assign verified role if no captcha required
    if (config.verifiedRoleId) {
      await member.roles.add(config.verifiedRoleId, 'JoinGate Verified').catch(() => null);
    }

    return true;
  }

  public async sendVerificationPrompt(member: GuildMember): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle(`🛡️ Verification Required: ${member.guild.name}`)
      .setDescription(`Welcome! To access the server, click the verification button below to prove you are human.`)
      .setColor(0x5865f2)
      .setTimestamp();

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`joingate_verify:${member.guild.id}`)
        .setLabel('Complete Verification')
        .setStyle(ButtonStyle.Success)
        .setEmoji('✅')
    );

    await member.send({ embeds: [embed], components: [row] }).catch(() => null);
  }

  public async handleVerificationButton(interaction: ButtonInteraction): Promise<void> {
    const guildId = interaction.customId.split(':')[1];
    const config = await prisma.joinGateConfig.findUnique({ where: { guildId } });

    if (!config || !config.verifiedRoleId) {
      await interaction.reply({ content: 'Verification is not configured for this server.', ephemeral: true });
      return;
    }

    const guild = interaction.client.guilds.cache.get(guildId);
    if (!guild) {
      await interaction.reply({ content: 'Server not found.', ephemeral: true });
      return;
    }

    const member = await guild.members.fetch(interaction.user.id).catch(() => null);
    if (!member) {
      await interaction.reply({ content: 'You are not a member of this server.', ephemeral: true });
      return;
    }

    await member.roles.add(config.verifiedRoleId, 'Interactive Captcha Verification Passed');
    await interaction.reply({ content: '✅ Verification successful! Access to the server has been unlocked.', ephemeral: true });
  }

  public async handleHoneypotTrigger(message: Message): Promise<void> {
    if (!message.guild || message.author.bot) return;

    const honeypot = await prisma.honeypotChannel.findUnique({
      where: { channelId: message.channel.id },
    });

    if (honeypot) {
      console.warn(`[Honeypot Trap] User ${message.author.tag} interacted with honeypot channel ${message.channel.id}. Banning...`);
      await message.delete().catch(() => null);
      if (message.member && message.member.bannable) {
        await message.member.ban({
          reason: 'Honeypot Trap Triggered: Automated Scraper / Self-Bot Activity Detected',
          deleteMessageSeconds: 86400,
        }).catch(() => null);
      }
    }
  }
}
