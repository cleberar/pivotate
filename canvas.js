var ImgCanvas = function(canvas) {

    var self = this, 
    draw;
    
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.typeDraw = 'line';
    draw = this[this.typeDraw]();
    var mouseEvt = function(event) {
        if (event.offsetX || event.offsetX == 0) {
            event._x = event.offsetX;
            event._y = event.offsetY;
        }
    
        var func =  draw[event.type];
        if (func) {
            func(event);
        }
    };
    
    this.canvas.addEventListener('mousedown', mouseEvt, false);
    this.canvas.addEventListener('mousemove',  mouseEvt, false);
    this.canvas.addEventListener('mouseup',  mouseEvt, false);
}


ImgCanvas.prototype = {
    setBackground : function(background) {

        var self = this;

        if (!background) {
            return;
        }

        var image = new Image();
        image.src = background;
        image.onload = function() {
            self.context.drawImage(
                image, 
                0, 
                0, 
                self.canvas.getAttribute("width").replace("px", ""), 
                self.canvas.getAttribute("height").replace("px", "")
            );
        }
    },
    line : function() {

        var self = this;
        this.start = false;

        this._mousemove = function(event) {
            if (!this.start) {
                return;
            }
            this.context.strokeStyle = "#ff0000"; 
            this.context.lineTo(event._x, event._y);
            this.context.stroke();
        };

        this._mousedown = function(event) {
            this.context.beginPath();
            this.context.moveTo(event._x, event._y);
            this.start = true;
        };

        this._mouseup = function(event) {
            if (!this.start) {
                return;
            }
            this._mousemove(event);
            this.start = false;
        };

        return {
            mousedown : function(event) {
                self._mousedown(event);
            },
            mousemove : function(event) {
                self._mousemove(event);
            },
            mouseup : function(event) {
                self._mouseup(event);
            }
        }
    },
    getImg : function() {
        var dataURL = this.canvas.toDataURL("image/png");
        return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
    }
}