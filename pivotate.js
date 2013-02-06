var pivotate = {
    init : function( img ) {
    
	var self = this
      
	var project = document.querySelector( "#project" ),
	    icons = document.querySelectorAll( '.story .icons > li' ),
	    canvas = document.querySelector( "#canvas-background" ),
	    storyType = document.querySelector( "#story_type" ),
	    action = document.querySelector("#action"),
	    name = document.querySelector("#name"),
	    description = document.querySelector("#description");

	canvas.setAttribute( "height",  (window.innerHeight - 125) + "px" );
	canvas.setAttribute( "width", ( window.innerWidth - 225 ) + "px" );
	
	var format = new ImgCanvas(canvas);
	format.setBackground(img);

	document.querySelector( "#panel" ).setAttribute(
	    'style',
	    "width: 300px; height: " + ( window.innerHeight - 22 ) + "px"
	);

	self.token.get(function(token) {
	    self.pivotal = new Pivotal(token);
	    self.loadProjects();
	});

	document.querySelector("#set-token").addEventListener('click', function() {
	   self.token.form();
	});

	for ( var i = 0, max = icons.length; i < max; i++ ) {
	    icons[i].addEventListener( 'click', function() {
		
		for ( var y = 0, max = icons.length; y < max; y++ ) {
		    var iconDisable = icons[y];
		    iconDisable.className = iconDisable.getAttribute( "data-storytype" );
		}
    
		this.className += " active";
		storyType.value = this.getAttribute( "data-storytype" );
	    });
	};
	
       action.addEventListener('click', function() {
	    
	    if (name.value == "" || description.value == "" || storyType.value == "") {
		alert('All fields are required');
		return;
	    }
	    
	    this.className += " btn-loading";
	    this.setAttribute("disabled", true);
	    
	    self.pivotal.addStory({
		name        : name.value,
		description : description.value,
		story_type  : storyType.value,
		project     : project.value
		},{
		done: function(result) {
		    self.pivotal.attachmentStory({
			project : project.value,
			storyid : result.childNodes[0].getElementsByTagName("id")[0].textContent,
			name    : "screen.png",
			type    : "image/png",
			content :  atob(format.getImg())
		    }, {
			done: function() {
			    alert("The story has been successfully registered.");
			    window.close();
			},
			fail: function() {
			    action.className = "btn";
			    action.setAttribute("disabled", false);
			    alert("An unexpected error occurred, sorry");
			}
		    });
		},
		fail: function() {
		    
		    action.className = "btn";
		    action.setAttribute("disabled", false);
    
		    alert("An unexpected error occurred, sorry");
		}
	    });
	});
    },
    
  
    loadProjects: function() {
	var self = this;
	var project = document.querySelector( "#project" );
	this.pivotal.getProjects({
	    done: function(result) {
		for ( var i = 0, max = result.childNodes.length; i < max; i++ ) {
		    var option = document.createElement('option');
		    option.text = result.childNodes[i].getElementsByTagName("name")[0].textContent;
		    option.value = result.childNodes[i].getElementsByTagName("id")[0].textContent;
		    project.add(
			option,
			project.options[project.selectedIndex]
		    );
		}
	    },
	    fail : function(status, e) {
		if (status == 401) {
		    self.token.form(null, "enter a valid token");
		} else {
		    alert("An unexpected error occurred, sorry");
		}
	    }
	});
    },
    
    token : {
	form : function(callback, alert) {
	    
	    document.querySelector( "#lockscreen" ).style.display = "block";
	    document.querySelector( "#show-token" ).style.display = "block";

	    if (alert) {
		document.querySelector( ".error" ).style.display = "block";
		document.querySelector( ".error" ).innerHTML = alert;
	    }
	    document.querySelector( "#save-token" ).addEventListener('click', function() {
		var token = document.querySelector( "#token" ).value;
		if (token == "") {
		    document.querySelector( ".error" ).style.display = "block";
		    return;
		} 
		
		if (callback) {
		    callback(token);
		}

		document.querySelector( ".error" ).style.display = "none";
		window.localStorage.setItem("pivotal-api-token", token);
		
		document.querySelector( "#lockscreen" ).style.display = "none";
		document.querySelector( "#show-token" ).style.display = "none";
	    });
	},

	get : function(callback) {
	    var token = window.localStorage.getItem( "pivotal-api-token" );
	    if ( !token ) {
		this.form(callback);
		return;
	    }
	    
	    callback(token);
	},
	set: function(token) {
	    window.localStorage.setItem("pivotal-api-token", token);
	}
    }
};

   