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

function now() {
	return (new Date()).getTime();
}

// (function() {
//     var lastTime = 0;
//     var vendors = ['ms', 'moz', 'webkit', 'o'];
//     for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
//         requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
//         cancelRAF = window[vendors[x]+'CancelAnimationFrame']
//                                    || window[vendors[x]+'CancelRequestAnimationFrame'];
//     }
 
//     if (!requestAnimationFrame)
//         requestAnimationFrame = function(callback, element) {
//             var currTime = new Date().getTime();
//             var timeToCall = Math.max(0, 16 - (currTime - lastTime));
//             var id = window.setTimeout(function() { callback(currTime + timeToCall); },
//               timeToCall);
//             lastTime = currTime + timeToCall;
//             return id;
//         };
 
//     if (!cancelRAF)
//         cancelRAF = function(id) {
//             clearTimeout(id);
//         };
// }());

// // rAF
var requestAnimationFrame = window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		window.oRequestAnimationFrame;

var cancelRAF = window.cancelAnimationFrame ||
                window.mozCancelAnimationFrame ||
                window.webkitCancelAnimationFrame ||
                window.msCancelAnimationFrame;

showSlide("instructions");

// Experiment organization:

// experiment.run():
//	 starts a set of trials, sends data to turk, ends experiment.
// trial.run():
//	 displays a single trial, calls draw() repeatedly with
//   parameters and then calls resp() or respC() to get response.

var experiment = {
	data:[],

	end: function() {
		showSlide("finished");
	},

	run: function() {
		trial.run();
	}
}

var numberOfDigits = [0,1,2,3,4],
    trialLengths = [12,13,14,15,16,17],
    catchTrials = [0,1],
    images = ['a1','a2','a3','u1','u2','u3'],
    digits = randomElement(numberOfDigits),
    trialLength = randomElement(trialLengths),
    iscatch = randomElement(catchTrials),
    catchImg = randomElement(images),
    maskOpts = Array.range(1,300,1),
    frameID,
    started;

var trialDisplay = buildTrialDisplay(digits,trialLength);

var drawTime;
var lastMask = 0;
var time;
var flippedChar = [];
var flippedMask = [];
var flippedTime = [];
var frameImg = $("#dispImg");

function drawHelper() {
	time = now();
	flippedTime.push(time-started)
	if ((time-started) > (100*trial.dispDigits.length)) {
		cancelRAF(frameID);
		trial.resp();
		return
	}
	// figure out what character to show, 100 ms per character
	charPos = Math.floor((now() - started)/100);
	cChar = trial.dispDigits[charPos];
	$("#character").text(cChar);
	flippedChar.push(cChar);		
	// figure out whether the mask needs to change
	if (iscatch==1 && (time-started) > (100*trial.dispDigits.length)-133 && (time-started) < (100*trial.dispDigits.length)-66) {
		imgFile = "stim/Exp1B_Targets/" + catchImg + ".jpg";
	} else if ((time - lastMask) > 67) {
		imgFile = "stim/Masks/ma" + randomElement(maskOpts) + ".jpg";
		lastMask = time;
	}
	flippedMask.push(imgFile);
	frameImg.attr("src",imgFile);
	// frameImg.src = imgFile;
	frameID = requestAnimationFrame(drawHelper);
}

var respQue = 1;
var regularRT;
var catch1RT,
	catch2RT,
	catch3RT,
	catch4RT,
	catch5RT,
	catch6RT;
var regResp;
var catchResp1 = [];
var catchResp2;


var trial  = {
	dispDigits: trialDisplay,
	// digits = list of digits to display on masks
	// iscatch = whether or not to display a random image

	draw: function(started) {
		 frameID = requestAnimationFrame(drawHelper);
	},

	run: function() {
		showSlide("frame")
		$("#character").text("!");
		setTimeout(trial.run2,1000);
	},

	run2: function() {
		showSlide("frame")
		started = now();
		trial.draw();
	},

	resp: function() {
		if (iscatch==1) {
			showSlide("response_catch");
			$(".resp-text").hide();
			switch (respQue) {
				case 1:
					catch1RT = now();
					$("#1").show();
					break;
				case 2:
					catch2RT = now();
					$("#2").show();
					break;
				case 3:
					catch3RT = now();
					$("#3").show();
					break;
				case 4:
					catch4RT = now();
					$("#4").show();
					break;
				case 5:
					catch5RT = now();
					$("#5").show();
					break;
				case 6:
					catch6RT = now();
					showSlide("response_catch2");
					break;
			}
		} else {
			regularRT = now();
			showSlide("response_regular")
		}
	},

	respYes: function() {
		trial.eitherResp();
		catchResp1.push("Y")
	},

	respNo: function() {
		trial.eitherResp();
		catchResp1.push("N")
	},

	eitherResp: function() {
		switch (respQue) {
			case 1:
				catch1RT = now() - catch1RT;
			case 2:
				catch2RT = now() - catch2RT;
			case 3:
				catch3RT = now() - catch3RT;
			case 4:
				catch4RT = now() - catch4RT;
			case 5:
				catch5RT = now() - catch5RT;
		}
		respQue = respQue +1;
		trial.resp();
	},

	a1: function() {
		catch6RT = now() - catch6RT;
		experiment.end();
		catchResp2 = 'a1';
	},
	a2: function() {
		catch6RT = now() - catch6RT;
		experiment.end();
		catchResp2 = 'a2';
	},
	a3: function() {
		catch6RT = now() - catch6RT;
		experiment.end();
		catchResp2 = 'a3';
	},
	u1: function() {
		catch6RT = now() - catch6RT;
		experiment.end();
		catchResp2 = 'u1';
	},
	u2: function() {
		catch6RT = now() - catch6RT;
		experiment.end();
		catchResp2 = 'u2';
	},
	u3: function() {
		catch6RT = now() - catch6RT;
		experiment.end();
		catchResp2 = 'u3';
	},

	resp0: function() {
		regResp = 0;
		regularRT = now() - regularRT;
		experiment.end();
	},
	resp1: function() {
		regResp = 1;
		regularRT = now() - regularRT;
		experiment.end();
	},
	resp2: function() {
		regResp = 2;
		regularRT = now() - regularRT;
		experiment.end();
	},
	resp3: function() {
		regResp = 3;
		regularRT = now() - regularRT;
		experiment.end();
	},
	resp4: function() {
		regResp = 4;
		regularRT = now() - regularRT;
		experiment.end();
	}
}
