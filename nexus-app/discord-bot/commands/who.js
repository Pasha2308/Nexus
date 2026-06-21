const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('who')
    .setDescription('Ask Nexus about a person in your network.')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('e.g. "Alex" or "who do I know at Stripe"')
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const query = interaction.options.getString('name');
    const question = `Tell me everything you know about ${query} from my network.`;

    try {
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question, history: [] })
      });

      const data = await response.json();
      const reply = data.reply || 'No information found.';

      await interaction.editReply({
        content: `🔍 **Network Lookup: ${query}**\n\n${reply.slice(0, 1900)}`
      });
    } catch (err) {
      await interaction.editReply('❌ Could not reach Nexus API. Is `npm run dev` running?');
    }
  }
};
