import Command from '../lib/structures/Command';
import MessageEmbed from '../lib/structures/MessageEmbed';

export default new Command('anunciar', async (caller, cmd) => {
	const helpEmbed = new MessageEmbed()
		.setTitle('El peligro se acerca!')
		.setDescription('Ven a por mi <@852213343825559552>');
	return caller.utils.discord.createMessage(cmd.channel.id, { embed: helpEmbed.code });
},
{
	level: 'REGULAR',
	aliases: []
});