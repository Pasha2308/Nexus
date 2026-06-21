const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('brief')
    .setDescription('Get your daily founder briefing — pending follow-ups, hot leads, suggested actions.'),

  async execute(interaction) {
    await interaction.deferReply();

    const prompt = `Give me my founder's daily briefing. 
    Review my entire network, identify: 
    1) Who I should follow up with urgently 
    2) The hottest opportunity in my network 
    3) One specific action I should take today 
    Be sharp and direct. No fluff.`;

    try {
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt, history: [] })
      });

      const data = await response.json();
      const reply = data.reply || 'Nothing to report.';

      await interaction.editReply({
        content: `☀️ **Daily Founder Briefing**\n\n${reply.slice(0, 1900)}`
      });
    } catch (err) {
      await interaction.editReply('❌ Could not reach Nexus API. Is `npm run dev` running?');
    }
  }
};
