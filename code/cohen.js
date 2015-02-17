
function showSlide(id) {
	$(".slide").hide();
	$("#"+id).show();
}

function launchFullScreen(element) {
  if(element.requestFullScreen) {
    element.requestFullScreen();
  } else if(element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if(element.webkitRequestFullScreen) {
    element.webkitRequestFullScreen();
  }
}

function exitFullscreen() {
  if(document.exitFullscreen) {
    document.exitFullscreen();
  } else if(document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if(document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  }
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

var imageSrcList = new Array();
var imageList = new Array();


function preload(images, onLoadedOne, onLoadedAll) {
  var remainingImages = images.slice();
  var finished = false;

  // set delayInterval to 800 for testing to see that everything actually loads
  // for real use, set to 0 
  var loadDelayInterval = 0;

  var worker = function() {
    if (remainingImages.length == 0) {
      if (!finished) {
        finished = true;
        setTimeout(onLoadedAll, loadDelayInterval);
      }
    } else {

      var src = remainingImages.shift(); 
      
      var image = new Image();
      image.onload = function() {
        onLoadedOne();
        setTimeout(worker, loadDelayInterval);
      };
      image.src = src;
      imageList.push(image);
    }
  };

  // load images 6 at a time
  var concurrent = 5;
  for(var i = 0; i < concurrent; i++) {
    setTimeout(worker, 20 - i);
  };
}

function preloadSetup() {
	for (i = 0; i < 300; i++) {
		imageSrcList.push("stim/Masks/ma" + (i+1) + ".jpg");
	}
	for (i = 0; i < 6; i++) {
		imageSrcList.push("stim/Exp1B_Targets/" + images[i] + ".jpg");
	}
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
	for (i = 0; i < length-digits-2; i++) {
		display[i] = randomElement(chars);
	}
	var used = []; // This code makes sure we never add the same digit more than once
	next = randomElement(numbers);
	while (used.indexOf(next) > -1) {
		next = randomElement(numbers);
	}
	used.push(next);
	display[i] = randomElement(numbers);
	fullMinusTwo = shuffleArray(display);
	fullMinusTwo.push(randomElement(chars)); fullMinusTwo.push(randomElement(chars));
	return fullMinusTwo
}

$(document).on('webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange', exitHandler);

function exitHandler()
{
	if (watchingFull) {
	    if (!document.webkitIsFullScreen && !document.mozFullScreen && !(document.msFullscreenElement))
	    {
	    	dead = true;
	        showSlide("full-exit");
	    }
	}	
}

function now() {
	return (new Date()).getTime();
}

/* global turk, store, location */

var fingerprint;

function setGeo(data) {
  fingerprint.ip = data.ip;
  fingerprint.geo = data; 
}

(function() {
  
  fingerprint = {
    browser: navigator.userAgent,
    screenWidth: screen.width,
    screenHeight: screen.height,
    colorDepth: screen.colorDepth,
    ip: "",
    geo: "",
    timezone: new Date().getTimezoneOffset(),
    plugins: Array.prototype.slice.call(navigator.plugins).map(function(x) { return {filename: x.filename, description: x.description}})
  }


  var isLocal = /file/.test(location.protocol);
  
  // inject a call to a json service that will give us geolocation information 
  var protocol = isLocal ? "http://" : "//";
  var src = protocol + "freegeoip.net/json/?callback=setGeo";

  var scriptEl = document.createElement('script');
  scriptEl.src = protocol + "freegeoip.net/json/?callback=setGeo";
  
  document.body.appendChild(scriptEl);

})()

if (fingerprint.screenHeight <= 700) {
	showSlide("screensmall");
} else {
	document.getElementById("character").style.fontSize = fingerprint.screenHeight + 'px';
	$("#dispImg").width(fingerprint.screenHeight);
	$("#dispImg").height(fingerprint.screenHeight);

	var numLoadedImages = 0;
	function onLoadedOne() {
	  numLoadedImages++;
	  $("#num-loaded").text(numLoadedImages); 
	}

	// define a function that will get called once
	// all images have been successfully loaded
	function onLoadedAll() {
	  showSlide("instructions");
	}

	var curTrial = 0;
	var postCatchOrder = randomElement([0,1])

	var numberOfDigits = [0,1,2,3,4],
	    trialLengths = [12,13,14,15,16,17],
	    catchTrials = [0,1],
	    images = ['a1','a2','a3','u1','u2','u3'],
	    maskOpts = Array.range(1,300,1);


	var iscatch, digits, trialLength, catchImg, trialDisplay, insts;

	watchingFull = true;

	showSlide("loading");
	preloadSetup();
	$("#num-total").text(imageSrcList.length);
	preload(imageSrcList,onLoadedOne,onLoadedAll);

	var allData = [];

	allData.push({ip_info:fingerprint});
	// allData.push({ip_info:fingerprint,workerId:turk.workerId,assignId:turk.assignmentId});
	allData.push({digitNums:numberOfDigits,trialLengths:trialLengths,catchOpts:catchTrials,imageOpts:images,maskOpts:maskOpts});

}

var experiment = {

	end: function() {
		watchingFull = false;
		exitFullscreen();
		showSlide("finished");
		setTimeout(function() { turk.submit(allData) }, 1500);
	},

	next: function() {
		curTrial = curTrial + 1;
		// Start off by setting up our trial structure:
		// 1,2,3,4 -> Regular trials
		// 5 -> Catch trial
		// 6,7,8,9,10 -> 
		if (curTrial < 5) {
			// regular trial
			iscatch = 0; insts = 0;
		} else if (curTrial == 5) {
			iscatch = 1; insts = 0;
			// catch trial
		} else if (curTrial < 11) {
			if (postCatchOrder == 1) {
				// background task first
				iscatch = 1; insts = 1;
			} else {
				// RSVP task first
				iscatch = 0; insts = 0;
			}
		} else if (curTrial < 16) {
			if (postCatchOrder == 1) {
				// now do the RSVP task
				iscatch = 0; insts = 0;
			} else {
				// now background task
				iscatch = 1; insts = 1;
			}

		} else {
			experiment.end();
			return;
		}
		// Setup ALL TRIAL infos:
		digits = randomElement(numberOfDigits);
		trialLength = randomElement(trialLengths);
		catchImg = randomElement(images);
		trialDisplay = buildTrialDisplay(digits,trialLength);
		showSlide("trial_instructions")
		if (insts==1) {
			$("#inst").hide();
			$("#inst_catch").show();
		} else {
			$("#inst").show();
			$("#inst_catch").hide();
		}
		if (curTrial==6 || curTrial==11) {
			$("#inst_warning").show();
		} else {
			$("#inst_warning").hide();
		}
	},

	ready: function() {
		trial.run();
	},

	setupNext: function() {
		if (curTrial > 0) {
			if (turk.previewMode) {
				experiment.end();
			} else {
				trial.pushData();
			}
		}
		showSlide("trial");
	},

	addFullscreenEvents_setupNext: function() {
		document.addEventListener('webkitfullscreenchange', exitHandler, false);
	    document.addEventListener('mozfullscreenchange', exitHandler, false);
	    document.addEventListener('fullscreenchange', exitHandler, false);
	    document.addEventListener('MSFullscreenChange', exitHandler, false);
	    experiment.setupNext();
	},

	run: function() {
		if (turk.previewMode) {
			experiment.setupNext();
		} else {
			launchFullScreen(document.documentElement);
			experiment.addFullscreenEvents_setupNext();
		}
	}
}

var frameID,
    started;

var drawTime;
var lastMask = 0;
var time;
var flippedChar = [];
var flippedMask = [];
var flippedTime = [];
var frameImg = $("#dispImg");
var dead = false;

var maskInt = 100;

function drawHelper() {
	time = now();
	flippedTime.push(time-started)
	if ((time-started) > (100*trialDisplay.length)) {
		window.cancelAnimationFrame(frameID);
		trial.resp();
		return
	}
	// figure out what character to show, 100 ms per character
	charPos = Math.floor((now() - started)/100);
	cChar = trialDisplay[charPos];
	$("#character").text(cChar);
	flippedChar.push(cChar);		
	// figure out whether the mask needs to change
	if (iscatch==1 && (time-started) > (100*trialDisplay.length)-(maskInt*2) && (time-started) < (100*trialDisplay.length)-maskInt) {
		imgFile = "stim/Exp1B_Targets/" + catchImg + ".jpg";
	} else if ((time - lastMask) > maskInt) {
		imgFile = "stim/Masks/ma" + randomElement(maskOpts) + ".jpg";
		lastMask = time;
	}
	flippedMask.push(imgFile);
	filename = imgFile + "?v=" + time;
	frameImg.attr("src",filename);
	// frameImg.update();
	// frameImg.src = imgFile;
	frameID = window.requestAnimationFrame(drawHelper);
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
	// digits = list of digits to display on masks
	// iscatch = whether or not to display a random image

	pushData: function() {
		var trialData = {};
		if (iscatch==1) {
			trialData['regRT'] = NaN;
			trialData['regresp'] = NaN;
			trialData['catchResp1'] = catchResp1[0];
			trialData['catchResp2'] = catchResp1[1];
			trialData['catchResp3'] = catchResp1[2];
			trialData['catchResp4'] = catchResp1[3];
			trialData['catchResp5'] = catchResp1[4];
			trialData['catchImageResp'] = catchResp2;
			trialData['catchRT1'] = catch1RT;
			trialData['catchRT2'] = catch2RT;
			trialData['catchRT3'] = catch3RT;
			trialData['catchRT4'] = catch4RT;
			trialData['catchRT5'] = catch5RT;
			trialData['catchRT6'] = catch6RT;
		} else {
			trialData['regRT'] = regularRT;
			trialData['regResp'] = regResp;
			trialData['catchResp1'] = NaN;
			trialData['catchResp2'] = NaN;
			trialData['catchResp3'] = NaN;
			trialData['catchResp4'] = NaN;
			trialData['catchResp5'] = NaN;
			trialData['catchImageResp'] = NaN;
			trialData['catchRT1'] = NaN;
			trialData['catchRT2'] = NaN;
			trialData['catchRT3'] = NaN;
			trialData['catchRT4'] = NaN
			trialData['catchRT5'] = NaN;
			trialData['catchRT6'] = NaN;
		}
		// Always add thesee
		trialData['catchTrial'] = iscatch;
		trialData['charStream'] = trialDisplay; //WARNING: THIS IS A LIST
		trialData['catchImage'] = catchImg;
		trialData['digits'] = digits;
		trialData['streamLength'] = trialLength;
		trialData['trialNum'] = curTrial;
		// Flip data
		trialData['flipTime'] = flippedTime; // LIST
		trialData['flipChar'] = flippedChar; // LIST
		trialData['flipMask'] = flippedMask; // LIST
		//Add to experiment.data
		allData.push(trialData);
		// Now we reset all the variables
		if (curTrial > 4) {
			respQue = 4;
		} else {
			respQue = 1;
		}
		regularRT = 0;
		catch1RT = 0; catch2RT = 0; catch3RT = 0; catch4RT = 0;
		catch5RT = 0; catch6RT = 0;
		regResp = 0;
		catchResp1 = [];
		catchResp2 = '';
	},

	draw: function(started) {
		 frameID = window.requestAnimationFrame(drawHelper);
	},

	run: function() {
		if (dead) {
	        showSlide("full-exit");
		} else {
			showSlide("frame")
			$("#character").text("");
			frameImg.attr("src","stim/Masks/start.jpg");
			setTimeout(trial.run2,2000);
		}
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
					$(".resp-text").show();
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
		catchResp2 = 'a1';
		experiment.setupNext();
	},
	a2: function() {
		catch6RT = now() - catch6RT;
		catchResp2 = 'a2';
		experiment.setupNext();
	},
	a3: function() {
		catch6RT = now() - catch6RT;
		catchResp2 = 'a3';
		experiment.setupNext();
	},
	u1: function() {
		catch6RT = now() - catch6RT;
		catchResp2 = 'u1';
		experiment.setupNext();
	},
	u2: function() {
		catch6RT = now() - catch6RT;
		catchResp2 = 'u2';
		experiment.setupNext();
	},
	u3: function() {
		catch6RT = now() - catch6RT;
		catchResp2 = 'u3';
		experiment.setupNext();
	},

	resp0: function() {
		regResp = 0;
		regularRT = now() - regularRT;
		experiment.setupNext();
	},
	resp1: function() {
		regResp = 1;
		regularRT = now() - regularRT;
		experiment.setupNext();
	},
	resp2: function() {
		regResp = 2;
		regularRT = now() - regularRT;
		experiment.setupNext();
	},
	resp3: function() {
		regResp = 3;
		regularRT = now() - regularRT;
		experiment.setupNext();
	},
	resp4: function() {
		regResp = 4;
		regularRT = now() - regularRT;
		experiment.setupNext();
	}
}
