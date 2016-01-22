var app = require('http').createServer(handler);
var io = require('socket.io')(app);
var five = require('johnny-five');
var stepperctl = require('./steppercontrol');
var ports= [
	{id: 'UNO', port:"COM3"},
	{id: 'MEGA', port:"COM5"},
];
var posClockH = 0,
	posClockM = 0,
	posTemp1 = 0,
	posTemp2 = 0,
	posWeather = 0,
	posWind = 0;

var posSteppers = [posClockH, posClockM, posTemp1, posTemp2, posWeather, posWind];

app.listen(3500);

new five.Boards(ports).on("ready", function () {
	console.log('Boards ready');
	// Arduino UNO
	var clockH = new five.Stepper({
		type: five.Stepper.TYPE.FOUR_WIRE,
		board: this.byId('UNO'),
    	pins: [12, 11, 10, 9],
    	stepsPerRev: 64 
  	});
  	var clockM = new five.Stepper({
		type: five.Stepper.TYPE.FOUR_WIRE,
		board: this.byId('UNO'),
    	pins: [7, 6, 5, 3],
    	stepsPerRev: 64 
  	});
  	//Arduino MEGA
  	var temp1 = new five.Stepper({
		type: five.Stepper.TYPE.FOUR_WIRE,
		board: this.byId('MEGA'),
	    pins: [22, 13, 12, 11],
	    stepsPerRev: 64 
  	});
  	var temp2 = new five.Stepper ({
  		type: five.Stepper.TYPE.FOUR_WIRE,
		board: this.byId('MEGA'),
	    pins: [24, 10, 9, 8],
	    stepsPerRev: 64 
	});
	var weather = new five.Stepper ({
  		type: five.Stepper.TYPE.FOUR_WIRE,
		board: this.byId('MEGA'),
	    pins: [26, 7, 6, 5],
	    stepsPerRev: 64 
	});
	var wind = new five.Stepper ({
  		type: five.Stepper.TYPE.FOUR_WIRE,
		board: this.byId('MEGA'),
	    pins: [48, 4, 3, 2],
	    stepsPerRev: 64 
	});	



	
	function stap(stepper, posArray, nextPos) {
		console.log(posArray[stepper.id]);
		var steps = Math.floor(stepperctl.calcSteps(posArray[stepper.id], nextPos));
		if(steps < 0) {
			console.log('Counterclockwise');
			stepper.ccw().step(Math.abs(steps), function() {
				console.log('stepped ccw');
			});
		} else {
			stepper.cw().step(steps, function() {
				console.log('stepped cw');
			});
		}

		posArray[stepper.id] = nextPos;




	}

  	io.on('connection', function(socket) {
		console.log("Companion connection succesful");
		//Global 'change' event is emmitted when the user chooses a new city
		socket.on('weather', function(data) {
			console.log(data);
			
			switch (data.weather[0].main) {
				case 'Rain':
					stap(weather, posSteppers, 72);
				break;
				case 'Clouds':
					stap(weather, posSteppers, 144);
				break;
				case 'Clear':
					stap(weather, posSteppers, 216);
				break;
				case 'Mist':
					stap(weather, posSteppers, 288);
				break;
				case: 'Storm':
					stap(weather, posSteppers, 360);
				break;
			}
			stap(wind, posSteppers, data.wind.deg);
			var temp = data.temp;
			var tens = temp.substr(0,1);
			var ones = temp.substr(1,2);
			stap(temp1, posSteppers, tens*36);
			stap(temp2, posSteppers, ones*36);
		});

		socket.on('clock', function(data) {
			var localtime = new Date(data);

			var hours = localtime.getHours()-1;
			if(hours > 12) {hours = hours-12;}
			var minutes = localtime.getMinutes();
			stap(clockH, posSteppers, (hours)*30);
			stap(clockM, posSteppers, minutes*6);
		});


		socket.on('quit', function() {
			for(var index in steppers) {
				stap(steppers[index][0], steppers[index][1], 0);
			}
			app.close();
		})
	});
});

function handler(req, res) {
	res.writeHead(200);
	res.end('Working');
	console.log('Server has started');
}


console.log('Server is running on localhost:3500');