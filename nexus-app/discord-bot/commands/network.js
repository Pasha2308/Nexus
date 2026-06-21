const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('network')
    .setDescription('Show all contacts stored in your Valkey memory graph.'),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const response = await fetch('http://localhost:3000/api/network');
      const data = await response.json();
      const connections = data.connections || [];

      if (connections.length === 0) {
        await interaction.editReply('📭 No contacts found yet. Use `/log` to add your first connection!');
        return;
      }

      const list = connections
        .map((c, i) => `**${i + 1}.** ${c}`)
        .join('\n');

      await interaction.editReply({
        content: `🌐 **Your Network (${connections.length} contacts)**\n\n${list.slice(0, 1900)}`
      });
    } catch (err) {
      await interaction.editReply('❌ Could not reach Nexus API. Is `npm run dev` running?');
    }
  }
};
