// Require the necessary discord.js classes
const { Client, Intents } = require('discord.js');
const { token } = require('./auth.json');
const { getSunrise } = require('sunrise-sunset-js');
const https = require('https');

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready!');
});

// Login to Discord with your client's token
client.login(token);


function dailymessage(channelInstance) {

	let api = 'https://orthocal.info/api/oca/';
	let george = 'https://orthocal.info/api/oca/2022/4/23/';

	https.get(api, (result) => {
		let data = "";
		//to test connection with OrthoCal API:
		//console.log('statusCode:', result.statusCode);

		result.on('data', (d) => {
			data = data + d.toString();
		});
		result.on('end', () => {
			const body = JSON.parse(data);

			// creates a new string 'msg' that is expanded with each attribute of the daily calendar

			//title, feasts
			var msg = new String(
				"Good morning! Today is the " + body.titles + ".\n"
			);

			if (body.feasts != null) {
				msg = msg.concat(
					"It is the feast of the " + body.feasts + ".\n"
				);
			}

			//saints
			if (body.saints != null) {
				msg = msg.concat(
					"On this day we commemorate (the) " + body.saints + ".\n"
				);
			}

			//fasting
			if (body.fast_level > 0) {
				msg = msg.concat("> Today is a fasting day.\n");

				//...and name of fast, if there is one
				if (body.fast_level > 1) {
					msg = msg.concat(
						"> We are in the " + body.fast_level_desc + ".\n"
					);
				}

				//fast exception?
				if (body.fast_exception > 0) {
					msg = msg.concat(
						"> *Today's note: " + body.fast_exception_desc + ".*"
					);
				}
			} //okay, no more fasting stuff

			/* !!!!!!!!! */
			channelInstance.send(msg);
			//console.log("Sent to " + channelInstance.name + "?");
			//.then(message => console.log(`${message.content}`))
			//.catch(console.error);

		})
	}).on('error', (e) => {
		console.error(e);
	});

}

function execute() {

	//get full current timestamp
	const today = new Date();
	//get timestamp for sunrise at hchc
	const hchc = getSunrise(42.31658174845979, -71.1277771264774, today);

	//get the exact hour:minute for both
	const sunrise = {
		"h": hchc.getHours(),
		"m": hchc.getMinutes()
	}
	const now = {
		"h": today.getHours(),
		"m": today.getMinutes()
	}

	/* AT SUNRISE: */
	if (sunrise.h == now.h && sunrise.m == now.m) {

		const guildsCache = client.guilds.cache;
		// Returns an Iterable collection of servers the bot is a part of
		// each item is an object of type GUILD
		// (https://discord.js.org/#/docs/discord.js/stable/class/Guild)

		let success = 0;
		let remind = 0;
		let fail = 0;
		//code used from: https://stackoverflow.com/questions/63261585/how-to-send-a-message-to-all-servers
		guildsCache.each(guild => {
			try {
				//for either the Calendar or General channel
				const channel = guild.channels.cache.find(channel => channel.name === 'calendar') || guild.channels.cache.find(channel => channel.name === 'general');
				//for the first channel
				const firstChannel = guild.channels.cache.find(firstChannel => firstChannel.isText());
				if (channel) {
					//console.log("Sent a message to the calendar channel in " + guild.name);
					dailymessage(channel);
					success++;
				} else {
					//console.log('The server ' + guild.name + ' has no channels named calendar.');
					//dailymessage(firstChannel);
					firstChannel.send("It is recommended that you create a channel called #calendar (or #general) for this bot to send messages in. Thanks :)");
					//console.log("In the " + guild.name + " server, message was sent to " + firstChannel.name);
					remind++;
				}
			} catch (err) {
				//console.log('Could not send message to ' + guild.name + '.');
				fail++;
			}
		});

		//print status at sunrise
		console.log(today.toDateString() + ": " + success + " sent, " + remind + " reminded, " + fail + " failed.");

	}
}

	//interval in seconds the program should check for sunrise
	const interval = 60
	setInterval(function() { execute(); }, (interval*1000));

  /*
	*
	* Thank you to Brian Glass at https://orthocal.info/api
	* for providing this Orthodox Calendar API!
	*
	*/
