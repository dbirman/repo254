function showSlide(id) {
  $(".slide").hide()
  $("#" + id).show()
}

function preload(images, onLoadedOne, onLoadedAll) {
  var remainingImages = images.slice();
  var finished = false;

  // set delayInterval to 800 for testing to see that everything actually loads
  // for real use, set to 0 
  var loadDelayInterval = 1500;

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
    }
  };

  // load images 6 at a time
  var concurrent = 5;
  for(var i = 0; i < concurrent; i++) {
    setTimeout(worker, 20 - i);
  };
}


// show preload slide to start
showSlide("preload");

// define a function that will get called every time
// one image is successfully loaded
var numLoadedImages = 0;
function onLoadedOne() {
  numLoadedImages++;
  $("#num-loaded").text(numLoadedImages); 
}

// define a function that will get called once
// all images have been successfully loaded
function onLoadedAll() {
  showSlide("experiment-instructions");
}

// declare the set of images we'd like to load
var images = ["ball 1.png", "ball 2.png", "ball 3.png", "ball 4.png", "ball 5.png", "ball 6.png", "ball 7.png", "ball 8.png", "ball 9.png", "ball 10.png", "ball 11.png", "ball 12.png", "ball 13.png"]

$("#num-total").text(images.length);

// start preloading images:
// call our preload function with the array of images we want
// and the onLoadedOne and onLoadedAll functions
preload(images,
        onLoadedOne,
        onLoadedAll);

console.log('here');
