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

	https.get('https://orthocal.info/api/oca/', (result) => {
		let data = "";
		console.log('statusCode:', result.statusCode);

		result.on('data', (d) => {
			data = data + d.toString();
		});
		result.on('end', () => {
			const body = JSON.parse(data);

			/* 	Daily Message		*/

			const channel = client.channels.cache.get('850364310319661109');
			channel.send("> ```Good morning :)\n\nToday is the" + body.titles + ".```")
			.then(message => console.log(`Sent message: ${message.content}`))
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

// execute() runs every x seconds, dailymessage() only runs at sunrise
const x = 20000
setInterval(function() { execute(); }, x);
