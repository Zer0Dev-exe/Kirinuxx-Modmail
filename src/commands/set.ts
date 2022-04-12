import Command from '../lib/structures/Command';
import Axios from 'axios';
import MessageEmbed from '../lib/structures/MessageEmbed';
import { COLORS, STATUSES } from '../Constants';
import { AnyChannel, TextChannel } from 'eris';
import ms from 'ms';
import {IConfig} from "../lib/types/Database";

export default new Command('set', async (caller, cmd, _log, config) => {
	const invalidArgsEmbed = new MessageEmbed()
		.setTitle('Settings you can change of the bot.')
		.setColor(COLORS.GREEN)
		.setThumbnail(cmd.channel.guild.dynamicIconURL())
		.setDescription(`
\`avatar\`: cambia la imagen actual del bot.
\`username\`: cambiar el nombre de usuario del bot, no el apodo.
\`prefix\`: actualiza el prefix del bot (maximas lineas: 4).
\`category\`: la ID de la categoría donde quieres que abra los tickets
\`logs\`: el ID a donde tengo que mandar los logs.
\`status\`: cambia el estado del bot.
\`status_type\`: cambia el tiop de estado del bot.
\`notification\`: cambia el ID del rol a la que quieres mencionar al abrir un ticket.
\`account_age\`: cambia la edad minima de la cuenta para poder abrir los tickets.
\`guild_age\`: cambia el minimo tiemop que debe de tener cuenta en el servidor para poder abrir los tickets.
\`guild_age_id\`: ID del servidor donde pide tener una minima edad.
\`embed_creation_title\`: el titulo del embed enviado al usuario cuando un ticket ha sido abierto.
\`embed_creation_thumbnail\`: el thumbnail del embed enviado al usuario cuando un ticket ha sido abierto ("none" para desabilitar).
\`embed_creation_description\`: la descripción del embed enviado al usuario cuando un ticket ha sido abierto.
\`embed_creation_color\`: el color (dex) del embed enviado al usuario cuando un ticket ha sido abierto.
\`embed_creation_footer_text\`: el pie de embed enviado al usuario cuando un ticket ha sido abierto.
\`embed_creation_footer_image\`: la imagen del footer embed enviado al usuario cuando un ticket ha sido abierto.
\`embed_contact_title\`: el titulo del embed enviado al usuario cuando un ticket ha sido abierto por un staff.
\`embed_contact_thumbnail\`: el thumbanail del embed enviado al usuario cuando un ticket ha sido abierto por un staff.("none" para desabilitar).
\`embed_contact_description\`: la descripción del embed enviado al usuario cuando un ticket ha sido abierto por un staff.
\`embed_contact_color\`: el color del embed enviado al usuario cuando un ticket ha sido abierto por un staff.
\`embed_contact_footer_text\`: el footer del embed enviado al usuario cuando un ticket ha sido abierto por un staff.
\`embed_contact_footer_image\`: la imagen footer del embed enviado al usuario cuando un ticket ha sido abierto por un staff.
\`embed_closure_title\`: el titulo del embed enviado al usuario cuando un ticket ha sido cerrado.
\`embed_closure_thumbnail\`: el thumbnail footer del embed enviado al usuario cuando un ticket ha sido cerrado ("none" para desabilitar).
\`embed_closure_description\`: la descripción del embed enviado al usuario cuando un ticket ha sido cerrado.
\`embed_closure_color\`: el color del embed enviado al usuario cuando un ticket ha sido cerrado.
\`embed_closure_footer_text\`: el texto del footer del embed enviado al usuario cuando un ticket ha sido cerrado.
\`embed_closure_footer_image\`: el footer image del embed enviado al usuario cuando un ticket ha sido cerrado.
\`embed_staff_title\`: el titulo mostrado en el canal de staff al abrir el ticket.
\`embed_staff_color\`: el color hex del embed enviado al canal de staff.`)
		.addField('Usage', `${config.prefix}set {parameter} {value}`);

	if (!cmd.args[0]) return caller.utils.discord.createMessage(cmd.channel.id, { embed: invalidArgsEmbed.code });
	if (!cmd.args[1] && cmd.msg.attachments.length === 0) return caller.utils.discord.createMessage(cmd.channel.id, 'Please, provide a value.');

	let updated: boolean;
	switch (cmd.args[0]) {
		case 'avatar':
			if (!cmd.msg.attachments[0])
				return caller.utils.discord.createMessage(cmd.channel.id, 'You have to attach an image to the message.');
			Axios.get<Buffer>(cmd.msg.attachments[0].url, { responseType: 'arraybuffer' }).then(response => {
				caller.bot.editSelf({ avatar: `data:image/${cmd.msg.attachments[0].filename.endsWith('png') ? 'png' : 'jpeg'};base64,${response.data.toString('base64')}` })
					.catch((err) => {
						caller.utils.discord.createMessage(cmd.channel.id, 'Avatar could not be edited.');
						console.log(err);
					});
			})
				.catch((err) => {
					caller.utils.discord.createMessage(cmd.channel.id, 'Avatar could not be edited.');
					console.log(err);
				});
			caller.utils.discord.createMessage(cmd.channel.id, 'Avatar edited.');
			break;

		case 'username': case 'name':
			caller.bot.editSelf({ username: cmd.args.slice(1).join(' ') }).catch(() => {
				return caller.utils.discord.createMessage(cmd.channel.id, 'Something went wrong.');
			} );
			caller.utils.discord.createMessage(cmd.channel.id, 'Nombre de usuario editado.');
			break;

		case 'prefix':
			if (cmd.args[1].length > 4)
				return caller.utils.discord.createMessage(cmd.channel.id, 'The prefix cannot be over 4 characters.');
			updated = await caller.db.updateConfig('prefix', cmd.args[1]);
			if (updated)
				return caller.utils.discord.createMessage(cmd.channel.id, 'Prefix editado.');
			if (!updated)
				return caller.utils.discord.createMessage(cmd.channel.id, 'The prefix could not be updated.');
			break;

		case 'category':
			// eslint-disable-next-line no-case-declarations
			const categoryChannel = caller.bot.getChannel(cmd.args[1]);
			if (!categoryChannel || categoryChannel.type !== 4 || categoryChannel.guild.id !== process.env.MAIN_GUILD_ID)
				return caller.utils.discord.createMessage(cmd.channel.id, 'You have to select a valid channel within the main server.');


			updated = await caller.db.updateConfig('mainCategoryID', cmd.args[1]);
			if (updated)
				return caller.utils.discord.createMessage(cmd.channel.id, 'The category where tickets are created has been changed.');
			if (!updated)
				return caller.utils.discord.createMessage(cmd.channel.id, 'The category could not be updated.');
			break;

		case 'logs':
			// eslint-disable-next-line no-case-declarations
			let logsChannel: AnyChannel;
			if (cmd.args[1] !== 'none') {
				logsChannel = cmd.msg.channelMentions[0] ? caller.bot.getChannel(cmd.msg.channelMentions[0]) || caller.bot.getChannel(cmd.args[1]) : caller.bot.getChannel(cmd.args[1]);
				if (!logsChannel || logsChannel.type !== 0)
					return caller.utils.discord.createMessage(cmd.channel.id, 'You have to select a valid channel.');
			}

			updated = await caller.db.updateConfig('logsChannelID', cmd.args[1] === 'none' ? '' : (logsChannel! as TextChannel).id, cmd.args[1] === 'none' ? 'UNSET' : 'SET');
			if (updated)
				return caller.utils.discord.createMessage(cmd.channel.id, 'The channel where logs are sent has been changed.');
			if (!updated)
				return caller.utils.discord.createMessage(cmd.channel.id, 'The logging channel could not be updated.');
			break;

		case 'status':
			updated = await caller.db.updateConfig('status', cmd.args.slice(1).join(' '));
			if (updated) {
				caller.bot.editStatus('online', {
					name: cmd.args.slice(1).join(' '),
					type: 0
				});
				return caller.utils.discord.createMessage(cmd.channel.id, 'The status has been changed.');
			}
			if (!updated)
				return caller.utils.discord.createMessage(cmd.channel.id, 'The status could not be updated.');
			break;

		case 'status_type':
			// eslint-disable-next-line no-case-declarations
			const type = STATUSES[cmd.args[1].toUpperCase() as keyof typeof STATUSES];
			if (!type || typeof type !== 'number')
				return caller.utils.discord.createMessage(cmd.channel.id, 'Please, provide a valid type: `playing`, `streaming`, `listening`, `watching` or `competing`.');

			if (type === 1 && (!cmd.args[2] || !cmd.args[2].match(/https:\/\/(www\.)?twitch\.tv\/.+|https:\/\/(www\.)?youtube\.com\/.+/g)))
				return caller.utils.discord.createMessage(cmd.channel.id, 'Please, provide a Twitch or YouTube URL.');

			updated = await caller.db.updateConfig('statusType', type);
			if (updated) {
				const config = await caller.db.getConfig() as IConfig;
				caller.bot.editStatus('online', {
					name: config.status,
					// @ts-ignore
					type: type,
					url: type === 1 ? cmd.args[2] : undefined
				});

				if (type === 1)
					caller.db.updateConfig('statusURL', cmd.args[2]);

				return caller.utils.discord.createMessage(cmd.channel.id, 'The status type has been changed.');
			}
			if (!updated)
				return caller.utils.discord.createMessage(cmd.channel.id, 'The status could not be updated.');
			break;

		case 'account_age':
			if (cmd.args[1] !== '0' && !cmd.args[1].match(/^[0-9]+(\.\d{1,2})?[m|h|d|w|y]$/))
				return caller.utils.discord.createMessage(cmd.channel.id, 'You have to select a valid format. For example, 1d = 1 day / 30m = 30 minutes. To disable it, just type `0`.\nValid letters: m / h / d / w / y');
			// eslint-disable-next-line no-case-declarations
			const accountAge = ms(cmd.args[1]);
			if ((!accountAge && cmd.args[1] !== '0') || accountAge > 315569520000)
				return caller.utils.discord.createMessage(cmd.channel.id, 'You have to select a valid format, lower than 10 years. For example, 1d = 1 day / 30m = 30 minutes. To disable it, just type `0`.');
			updated = await caller.db.updateConfig('accountAge', cmd.args[1] === '0' ? 0 : accountAge, cmd.args[1] === '0' ? 'UNSET' : 'SET');
			if (updated)
				return caller.utils.discord.createMessage(cmd.channel.id, 'The account age restriction has been changed.');
			if (!updated)
				return caller.utils.discord.createMessage(cmd.channel.id, 'The account age restriction could not be updated.');
			break;

		case 'guild_age':
			if (cmd.args[1] !== '0' && !cmd.args[1].match(/^[0-9]+(\.\d{1,2})?[m|h|d|w|y]$/))
				return caller.utils.discord.createMessage(cmd.channel.id, 'You have to select a valid format. For example, 1d = 1 day / 30m = 30 minutes. To disable it, just type `0`.\nValid letters: m / h / d / w / y');
			// eslint-disable-next-line no-case-declarations
			const guildAge = ms(cmd.args[1]);
			if ((!guildAge && cmd.args[1] !== '0') || guildAge > 315569520000)
				return caller.utils.discord.createMessage(cmd.channel.id, 'You have to select a valid format, lower than 10 years. For example, 1d = 1 day / 30m = 30 minutes. To disable it, just type `0`.');
			updated = await caller.db.updateConfig('guildAge', cmd.args[1] === '0' ? 0 : guildAge, cmd.args[1] === '0' ? 'UNSET' : 'SET');
			if (updated)
				return caller.utils.discord.createMessage(cmd.channel.id, 'The guild age restriction has been changed.');
			if (!updated)
				return caller.utils.discord.createMessage(cmd.channel.id, 'The guild age restriction could not be updated.');
			break;

		case 'guild_age_id':
			// eslint-disable-next-line no-case-declarations
			const guild = caller.bot.guilds.get(cmd.args[1]);
			if (!guild)
				return caller.utils.discord.createMessage(cmd.channel.id, 'I am not in that server, please select one in which i am in.');
			updated = await caller.db.updateConfig('guildAgeID', guild.id);
			if (updated)
				return caller.utils.discord.createMessage(cmd.channel.id, 'The guild age ID has been changed.');
			if (!updated)
				return caller.utils.discord.createMessage(cmd.channel.id, 'The guild age ID could not be updated.');
			break;

		case 'notification':
			updated = await caller.db.updateConfig('notificationRole', cmd.args[1] === 'none' ? '' : cmd.msg.roleMentions[0] || cmd.args[1], cmd.args[1] === 'none' ? 'UNSET' : 'SET');
			if (updated)
				return caller.utils.discord.createMessage(cmd.channel.id, 'The notification role has been updated.');
			if (!updated)
				return caller.utils.discord.createMessage(cmd.channel.id, 'The notification role could not be updated.');
			break;

		case 'embed_creation_title':
			updated = await caller.db.updateConfig('embeds.creation.title', cmd.args.slice(1).join(' '));
			if (updated)
				return caller.utils.discord.createMessage(cmd.channel.id, 'Creation embed title updated.');
			if (!updated)
				return caller.utils.discord.createMessage(cmd.channel.id, 'The creation embed title could not be updated.');
			break;

		case 'embed_creation_thumbnail':
			updated = await caller.db.updateConfig('embeds.creation.thumbnail', cmd.args[1] === 'none' ? '' : cmd.args[1], cmd.args[1] === 'none' ? 'UNSET' : 'SET');
			if (updated)
				return caller.utils.discord.createMessage(cmd.channel.id, 'Creation embed thumbnail updated.');
			if (!updated)
				return caller.utils.discord.createMessage(cmd.channel.id, 'The creation embed thumbnail could not be updated.');
			break;

		case 'embed_creation_description':
			updated = await caller.db.updateConfig('embeds.creation.description', cmd.args.slice(1).join(' '));
			if (updated)
				return caller.utils.discord.createMessage(cmd.channel.id, 'Creation embed description updated.');
			if (!updated)
				return caller.utils.discord.createMessage(cmd.channel.id, 'The creation embed description could not be updated.');
			break;

		case 'embed_creation_color':
			if (!(/^#[0-9A-F]{6}$/i.test(cmd.args[1])))
				return caller.utils.discord.createMessage(cmd.channel.id, 'You have to provide a valid hex color.');

			updated = await caller.db.updateConfig('embeds.creation.color', cmd.args[1]);
			if (updated)
				return caller.utils.discord.createMessage(cmd.channel.id, 'Creation embed color updated.');
			if (!updated)
				return caller.utils.discord.createMessage(cmd.channel.id, 'The creation embed color could not be updated.');
			break;

		case 'embed_creation_footer_text':
			updated = await caller.db.updateConfig('embeds.creation.footer', cmd.args.slice(1).join(' '));
			if (updated)
				return caller.utils.discord.createMessage(cmd.channel.id, 'Creation embed footer updated.');
			if (!updated)
				return caller.utils.discord.createMessage(cmd.channel.id, 'The creation embed footer could not be updated.');
			break;

		case 'embed_creation_footer_image':
			if (!(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\\+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w\-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[\w]*))?)/gm.test(cmd.args[1])) && cmd.args[1] !== 'none')
				return caller.utils.discord.createMessage(cmd.channel.id, 'You have to provide a valid link.');

			updated = await caller.db.updateConfig('embeds.creation.footerImageURL', cmd.args[1] === 'none' ? '' : cmd.args[1], cmd.args[1] === 'none' ? 'UNSET' : 'SET');
			if (updated)
				return caller.utils.discord.createMessage(cmd.channel.id, 'Creation embed footer image updated.');
			if (!updated)
				return caller.utils.discord.createMessage(cmd.channel.id, 'The creation embed footer image could not be updated.');
			break;

		case 'embed_contact_title':
			updated = await caller.db.updateConfig('embeds.contact.title', cmd.args.slice(1).join(' '));
			if (updated)
				return caller.utils.discord.createMessage(cmd.channel.id, 'Contact embed title updated.');
			if (!updated)
				return caller.utils.discord.createMessage(cmd.channel.id, 'The contact embed title could not be updated.');
			break;

		case 'embed_contact_thumbnail':
			updated = await caller.db.updateConfig('embeds.contact.thumbnail', cmd.args[1] === 'none' ? '' : cmd.args[1], cmd.args[1] === 'none' ? 'UNSET' : 'SET');
			if (updated)
				return caller.utils.discord.createMessage(cmd.channel.id, 'Contact embed thumbnail updated.');
			if (!updated)
				return caller.utils.discord.createMessage(cmd.channel.id, 'The contact embed thumbnail could not be updated.');
			break;

		case 'embed_contact_description':
			updated = await caller.db.updateConfig('embeds.contact.description', cmd.args.slice(1).join(' '));
			if (updated)
				return caller.utils.discord.createMessage(cmd.channel.id, 'Contact embed description updated.');
			if (!updated)
				return caller.utils.discord.createMessage(cmd.channel.id, 'The contact embed description could not be updated.');
			break;

		case 'embed_contact_color':
			if (!(/^#[0-9A-F]{6}$/i.test(cmd.args[1])))
				return caller.utils.discord.createMessage(cmd.channel.id, 'You have to provide a valid hex color.');

			updated = await caller.db.updateConfig('embeds.contact.color', cmd.args[1]);
			if (updated)
				return caller.utils.discord.createMessage(cmd.channel.id, 'Contact embed color updated.');
			if (!updated)
				return caller.utils.discord.createMessage(cmd.channel.id, 'The contact embed color could not be updated.');
			break;

		case 'embed_contact_footer_text':
			updated = await caller.db.updateConfig('embeds.contact.footer', cmd.args.slice(1).join(' '));
			if (updated)
				return caller.utils.discord.createMessage(cmd.channel.id, 'Contact embed footer updated.');
			if (!updated)
				return caller.utils.discord.createMessage(cmd.channel.id, 'The contact embed footer could not be updated.');
			break;

		case 'embed_contact_footer_image':
			if (!(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\\+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w\-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[\w]*))?)/gm.test(cmd.args[1])) && cmd.args[1] !== 'none')
				return caller.utils.discord.createMessage(cmd.channel.id, 'You have to provide a valid link.');

			updated = await caller.db.updateConfig('embeds.contact.footerImageURL', cmd.args[1] === 'none' ? '' : cmd.args[1], cmd.args[1] === 'none' ? 'UNSET' : 'SET');
			if (updated)
				return caller.utils.discord.createMessage(cmd.channel.id, 'Contact embed footer image updated.');
			if (!updated)
				return caller.utils.discord.createMessage(cmd.channel.id, 'The contact embed footer image could not be updated.');
			break;

		case 'embed_closure_title':
			updated = await caller.db.updateConfig('embeds.closure.title', cmd.args.slice(1).join(' '));
			if (updated)
				return caller.utils.discord.createMessage(cmd.channel.id, 'Closure embed title updated.');
			if (!updated)
				return caller.utils.discord.createMessage(cmd.channel.id, 'The closure embed title could not be updated.');
			break;

		case 'embed_closure_thumbnail':
			updated = await caller.db.updateConfig('embeds.closure.thumbnail', cmd.args[1] === 'none' ? '' : cmd.args[1], cmd.args[1] === 'none' ? 'UNSET' : 'SET');
			if (updated)
				return caller.utils.discord.createMessage(cmd.channel.id, 'Closure embed thumbnail updated.');
			if (!updated)
				return caller.utils.discord.createMessage(cmd.channel.id, 'The closure embed thumbnail could not be updated.');
			break;

		case 'embed_closure_description':
			updated = await caller.db.updateConfig('embeds.closure.description', cmd.args.slice(1).join(' '));
			if (updated)
				return caller.utils.discord.createMessage(cmd.channel.id, 'Closure embed description updated.');
			if (!updated)
				return caller.utils.discord.createMessage(cmd.channel.id, 'The closure embed description could not be updated.');
			break;

		case 'embed_closure_color':
			if (!(/^#[0-9A-F]{6}$/i.test(cmd.args[1])))
				return caller.utils.discord.createMessage(cmd.channel.id, 'You have to provide a valid hex color.');

			updated = await caller.db.updateConfig('embeds.closure.color', cmd.args[1]);
			if (updated)
				return caller.utils.discord.createMessage(cmd.channel.id, 'Closure embed color updated.');
			if (!updated)
				return caller.utils.discord.createMessage(cmd.channel.id, 'The closure embed color could not be updated.');
			break;

		case 'embed_closure_footer_text':
			updated = await caller.db.updateConfig('embeds.closure.footer', cmd.args.slice(1).join(' '));
			if (updated)
				return caller.utils.discord.createMessage(cmd.channel.id, 'Closure embed footer updated.');
			if (!updated)
				return caller.utils.discord.createMessage(cmd.channel.id, 'The closure embed footer could not be updated.');
			break;

		case 'embed_closure_footer_image':
			if (!(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\\+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w\-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[\w]*))?)/gm.test(cmd.args[1])) && cmd.args[1] !== 'none')
				return caller.utils.discord.createMessage(cmd.channel.id, 'You have to provide a valid link.');

			updated = await caller.db.updateConfig('embeds.closure.footerImageURL', cmd.args[1] === 'none' ? '' : cmd.args[1], cmd.args[1] === 'none' ? 'UNSET' : 'SET');
			if (updated)
				return caller.utils.discord.createMessage(cmd.channel.id, 'Closure embed footer image updated.');
			if (!updated)
				return caller.utils.discord.createMessage(cmd.channel.id, 'The closure embed footer image could not be updated.');
			break;

		case 'embed_staff_title':
			updated = await caller.db.updateConfig('embeds.staff.title', cmd.args.slice(1).join(' '));
			if (updated)
				return caller.utils.discord.createMessage(cmd.channel.id, 'Staff embed title updated.');
			if (!updated)
				return caller.utils.discord.createMessage(cmd.channel.id, 'The staff embed title could not be updated.');
			break;

		case 'embed_staff_color':
			if (!(/^#[0-9A-F]{6}$/i.test(cmd.args[1])))
				return caller.utils.discord.createMessage(cmd.channel.id, 'You have to provide a valid hex color.');

			updated = await caller.db.updateConfig('embeds.staff.color', cmd.args[1]);
			if (updated)
				return caller.utils.discord.createMessage(cmd.channel.id, 'Staff embed color updated.');
			if (!updated)
				return caller.utils.discord.createMessage(cmd.channel.id, 'The staff embed color could not be updated.');
			break;
		default:
			caller.utils.discord.createMessage(cmd.channel.id, { embed: invalidArgsEmbed.code });
			break;
	}
},
{
	aliases: ['s']
});