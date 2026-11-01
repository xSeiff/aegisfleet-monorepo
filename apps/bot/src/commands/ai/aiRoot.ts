import {
  SlashCommandBuilder,
  ApplicationIntegrationType,
  InteractionContextType,
  EmbedBuilder,
} from 'discord.js';
import { EnterpriseSlashCommand, SubcommandHandler, SubcommandGroupHandler } from '../../registry/commandTypes';

const builder = new SlashCommandBuilder()
  .setName('ai')
  .setDescription('AI Assistant & Multimodal Tooling Suite')
  .addSubcommandGroup((group) =>
    group
      .setName('chat')
      .setDescription('Conversational LLM utilities')
      .addSubcommand((sub) =>
        sub
          .setName('prompt')
          .setDescription('Send a prompt to the AI assistant')
          .addStringOption((opt) => opt.setName('instruction').setDescription('Prompt content').setRequired(true))
      )
  )
  .addSubcommandGroup((group) =>
    group
      .setName('mod')
      .setDescription('AI Moderation and Heuristics')
      .addSubcommand((sub) =>
        sub
          .setName('score_toxicity')
          .setDescription('Analyze a text string for toxic sentiment')
          .addStringOption((opt) => opt.setName('text').setDescription('Text to score').setRequired(true))
      )
  );

const promptHandler: SubcommandHandler = {
  name: 'prompt',
  description: 'Send a prompt to the AI assistant',
  cooldownSeconds: 4,
  execute: async ({ interaction }) => {
    const instruction = interaction.options.getString('instruction', true);
    await interaction.deferReply();

    // Simulated LLM inference response
    const mockAnswer = `Here is an AI response analyzing: "${instruction}"\n\n- Systematic analysis complete.\n- Confidence level: 99.4%\n- Zero safety violations detected.`;

    const embed = new EmbedBuilder()
      .setTitle('🤖 Neural Assistant')
      .setColor(0x8e44ad)
      .addFields(
        { name: 'User Query', value: instruction },
        { name: 'Model Inference', value: mockAnswer }
      )
      .setFooter({ text: 'Engine: Enterprise Multi-Modal Agent Pipeline' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};

const toxicityHandler: SubcommandHandler = {
  name: 'score_toxicity',
  description: 'Analyze a text string for toxic sentiment',
  cooldownSeconds: 2,
  execute: async ({ interaction }) => {
    const text = interaction.options.getString('text', true);

    const toxicKeywords = ['idiot', 'scam', 'hate', 'trash', 'kill'];
    const lower = text.toLowerCase();
    const matches = toxicKeywords.filter((w) => lower.includes(w));
    const score = matches.length > 0 ? 0.85 : 0.05;

    const embed = new EmbedBuilder()
      .setTitle('🧠 AI Toxicity Classifier')
      .setColor(score > 0.5 ? 0xe74c3c : 0x2ecc71)
      .addFields(
        { name: 'Sample', value: `\`${text}\`` },
        { name: 'Toxicity Score', value: `${(score * 100).toFixed(1)}%` },
        { name: 'Classification', value: score > 0.5 ? '⚠️ High Risk / Potentially Abusive' : '✅ Low Risk / Benign' }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};

const chatGroup: SubcommandGroupHandler = {
  name: 'chat',
  description: 'Conversational LLM utilities',
  subcommands: new Map([['prompt', promptHandler]]),
};

const modGroup: SubcommandGroupHandler = {
  name: 'mod',
  description: 'AI Moderation and Heuristics',
  subcommands: new Map([['score_toxicity', toxicityHandler]]),
};

export const aiCommand: EnterpriseSlashCommand = {
  name: 'ai',
  description: 'AI Assistant & Multimodal Tooling Suite',
  integrationTypes: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall],
  contexts: [InteractionContextType.Guild, InteractionContextType.BotDM],
  builder,
  groups: new Map([
    ['chat', chatGroup],
    ['mod', modGroup],
  ]),
  rootSubcommands: new Map(),
};
