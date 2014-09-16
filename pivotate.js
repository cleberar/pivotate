

var pivotate = (function() {

	var _token = null;
	var project_id = null;

    function request( url, options ) {
        
        var params = {
                data        : "",
                headers     : {},
                type        : "POST",
                contentType : "application/x-www-form-urlencoded",
                processData : true,
                dataType    : 'json'
            };

        $.extend(params, options);

        url = "https://www.pivotaltracker.com/services/v5" + url;

        params.headers["Content-Type"] = params.contentType;
        params.headers["X-TrackerToken"] = _token;

        return $.ajax(url, params);
    }

    function getProject() {
    	return $('#project').val()
    }

    function attachment() {
        var CRLF = "\r\n",
            boundary = "AJAX--------------" + (new Date).getTime(),
            send = '--' + boundary
                 + CRLF
                 + 'Content-Disposition: form-data; name="project_id"' + CRLF
                 + CRLF
                 + project_id + CRLF
                 + CRLF
                 + '--' + boundary
                 + CRLF
                 +  'Content-Disposition: form-data; name="file"; filename="screen.png"' + CRLF
                 + 'Content-Type: image/png' + CRLF
                 + CRLF
                 + atob(self.formatIMG.getImg()) + CRLF
                 + CRLF
                 + '--' + boundary + "--" + CRLF;

	    var data = new ArrayBuffer( send.length );
	    var ui8a = new Uint8Array( data, 0 );
	    for ( var i = 0; i < send.length; i++ ) {
	        ui8a[i] = ( send.charCodeAt(i) & 0xff );
	    }
	    send = new Blob([data], {type: "image/png"});

      
        return request("/projects/" + project_id + "/uploads", {
            data  : send,
            contentType : "multipart/form-data; boundary=" + boundary,
            processData: false
        });

    }

    function loadProjects () {

		var project = document.querySelector( "#project" );
		var default_project = window.localStorage.getItem( "pivotal-project" );

		request("/projects", {
			type: "GET"
		}).done(function( result ) {
			for ( var i = 0, max = result.length; i < max; i++ ) {
			    var option = document.createElement( 'option' );
			    option.text = result[i].name;
			    option.value = result[i].id;
			    if (result[i].id == default_project) option.selected = true;
			    project.add( option, project.options[project.selectedIndex] );
			}
			project_id = project.value;
			loadLabels();
			setTimeout(function(){
				console.log('url', self.url);
			}, 1000);
		}).fail(function( status, e ) {
			if ( status == 401 ) {
			    self.token.form(function( token ) {
					self.pivotal.setToken( token );
					self.loadProjects();
			    }, "enter a valid token");
			} else {
			    alert( "An unexpected error occurred, sorry" );
			}
	    });
    }


    function loadLabels () {
		var self = this,
		    labels = document.querySelector( "#labels" );
		labels.options.length = 0;
    	request("/projects/" + project_id + "/labels", {
            type: "GET"	    		
    	}).done(function(result){
			for ( var i = 0, max = result.length; i < max; i++ ) {
			    var option = document.createElement( 'option' );
			    option.text = result[i].name;
			    option.value = result[i].id;
			    labels.add( option, labels.options[labels.selectedIndex] );
			}
	    	$('#labels').trigger("chosen:updated");
    	});
    }

    function addStory(attach) {
		var name = document.querySelector( "#name" ),
			description = document.querySelector( "#description" ),
			storyType = document.querySelector( "#story_type" ),
			labels = $("#labels").val();

		for (var i=0; i<labels.length; i++) labels[i] = labels[i] * 1;

    	var data = {
				name        : name.value,
				description : description.value,
				story_type  : storyType.value,
				project_id  : project_id,
				label_ids 	: labels,
				comments	: [
					{
						text: self.url,
						file_attachments: [attach]
					}					
				]
			}

		console.log('Adding story', data);

		return request("/projects/" + project_id + "/stories", {
			data: JSON.stringify(data),
            contentType: 'application/json'
		});
    }

	var self = {
		url: '',
		formatIMG: null,
		params: null,
	    load : function( params ) {
	    
			var project = document.querySelector( "#project" ),
			    icons = document.querySelectorAll( '.story .icons > li' ),
			    canvas = document.querySelector( "#canvas-background" ),
			    storyType = document.querySelector( "#story_type" ),
			    action = document.querySelector( "#action" ),
			    name = document.querySelector( "#name" ),
			    labels = document.querySelector("#labels"),
			    description = document.querySelector( "#description" );

			canvas.setAttribute( "height",  ( window.innerHeight - 125 ) + "px" );
			canvas.setAttribute( "width", ( window.innerWidth - 305 ) + "px" );
		
			self.formatIMG = new ImgCanvas(canvas);
			self.params = params || {};
		
			$( "#panel" ).attr('style', "width: 300px; height: " + ( window.innerHeight - 22 ) + "px");

			self.token.get();

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

	    	$('#labels').chosen();
			project.addEventListener('change', function() {
				project_id = this.value;
				window.localStorage.setItem( "pivotal-project", project_id);
				loadLabels();
			});
		
	       	action.addEventListener('click', function() {

			    if (name.value == "" || description.value == "" || storyType.value == "") {
					alert( 'All fields are required' );
					return;
			    }
			    
			    this.className += " btn-loading";
			    this.setAttribute( "disabled", true );
			    
			    attachment()
			    .done(function(result){
			    	addStory(result)
			    	.done(function(){
			    		alert("Pivotal story created");
			    		window.close();
			    	})
			    	.fail();
			    })
			    .fail(function(){
		    		action.className = "btn";
		    		action.setAttribute( "disabled", false );
					if (status == 401) {
			    		self.token.form( null, "enter a valid token") ;
					} else {
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

	    setTabData: function(data) {
	    	self.url = data.url;
	    	console.log(data);

	    },
	    token : {

			form : function( callback, alert ) {
			    
			    $( "#lockscreen, #show-token" ).show();

			    if ( alert ) $( ".error" ).show().html(alert);

			    $( "#save-token" ).click(function() {
					
					var token = document.querySelector( "#token" ).value;
					if ( token == "" ) {
						$( ".error" ).show(); 
					} else {
						$( ".error" ).hide();
						window.localStorage.setItem( "pivotal-api-token", token );
						
						$( "#lockscreen, #show-token" ).hide();
						_token = token;
						loadProjects();
					}
			    });
			},

			get : function( ) {
			    var token = window.localStorage.getItem( "pivotal-api-token" );
			    if ( !token ) {
					return this.form();
			    }			    
			    _token = token;
			    loadProjects();
			}
	    }		
	};
	return self;
})();


window.addEventListener("load", function() {
    var urlParams = {};
    location.search.slice(1).split("&").forEach(function(param) {
	current = param.split("=", 2);
	urlParams[decodeURIComponent(current[0])] = decodeURIComponent(current[1]);
    });
    pivotate.load(urlParams);
    
}, false);
