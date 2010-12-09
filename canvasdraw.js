/*
  Copyright (c) 2010 Alex Gibson, http://miniapps.co.uk/
  Released under MIT license, http://miniapps.co.uk/license/
  Version 2.0 - Last updated: 6 July 2010 
*/

var canvas, //canvas element.
  ctx, //drawing context.
  startX = 0, //starting X coordinate.
  startY = 0, //starting Y coordinate.
  started = false, //has move event started.
  pickerEnabled = false, //color picker toggle.
  strokePickerEnabled = false, //flag for stroke picker.
  fillPickerEnabled = false, //flag for background picker
  imgPicker, //color picker image.
  originalImageData, //data for original image prior to color picker being visible.
  imgd, //image data object.
  data = [], //array of image pixel data.
  toolbarHeight = 0, //toolbar offset height (pixels).
  penSize = 1, //pen width (pixels).
  roundedVel = 1,
  timerStart = 0,
  r = 255, //red stroke
  g = 0, //green stroke
  b = 0, //blue stroke
  rB = 255, //red fill
  gB = 255, //green fill
  bB = 255, //blue fill
  drawAction = false,
  cmdDown = false;
  
function init() {
  ctx = canvas.getContext('2d');
  
  //set height and width to size of device window
  canvas.setAttribute("height", (window.innerHeight - toolbarHeight) + "px");
  canvas.setAttribute("width", window.innerWidth + "px");
      
  //add touch and mouse event listeners
  canvas.addEventListener('mousedown', onMouseDown, false);
  
  //event listener for application cache updates
  window.applicationCache.addEventListener('onupdateready', updateCache, false);
  window.addEventListener('keyup', onKeyUp, false);
  window.addEventListener('keydown', onKeyDown, false);
  drawAction = moveDrawLine;
}

function onKeyUp(e) {
  //r
  if (e.keyCode == 82) { drawAction = moveDrawRect} 
  //l
  if (e.keyCode == 76) { drawAction = moveDrawLine} 
  //c
  if (e.keyCode == 67) { drawAction = moveDrawOval}
  
  //Clear command
  if (e.keyCode == 91 || e.keyCode == 93) {cmdDown = false};
};
function onKeyDown(e) {
  if (e.keyCode == 90 && cmdDown) { undoCanvas(); };

  if (e.keyCode == 91 || e.keyCode == 93) {cmdDown = true};
}

function onMouseDown(e) {
    
  startDraw(e.clientX, e.clientY);        
  canvas.addEventListener('mousemove', onMouseMove, false);
  canvas.addEventListener('mouseup', onMouseUp, false);
        
}
  
function onMouseMove(e) {
  
  drawAction(e.clientX, e.clientY, e.timeStamp);
}
  
function onMouseUp(e) {
    
  endDraw(e.clientX, e.clientY);
  canvas.removeEventListener('mousemove', onMouseMove, false);
  canvas.removeEventListener('mouseup', onMouseUp, false);    
}

function startDraw(x,y) {

  //set defaults
  started = false;
  
  //get start position
  startX = x;
  startY = y - toolbarHeight;
            
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = penSize; 
  ctx.globalCompositeOperation = 'source-over'; 
  ctx.strokeStyle = '#f00';
  ctx.lineWidth = 1;
  //save canvas image data for future undo event
  originalImageData = ctx.getImageData(0, 0, window.innerWidth, (window.innerHeight - toolbarHeight));
        
}

function moveDrawOval(x,y,t) {
  ctx.putImageData(originalImageData, 0, 0);
  var centerX = (x+startX)/2;
  var centerY = (y+startY)/2;
  var height = y-startY;
  var width = x-startX;

  ctx.beginPath();
	ctx.moveTo(centerX,centerY - height/2);
	// draw left side of oval
	ctx.bezierCurveTo(centerX-width/2,centerY-height/2,
		centerX-width/2,centerY+height/2,
		centerX,centerY+height/2);
 
	// draw right side of oval
	ctx.bezierCurveTo(centerX+width/2,centerY+height/2,
		centerX+width/2,centerY-height/2,
		centerX,centerY-height/2);
  ctx.stroke();
  ctx.closePath();
};

function moveDrawRect(x,y,t) {
  ctx.putImageData(originalImageData, 0, 0);
  ctx.strokeRect(startX,startY,x-startX,y-startY);
};
function moveDrawLine(x,y,t) {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(x, y - toolbarHeight);
    ctx.stroke();
    ctx.closePath();

    startX = x;
    startY = y - toolbarHeight;
}

function endDraw(x,y) {
  if(pickerEnabled) {
    //return to our canvas drawing and hide the colour picker
    ctx.putImageData(originalImageData, 0, 0);      
    strokePickerEnabled = false;
    fillPickerEnabled = false;
    pickerEnabled = false;
  }   
}

    
function clearCanvas() {
    
  if (!confirm("Clear the canvas?")) {
    return;
  }
  pickerEnabled = false;
  canvas.setAttribute("height", (window.innerHeight - toolbarHeight) + "px");
  canvas.setAttribute("width", window.innerWidth + "px");
  canvas.style.backgroundColor = 'rgb(' + rB + ', ' + gB + ', ' + bB + ')';
  originalImageData = ctx.getImageData(0, 0, window.innerWidth, (window.innerHeight - toolbarHeight));
  ctx.putImageData(originalImageData, 0, 0);
}
    
function saveCanvas() {
    
  //save our canvas to a data URL and open in a new browser window
  if (!confirm("This will save your drawing as an image and open it in a new window (Currently works in browser mode only).")) {
    return;
  }
  //NOTE: this currently only works in browser mode, not standalone.
  var strDataURI = canvas.toDataURL("image/jpeg");
  window.open(strDataURI);
}

function undoCanvas() {
  ctx.putImageData(originalImageData, 0, 0);
}

function updateCache() {
  window.applicationCache.swapCache();
}

function loaded() {
  //prevent default scrolling on document window
  document.addEventListener('touchmove', function(e) {
    e.preventDefault()
  }, false);
    
  //canvas = document.querySelector('canvas');
  
  canvas = document.createElement('canvas');
  canvas.setAttribute('id', 'pivotate-canvas');
  document.body.appendChild(canvas);
  //check if the browser supports canvas
  if (canvas.getContext) {
    init();
  }
  else {
    alert('Your browser does not support Canvas 2D drawing, sorry!');
  }
}

loaded();
