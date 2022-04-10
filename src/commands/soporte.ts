import Command from '../lib/structures/Command';
import MessageEmbed from '../lib/structures/MessageEmbed';

export default new Command('soporte', async (caller, cmd) => {
	const helpEmbed = new MessageEmbed()
		.setTitle('`Sistema de Soporte`')
		.setDescription('<a:alert:953369428249161748>  **__¿Qué es un Ticket?**__\n > Los Tickets son un método rápido y sencillo para obtener soporte por parte del Equipo de Staff, puedes preguntar dudas, comentar problemas y solicitar información de todo tipo.\n <:KNX_KannaWhat:952261763775217676> **__¿Como abrir un ticket?__**\n > Tendrás que enviarme un MD y esperar a que un Staff se haga cargo del Ticket, este proceso puede tardar un poco de tiempo, por lo tanto se pide paciencia.')
		.setThumbnail('https://media.discordapp.net/attachments/936591912079618089/962657499046092830/a_e0b6b35c7b24c290a92c0fc22947c0d7.gif')
		.setFooter('Equipo Staff | Kirinuxx Stars')
		.setColor('#8736f8');
	return caller.utils.discord.createMessage(cmd.channel.id, { embed: helpEmbed.code });
},
{
	level: 'REGULAR',
	aliases: []
});


