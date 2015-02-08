// var $ = document.querySelector.bind(document);

function showSlide(id) {
	$(".slide").hide();
	$("#"+id).show();
}

/**
 * http://stackoverflow.com/questions/3895478/does-javascript-have-a-method-like-range-to-generate-an-array-based-on-suppl
*/
Array.range= function(a, b, step){
    var A= [];
    if(typeof a== 'number'){
        A[0]= a;
        step= step || 1;
        while(a+step<= b){
            A[A.length]= a+= step;
        }
    }
    else{
        var s= 'abcdefghijklmnopqrstuvwxyz';
        if(a=== a.toUpperCase()){
            b=b.toUpperCase();
            s= s.toUpperCase();
        }
        s= s.substring(s.indexOf(a), s.indexOf(b)+ 1);
        A= s.split('');        
    }
    return A;
}

/**
 * Randomize array element order in-place.
 * Using Fisher-Yates shuffle algorithm.
 * http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
 */
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

function randomInteger(n) {
	return Math.floor(Math.random()*n);
}

function randomElement(array) {
	return array[randomInteger(array.length)];
}

function buildTrialDisplay(digits,length) {
	var chars = ['A','B','C','D','G','H','K','M','O','P','Q','R','T','U','V','W','X','Y'],
		numbers = ['1','2','4','5'];

	var display = [];
	for (i = 0; i < length-digits; i++) {
		display[i] = randomElement(chars);
	}
	for (i=length-digits; i < length; i++) {
		display[i] = randomElement(numbers);
	}
	return shuffleArray(display);
}

var numberOfDigits = [0,1,2,3,4],
    trialLengths = [12,13,14,15,16,17],
    myDigits = randomElement(numberOfDigits),
    myTrialLength = randomElement(trialLengths);

showSlide("instructions");

// rAF
window.requestAnimationFrame = function() {
	return window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		function(f) {
			window.setTimeout(f,1e3/60);
		}
}();


var maskFPS = 15;
var charFPS = 10;
var now;
var thenMask = Date.now();
var thenChar = Date.now();
var maskInterval = 1000/maskFPS;
var charInterval = 1000/charFPS;
var deltaChar;
var deltaMask;

// We're going to check at each "draw" whether we should change the character
// or the mask. If we do, we change it, if not we keep going.
 
function draw(charList) {
	
	requestAnimationFrame(draw);
	
	now = Date.now();
	delta = now - then;
	//console.log(delta);
	
	if (delta > maskInterval) {
		// update time stuffs
		
		// Just `then = now` is not enough.
		// Lets say we set fps at 10 which means
		// each frame must take 100ms
		// Now frame executes in 16ms (60fps) so
		// the loop iterates 7 times (16*7 = 112ms) until
		// delta > interval === true
		// Eventually this lowers down the FPS as
		// 112*10 = 1120ms (NOT 1000ms).
		// So we have to get rid of that extra 12ms
		// by subtracting delta (112) % interval (100).
		// Hope that makes sense.
		
		then = now - (delta % interval);
		
	}
	if (delta > 1) {

	}
}
 
draw();


var experiment = {
	trials:myTrialOrder,
	keyBindings: myKeyBindings,
	data: [],

	end: function() {
		showSlide("finished");
		setTimeout(function() {turk.submit(experiement)},1500);
	},

	next: function() {
		var n = experiment.trials.shift();

		if (typeof n == "undefined") {
			return experiment.end();
		}

		var realParity = (n % 2 == 0) ? "even" : "odd";

		showSlide("frame");

		$("#number").html(n);

		var startTime = (new Date()).getTime();

		var keyPressHandler = function(event) {
			var keyCode = event.which;

			if (keyCode != 81 && keyCode != 80) {
				$(document).one("keydown",keyPressHandler);
			} else {
				 var endTime = (new Date()).getTime(),
            key = (keyCode == 80) ? "p" : "q",
            userParity = experiment.keyBindings[key],
            data = {
              stimulus: n,
              accuracy: realParity == userParity ? 1 : 0,
              rt: endTime - startTime
            };
            experiment.data.push(data);
            $("#number").html("");
            setTimeout(experiment.next,500);
			}
		};

		$(document).one("keydown",keyPressHandler);
	}
}