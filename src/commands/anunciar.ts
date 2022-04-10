import Command from '../lib/structures/Command';
import MessageEmbed from '../lib/structures/MessageEmbed';

export default new Command('anunciar', async (caller, cmd) => {
	const helpEmbed = new MessageEmbed()
		.setTitle('Hola')
		.setDescription('```Lista De Coman```\n**__Comandos para conversaciones:__**\n \n`k!r` = Responder con un mensaje al usuario\n`k!ar` = Responder el ticket anonimante\n`k!close <tiempo>` = Responde el ticket solamente con **k!close** o con tiempo **k!close 2h cerrado** por ejemplo\n \n**__Comandos útiles:__**\n \n`k!id` = Te devuelve el ID del miembro\n`k!blacklist <id>` = Ese usuario no podrá abrir Tickets\n`k!ping` = Devuelve la latencia del bot\n`k!rename` = Cambia el nombre del canal y del ticket\n \n **__Comandos Administrativos__**\n \n`k!set` = Cambia las descripciones de los embeds\n`k!setup` = Inicia la configuración del bot');
	return caller.utils.discord.createMessage(cmd.channel.id, { embed: helpEmbed.code });
},
{
	level: 'REGULAR',
	aliases: []
});