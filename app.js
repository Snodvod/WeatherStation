var app = require('http').createServer(handler);
var io = require('socket.io')(app);
var five = require('johnny-five');
// var boards = new five.Boards(['A', 'B']);

// Arduino uno = clock
// Pins 2, 3, 4 need to be PWM
var board = new five.Board();

app.listen(3500);
board.on("ready", function() {
	var clockH = new five.Stepper({
		type: five.Stepper.TYPE.FOUR_WIRE,
    	pins: [12, 11, 10, 9],
    	stepsPerRev: 64 // If stepsPerRev is set to 64, a full rotation is +-2000 steps
  	});

  	clockH.cw().step(2048, function() {
  		console.log('just spinning');
  	})

  	io.on('connection', function(socket) {
		console.log("Companion connection succesful");
		//Global 'change' event is emmitted when the user chooses a new city
		socket.on('change', function(data) {
			var date = new Date(data.dt*1000);
			var hours = date.getHours();
			console.log(data);
			switch (data.weather[0].main) {
				case 'Rain':
					clockH.cw().step(300, function() {
						console.log('starts Rain spinnin');
					});
				case 'Clouds':
					clockH.ccw().step(300, function() {
						console.log('starts Clouds spinnin');
					});
				break;
			}
		});
	});
});

function handler(req, res) {
	res.writeHead(200);
	res.end('Working');
	console.log('Server has started');
}


console.log('Server is running on localhost:3500');