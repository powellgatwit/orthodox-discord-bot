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
			console.log(body.saints);
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
	const sunrise = hchc.getTime();
	const now = today.getTime();

	//console.log("current time: " + now + " sunrise is: " + sunrise);

	const diff = now - sunrise;

	if (diff < 0) {
		console.log("hours until sunrise: " + diff/3600000);
	} else {
		console.log("hours since sunrise: " + diff/3600000);
	}

	// both values are in ms, need to change to minute
	if (sunrise == now) {
		dailymessage();
	}

}

// execute() runs every 3 seconds, dailymessage() only runs at sunrise
setInterval(function() { execute(); }, 3000);
