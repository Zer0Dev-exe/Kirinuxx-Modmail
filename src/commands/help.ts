import Command from '../lib/structures/Command';
import MessageEmbed from '../lib/structures/MessageEmbed';

export default new Command('help', async (caller, cmd) => {
	const helpEmbed = new MessageEmbed()
		.setTitle('ModMail by Zer0')
		.setDescription('````Lista De Comandos```\n**Comandos para conversaciones:**\n`k!r` = Responder con un mensaje al usuario\n`k!ar` = Responder el ticket anonimante\n`k!close <tiempo>` = Responde el ticket solamente con **k!close** o con tiempo **k!close 2h cerrado** por ejemplo\n**Comandos útiles:**\n`k!id` = Te devuelve el ID del miembro\n`k!blacklist <id>` = Ese usuario no podrá abrir Tickets');
	return caller.utils.discord.createMessage(cmd.channel.id, { embed: helpEmbed.code });
},
{
	level: 'REGULAR',
	aliases: []
});