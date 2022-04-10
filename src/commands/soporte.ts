import Command from '../lib/structures/Command';
import MessageEmbed from '../lib/structures/MessageEmbed';

export default new Command('soporte', async (caller, cmd) => {
	const helpEmbed = new MessageEmbed()
		.setTitle('`Sistema de Soporte`')
		.setDescription('`❓` ¿Qué es un Ticket?\n > Los Tickets son un método rápido y sencillo para obtener soporte por parte del Equipo de Staff, puedes preguntar dudas, comentar problemas y solicitar información de todo tipo.')
		.setThumbnail('https://media.discordapp.net/attachments/936591912079618089/962657499046092830/a_e0b6b35c7b24c290a92c0fc22947c0d7.gif');
	return caller.utils.discord.createMessage(cmd.channel.id, { embed: helpEmbed.code });
},
{
	level: 'REGULAR',
	aliases: []
});


