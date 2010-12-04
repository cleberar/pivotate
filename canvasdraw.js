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
	bB = 255; //blue fill
	
function init() {
	ctx = canvas.getContext('2d');
  
	//set height and width to size of device window
	canvas.setAttribute("height", (window.innerHeight - toolbarHeight) + "px");
	canvas.setAttribute("width", window.innerWidth + "px");
    	
	//pre load the colour picker image
	//imgPicker = new Image();
	//imgPicker.src = 'picker.png';
  //      
	////set initial toolbar fill colour
	//document.querySelector('#strokecolor').style.background = 'rgb(0,0,0)';
	//document.querySelector('#fillcolor').style.background = 'rgb(255,255,255)';
  //  	
	////add event listeners
	//document.querySelector('#clear').addEventListener('click', clearCanvas, false);
	//document.querySelector('#save').addEventListener('click', saveCanvas, false);
	//document.querySelector('#undo').addEventListener('click', undoCanvas, false);
	//document.querySelector('#strokecolor').addEventListener('click', strokePicker, false);
	//document.querySelector('#fillcolor').addEventListener('click', fillPicker, false);
        
	//listen for device oriantation changes
	//window.addEventListener('orientationchange', updateOrientation, false);
    	
	//add touch and mouse event listeners
	canvas.addEventListener('touchstart', onTouchStart, false);
	canvas.addEventListener('mousedown', onMouseDown, false);
	
	//event listener for application cache updates
	window.applicationCache.addEventListener('onupdateready', updateCache, false);
}

function onTouchStart(e) {
	
	e.preventDefault();
		
	if (e.touches.length == 1) {
		
		startDraw(e.touches[0].pageX, e.touches[0].pageY);
            	
		canvas.addEventListener('touchmove', onTouchMove, false);
		canvas.addEventListener('touchend', onTouchEnd, false);
		canvas.addEventListener('touchcancel', onTouchCancel, false);
	}			
}
	
function onTouchMove(e) {
	
	e.preventDefault();		
	moveDraw(e.touches[0].pageX, e.touches[0].pageY, e.timeStamp);
}
	
function onTouchEnd(e) {
	
	e.preventDefault();
		
	if (e.touches.length == 0) {
		
		endDraw(e.changedTouches[0].pageX, e.changedTouches[0].pageY);					
		canvas.removeEventListener('touchmove', onTouchMove, false);
		canvas.removeEventListener('touchend', onTouchEnd, false);
		canvas.removeEventListener('touchcancel', onTouchCancel, false);
	}		
}
	
function onTouchCancel(e) {
					
	canvas.removeEventListener('touchmove', onTouchMove, false);
	canvas.removeEventListener('touchend', onTouchEnd, false);
	canvas.removeEventListener('touchcancel', onTouchCancel, false);
		
}
	
function onMouseDown(e) {
		
	startDraw(e.clientX, e.clientY);				
	canvas.addEventListener('mousemove', onMouseMove, false);
	canvas.addEventListener('mouseup', onMouseUp, false);
				
}
	
function onMouseMove(e) {
	
	moveDraw(e.clientX, e.clientY, e.timeStamp);
}
	
function onMouseUp(e) {
		
	endDraw(e.clientX, e.clientY);
	canvas.removeEventListener('mousemove', onMouseMove, false);
	canvas.removeEventListener('mouseup', onMouseUp, false);		
}

function startDraw(x,y) {

	//if the colour picker is not visible, we must be in drawing mode
	if(!pickerEnabled) {
        
		//set defaults
		started = false;
		
		//get start position
		startX = x;
		startY = y - toolbarHeight;
            	
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		ctx.lineWidth = penSize; 
		ctx.globalCompositeOperation = 'source-over';	
		
		//save canvas image data for future undo event
		originalImageData = ctx.getImageData(0, 0, window.innerWidth, (window.innerHeight - toolbarHeight));
				
	}
	else {
		selectColor(x,y);
	}
}

function moveDraw(x,y,t) {

	//if the colour picker is not visible, we must be in drawing mode
	if(!pickerEnabled) {
		
		ctx.beginPath();
		ctx.moveTo(startX, startY);

		if (!started) {

			timerStart = t;
			started = true;
		}
		else {
           
        	//calc velocity     
        	var time = t - timerStart;     
        	var distance = Math.sqrt(Math.pow(((y - toolbarHeight) - startY), 2) + Math.pow((x - startX), 2));        
        	var velocity = distance / time;
        	roundedVel = 2.0-(Math.round(velocity * 100) / 100);
        	started = false;
		} 
	
		var lw = penSize * roundedVel;
	
		//set line width limits
		if (lw > 1) {
			ctx.lineWidth = 1;  
		}
		else if (lw < 0.1) {
			ctx.lineWidth = 0.1;
		} 
		else {
			ctx.lineWidth =  lw; 
		}             
        
        //set alpha opacity limits
		if (roundedVel > 1) {	
			ctx.strokeStyle = 'rgba(' + r + ',' + g + ',' + b + ',1.0)';
		} 
		else if (roundedVel < 0.3) {
			ctx.strokeStyle = 'rgba(' + r + ',' + g + ',' + b + ',0.3)';
		}
		else {
			ctx.strokeStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + roundedVel + ')';
		}
	
		ctx.lineTo(x, y - toolbarHeight);
		ctx.stroke();
		ctx.closePath();

		startX = x;
		startY = y - toolbarHeight;
	}
	else {	
		selectColor(x,y);	
	}
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

function selectColor(x,y) {

	//get the canvas image data for the pixel where the user touches/clicks
	imgd = ctx.getImageData(x, y - toolbarHeight, 1, 1);
			
	//data is an array containing rgb colour values for each canvas pixel
	data = imgd.data;
	
	if (strokePickerEnabled) {
        	
        //apply colour to the canvas pen
		r = data[0];
		g = data[1];
		b = data[2];
				
        //update stroke toolbar display
		document.querySelector('#strokecolor').style.background = 'rgb(' + r + ',' + g + ',' + b + ')';

	}
	else if (fillPickerEnabled) {
        	
        //apply colour to the fill
		rB = data[0];
		gB = data[1];
		bB = data[2];
        	
        //update fill toolbar display
		document.querySelector('#fillcolor').style.background = 'rgb(' + rB + ',' + gB + ',' + bB + ')';
		canvas.style.backgroundColor = 'rgb(' + rB + ', ' + gB + ', ' + bB + ')';      	
	}
}
    
function updateOrientation(e) {

	//if the user changes device orientation, clear the canvas and resize to fit new orientation
	switch (window.orientation) {
		case 0: 
			if (!confirm("Clear and resize canvas to portrait?")) {
				break;
			}
			canvas.setAttribute("height", (window.innerHeight - toolbarHeight) + "px");
			canvas.setAttribute("width", window.innerWidth + "px");
			canvas.style.backgroundColor = 'rgb(' + rB + ', ' + gB + ', ' + bB + ')'; 
			break; 
		case 90:
			if (!confirm("Clear and resize canvas to landscape?")) {
				break;
			}
			canvas.setAttribute("height", (window.innerHeight - toolbarHeight) + "px");
			canvas.setAttribute("width", window.innerWidth + "px");
			canvas.style.backgroundColor = 'rgb(' + rB + ', ' + gB + ', ' + bB + ')';
			break;
		case -90: 
			if (!confirm("Clear and resize canvas to landscape?")) {
				break;
			}
			canvas.setAttribute("height", (window.innerHeight - toolbarHeight) + "px");
			canvas.setAttribute("width", window.innerWidth + "px");
			canvas.style.backgroundColor = 'rgb(' + rB + ', ' + gB + ', ' + bB + ')';
			break;
		case 180:
			if (!confirm("Clear and resize canvas to portrait?")) {
				break;
			}
			canvas.setAttribute("height", (window.innerHeight - toolbarHeight) + "px");
			canvas.setAttribute("width", window.innerWidth + "px");
			canvas.style.backgroundColor = 'rgb(' + rB + ', ' + gB + ', ' + bB + ')';
			break;
	}	
}
    
//set pen size based on toolbar selection
function setSize() {
	penSize = document.querySelector('#size').value;
}
    
function strokePicker() { 
    	
	strokePickerEnabled = true;
	fillPickerEnabled = false;
	
	if(!pickerEnabled) {
    	
		//save the original canvas drawing data before drawing the colour picker on top
		originalImageData = ctx.getImageData(0, 0, window.innerWidth, (window.innerHeight - toolbarHeight));
		ctx.save();
		ctx.shadowOffsetX = 5;
		ctx.shadowOffsetY = 5;
		ctx.shadowBlur = 10;
		ctx.shadowColor = 'rgba(0,0,0,0.3)';
		ctx.drawImage(imgPicker,5,0);
		ctx.restore();        	
		pickerEnabled = true;
	}
	else {
		//restore the original canvas drawing data
		ctx.putImageData(originalImageData, 0, 0);
		pickerEnabled = false;
	} 	
}

function fillPicker() { 
    	
	fillPickerEnabled = true;
	strokePickerEnabled = false;
	
	if(!pickerEnabled) {
    	
		//save the original canvas drawing data before drawing the colour picker on top
		originalImageData = ctx.getImageData(0, 0, window.innerWidth, (window.innerHeight - toolbarHeight));
		ctx.save();
		ctx.shadowOffsetX = 5;
		ctx.shadowOffsetY = 5;
		ctx.shadowBlur = 10;
		ctx.shadowColor = 'rgba(0,0,0,0.3)';
		ctx.drawImage(imgPicker,38,0);
		ctx.restore();        	
		pickerEnabled = true;
	}
	else {
		//restore the original canvas drawing data
		ctx.putImageData(originalImageData, 0, 0);
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

	if (!confirm("Undo last pen stroke?")) {
		return;
	}
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
