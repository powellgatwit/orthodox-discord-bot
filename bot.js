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


function dailymessage() {

	let api = 'https://orthocal.info/api/oca/';
	let george = 'https://orthocal.info/api/oca/2022/4/23/';

	https.get(api, (result) => {
		let data = "";
		console.log('statusCode:', result.statusCode);

		result.on('data', (d) => {
			data = data + d.toString();
		});
		result.on('end', () => {
			const body = JSON.parse(data);

			/* 	Title, feasts	*/

			var msg = new String(
				"Good morning! Today is the " + body.titles + ".\n"
			);

			if (body.feasts != null) {

				msg = msg.concat(
					"It is the feast of the " + body.feasts + ".\n"
				);
			}

			/*		Saints	 */

			if (body.saints != null) {
				msg = msg.concat(
					"On this day we commemorate (the) " + body.saints + ".\n"
				);
			}

			/* 	Fasting	*/

			if (body.fast_level > 0) {
				msg = msg.concat("> Today is a fasting day.\n");

				//name of fast, if there is one
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
			}

			//const channel = client.channels.cache.get('850364310319661109');

			const channel = message.guild.channels.cache.find(ch => ch.name === "calendar");

			channel.send(msg)
			.then(message => console.log(`${message.content}`))
			.catch(console.error);

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

	//console.log("current time: " + now.h + ":" + now.m + " sunrise is: " + sunrise.h + ":" + sunrise.m);

	if (sunrise.h == now.h && sunrise.m == now.m) {
		dailymessage();
	}

}

const x = 59000; //check for sunrise every 59 seconds
setInterval(function() { execute(); }, x);
