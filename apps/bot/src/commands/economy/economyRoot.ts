import {
  SlashCommandBuilder,
  ApplicationIntegrationType,
  InteractionContextType,
  EmbedBuilder,
} from 'discord.js';
import { EnterpriseSlashCommand, SubcommandHandler, SubcommandGroupHandler } from '../../registry/commandTypes';
import { prisma } from '@hugebot/database';

const builder = new SlashCommandBuilder()
  .setName('economy')
  .setDescription('Full RPG, Global Economy & Stock Market Suite')
  .addSubcommandGroup((group) =>
    group
      .setName('wallet')
      .setDescription('Personal treasury and daily financial actions')
      .addSubcommand((sub) =>
        sub
          .setName('balance')
          .setDescription('Check wallet and bank holdings')
          .addUserOption((opt) => opt.setName('user').setDescription('Target user').setRequired(false))
      )
      .addSubcommand((sub) =>
        sub
          .setName('daily')
          .setDescription('Claim daily currency dividend')
      )
  )
  .addSubcommandGroup((group) =>
    group
      .setName('stock')
      .setDescription('Simulated exchange and investment')
      .addSubcommand((sub) =>
        sub
          .setName('inspect')
          .setDescription('Inspect stock market quote')
          .addStringOption((opt) => opt.setName('symbol').setDescription('Stock ticker symbol (e.g. DIS, GOOG)').setRequired(true))
      )
  );

const balanceHandler: SubcommandHandler = {
  name: 'balance',
  description: 'Check wallet and bank holdings',
  cooldownSeconds: 2,
  execute: async ({ interaction, invokerId }) => {
    const targetUser = interaction.options.getUser('user') ?? interaction.user;

    await prisma.user.upsert({
      where: { id: targetUser.id },
      create: { id: targetUser.id, username: targetUser.username },
      update: { username: targetUser.username },
    });

    const account = await prisma.economyAccount.upsert({
      where: { userId: targetUser.id },
      create: {
        userId: targetUser.id,
        wallet: 500n,
        bank: 0n,
      },
      update: {},
    });

    const embed = new EmbedBuilder()
      .setTitle(`${targetUser.username}'s Financial Portfolio`)
      .setColor(0x2ecc71)
      .setThumbnail(targetUser.displayAvatarURL())
      .addFields(
        { name: '💵 Wallet', value: `🪙 ${account.wallet.toLocaleString()}`, inline: true },
        { name: '🏦 Bank', value: `🪙 ${account.bank.toLocaleString()} / ${account.bankCapacity.toLocaleString()}`, inline: true },
        { name: '💼 Occupation', value: account.jobTitle, inline: true }
      )
      .setFooter({ text: `Daily Streak: ${account.streakDays} days` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};

const dailyHandler: SubcommandHandler = {
  name: 'daily',
  description: 'Claim daily dividend',
  cooldownSeconds: 5,
  execute: async ({ interaction, invokerId }) => {
    await prisma.user.upsert({
      where: { id: invokerId },
      create: { id: invokerId, username: interaction.user.username },
      update: { username: interaction.user.username },
    });

    const userAccount = await prisma.economyAccount.upsert({
      where: { userId: invokerId },
      create: {
        userId: invokerId,
        wallet: 500n,
      },
      update: {},
    });

    const now = new Date();
    const oneDayMs = 24 * 60 * 60 * 1000;
    if (userAccount.lastDailyClaim && now.getTime() - userAccount.lastDailyClaim.getTime() < oneDayMs) {
      const remainingMs = oneDayMs - (now.getTime() - userAccount.lastDailyClaim.getTime());
      const hours = Math.floor(remainingMs / (1000 * 60 * 60));
      const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
      await interaction.reply({
        content: `You have already claimed your daily reward! Return in ${hours}h ${minutes}m.`,
        ephemeral: true,
      });
      return;
    }

    const rewardAmount = 500n;
    await prisma.economyAccount.update({
      where: { userId: invokerId },
      data: {
        wallet: { increment: rewardAmount },
        lastDailyClaim: now,
        streakDays: { increment: 1 },
      },
    });

    await interaction.reply({
      content: `🎉 You claimed your daily reward of **🪙 ${rewardAmount.toLocaleString()}**! Keep up your streak!`,
    });
  },
};

const stockInspectHandler: SubcommandHandler = {
  name: 'inspect',
  description: 'Inspect stock market quote',
  cooldownSeconds: 2,
  execute: async ({ interaction }) => {
    const symbol = interaction.options.getString('symbol', true).toUpperCase();
    const simulatedPrice = (100 + Math.sin(Date.now() / 100000) * 45 + Math.random() * 5).toFixed(2);
    const change = (Math.sin(Date.now() / 50000) * 3.5).toFixed(2);

    const embed = new EmbedBuilder()
      .setTitle(`Market Ticker: ${symbol}`)
      .setColor(Number(change) >= 0 ? 0x2ecc71 : 0xe74c3c)
      .addFields(
        { name: 'Current Valuation', value: `$${simulatedPrice}`, inline: true },
        { name: '24h Change', value: `${Number(change) >= 0 ? '+' : ''}${change}%`, inline: true },
        { name: 'Volume (Simulated)', value: `${(Math.random() * 50000 + 10000).toFixed(0)} units`, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};

const walletGroup: SubcommandGroupHandler = {
  name: 'wallet',
  description: 'Personal treasury and daily financial actions',
  subcommands: new Map([
    ['balance', balanceHandler],
    ['daily', dailyHandler],
  ]),
};

const stockGroup: SubcommandGroupHandler = {
  name: 'stock',
  description: 'Simulated exchange and investment',
  subcommands: new Map([['inspect', stockInspectHandler]]),
};

export const economyCommand: EnterpriseSlashCommand = {
  name: 'economy',
  description: 'Full RPG, Global Economy & Stock Market Suite',
  integrationTypes: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall],
  contexts: [InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel],
  builder,
  groups: new Map([
    ['wallet', walletGroup],
    ['stock', stockGroup],
  ]),
  rootSubcommands: new Map(),
};
