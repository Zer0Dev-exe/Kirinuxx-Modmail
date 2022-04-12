import Command from '../lib/structures/Command';
import MessageEmbed from '../lib/structures/MessageEmbed';

export default new Command('knx', async (caller, cmd) => {
	const helpEmbed = new MessageEmbed()
		.setTitle('Reclamar rol KNX')
		.setDescription('**Rol entregado <@605747883601428520>, muchas gracias por apoyar a los atuneros** <a:KNX_Verify:953370703560867911> ')
		.setThumbnail('https://media.discordapp.net/attachments/936591912079618089/962657499046092830/a_e0b6b35c7b24c290a92c0fc22947c0d7.gif')
		.setFooter('Rol entregado | Staff Kirinuxx Stars')
		.setColor('#8736f8');
	return caller.utils.discord.createMessage(cmd.channel.id, { embed: helpEmbed.code });
},
{
	level: 'REGULAR',
	aliases: []
});