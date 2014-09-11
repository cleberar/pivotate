window.addEventListener("load", function() {
    var urlParams = {};
    location.search.slice(1).split("&").forEach(function(param) {
	current = param.split("=", 2);
	urlParams[decodeURIComponent(current[0])] = decodeURIComponent(current[1]);
    });
    pivotate.load(urlParams);
    
}, false);

var pivotate = {

    load : function( params ) {
    
		var self = this,
	     	project = document.querySelector( "#project" ),
		    icons = document.querySelectorAll( '.story .icons > li' ),
		    canvas = document.querySelector( "#canvas-background" ),
		    storyType = document.querySelector( "#story_type" ),
		    action = document.querySelector( "#action" ),
		    name = document.querySelector( "#name" ),
		    description = document.querySelector( "#description" );

		canvas.setAttribute( "height",  ( window.innerHeight - 125 ) + "px" );
		canvas.setAttribute( "width", ( window.innerWidth - 305 ) + "px" );
	
		self.formatIMG = new ImgCanvas(canvas);
		self.params = params || {};
	
		document.querySelector( "#panel" ).setAttribute(
		    'style',
		    "width: 300px; height: " + ( window.innerHeight - 22 ) + "px"
		);

		self.token.get( function( token ) {
		    self.pivotal = new Pivotal( token );
		    self.loadProjects();
		});

		document.querySelector( "#set-token" ).addEventListener( 'click', function() {
		   self.token.form();
		});
	
		document.querySelector("#clean").addEventListener('click', function() {
		    var screenshot = window.sessionStorage.getItem( "img-" + self.params.id );
		    if ( screenshot ) {
				self.formatIMG.setBackground(screenshot);
		    }
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
				alert( 'All fields are required' );
				return;
		    }
		    
		    this.className += " btn-loading";
		    this.setAttribute( "disabled", true );
		    
		    self.pivotal.addStory({
				name        : name.value,
				description : description.value,
				story_type  : storyType.value,
				project     : project.value
			},{
				done: function( result ) {
					console.log('Add story done', result);
			    	self.pivotal.attachmentStory({
						project : project.value,
						storyid : result.id,
						name    : "screen.png",
						type    : "image/png",
						content :  atob(self.formatIMG.getImg())
			    	}, {
						done: function(resp) {
							console.log('rest', resp, typeof resp);
							self.pivotal.addComment({
								project: project.value,
								storyid: result.id,
								data: {
									text: "This isa test comment",
									file_attachments: [resp]
								}
							}, {
								done: function(res) {
									console.log('Comment added', res);
						    		alert( "The story has been successfully registered." );
								},
								fail: function() {}
							});

				    		//window.close();
						},
						fail: function() {
				    		action.className = "btn";
				    		action.setAttribute( "disabled", false );
							if (status == 401) {
					    		self.token.form( null, "enter a valid token") ;
							} else {
					    		alert( "An unexpected error occurred, sorry" );
							}
						}
			    	});

				},
				fail: function() {
				    action.className = "btn";
				    action.setAttribute( "disabled", false );
				    alert( "An unexpected error occurred, sorry" );
				}
	    	});
		});
       
		var screenshot = window.sessionStorage.getItem( "img-" + this.params.id );
		if ( screenshot ) {
		    this.formatIMG.setBackground( screenshot );
		}
	
		window.onresize = function() {
		    var currentImg = self.formatIMG.getDataUrl();
		    canvas.setAttribute( "height",  ( window.innerHeight - 125 ) + "px" );
		    canvas.setAttribute( "width", ( window.innerWidth - 305 ) + "px" );
		    self.formatIMG.setBackground( currentImg );
		}
    },
    
    setScreenShot: function( img, id ) {
		window.sessionStorage.setItem( "img-" + id, img );
		if ( this.formatIMG ) {
		    this.formatIMG.setBackground( img );
		}
    },
  
    loadProjects: function() {

		var self = this,
		    project = document.querySelector( "#project" );

		this.pivotal.getProjects({
		    done: function( result ) {
		    	console.log(result);
				for ( var i = 0, max = result.length; i < max; i++ ) {
				    var option = document.createElement( 'option' );
				    option.text = result[i].name;
				    option.value = result[i].id;
				    project.add( option, project.options[project.selectedIndex] );
				}
			},
			fail : function( status, e ) {
				if ( status == 401 ) {
				    self.token.form(function( token ) {
						self.pivotal.setToken( token );
						self.loadProjects();
				    }, "enter a valid token");
				} else {
				    alert( "An unexpected error occurred, sorry" );
				}
		    }
		});
    },
    
    token : {

		form : function( callback, alert ) {
		    
		    document.querySelector( "#lockscreen" ).style.display = "block";
		    document.querySelector( "#show-token" ).style.display = "block";

		    if ( alert ) {
				document.querySelector( ".error" ).style.display = "block";
				document.querySelector( ".error" ).innerHTML = alert;
		    }

		    document.querySelector( "#save-token" ).addEventListener('click', function() {
				
				var token = document.querySelector( "#token" ).value;
				if ( token == "" ) {
				    document.querySelector( ".error" ).style.display = "block";
				    return;
				} 
				
				callback && callback( token );

				document.querySelector( ".error" ).style.display = "none";
				window.localStorage.setItem( "pivotal-api-token", token );
				
				document.querySelector( "#lockscreen" ).style.display = "none";
				document.querySelector( "#show-token" ).style.display = "none";
		    });
		},

		get : function( callback ) {
		    var token = window.localStorage.getItem( "pivotal-api-token" );
		    if ( !token ) {
				return this.form( callback );
		    }
		    
		    return callback && callback( token );
		},

		set: function( token ) {
		    window.localStorage.setItem( "pivotal-api-token", token );
		}
    }
};
   