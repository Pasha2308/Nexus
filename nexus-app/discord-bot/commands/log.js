const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('log')
    .setDescription('Log a brain dump — meeting notes, a new contact, anything.')
    .addStringOption(option =>
      option.setName('note')
        .setDescription('e.g. "Met Rohan, CTO at FintechCo, follow up Tuesday"')
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const note = interaction.options.getString('note');

    try {
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: note, history: [] })
      });

      const data = await response.json();
      const reply = data.reply || 'Saved.';

      await interaction.editReply({
        content: `🧠 **Brain Dump Logged**\n\n${reply.slice(0, 1900)}`
      });
    } catch (err) {
      await interaction.editReply('❌ Could not reach Nexus API. Is `npm run dev` running?');
    }
  }
};
