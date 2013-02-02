var Pivotal = function(token) {
    
    var self = this;

    self.API_VERSION = "v3";
    self.API_HOST    = "https://www.pivotaltracker.com/services/";
    self._token      = token || "";
    
    return {
        setToken: function(token) {
            self._token   = token;
        },
        getProjects : function(callback) {
            self.request({
                url   : "/projects",
                method: "GET",
                done  : callback.done,
                fail  : callback.fail
            });
        },
        addStory : function(data, callback) {
            var send = "<story>" +
                        "<name>" + data.name + "</name>" + 
                        "<description>" + data.description + "</description>" + 
                        "<story_type>" + data.story_type  + "</story_type>" + 
                       "</story>";
                        
            self.request({
                url   : "/projects/" + data.project + "/stories",
                data  : send,
                contentType: "application/xml",
                done  : callback.done,
                fail  : callback.fail
            });
        },
        
        attachmentStory : function(data, callback) {

            var CRLF = "\r\n",
                boundary = "AJAX--------------" + (new Date).getTime(),
                send = '--' + boundary
                     + CRLF
                     +  'Content-Disposition: form-data; ' +
                        'name="Filedata"; ' +
                        'filename=" ' + data.name + ' "'
                     + CRLF
                     + 'Content-Type:application/octet-stream' + CRLF
                     + CRLF
                     + data.content + CRLF
                     + CRLF
                     + '--' + boundary + "--" + CRLF,
                     contentType = "multipart/form-data; boundary=" + boundary;
          
            self.request({
                url   : "/projects/" + data.project + "/stories/" + data.storyid + "/attachments",
                data  : send,
                contentType : contentType,
                done  : callback.done,
                fail  : callback.fail,
                binary : data.type
            });
        }
    }
}

Pivotal.prototype  = {
    
    request : function( options ) {
        
        var params = {
                done        : function(data) {},
                fail        : function(data) {},
                host        : this.API_HOST,
                apiVersion  : this.API_VERSION,
                data        : "",
                headers     : {},
                method      : "POST",
                contentType : "application/x-www-form-urlencoded"
            };

        Object.keys( options ).forEach(function ( key ) {
            params[key]  = options[key];
        }, options);

        params.url = params.host + params.apiVersion + params.url;

        var http = new XMLHttpRequest();
        http.open( params.method, params.url, true );
        Object.keys( params.headers ).forEach(function( key ) {
            http.setRequestHeader( key , this[ key ] );
        }, params.headers);

        if ( params.contentType ) {
            http.setRequestHeader( "Content-Type", params.contentType );
        }
        http.setRequestHeader( "X-TrackerToken", this._token );

        http.onreadystatechange = function() {
            if ( http.readyState == 4 ) {
                if ( http.status == 200 ) {
                    if ( params.done ) {
                        params.done(
                            (new DOMParser()).parseFromString(
                                http.responseText ,
                                "text/xml"
                            )
                        );
                    }

                } else {
                    if ( params.fail ) {
                        params.fail(
                            http.status,
                            (new DOMParser()).parseFromString(
                                http.responseText ,
                                "text/xml"
                            )
                        );
                    }
                }
            }
        }
        
        if ( options.binary ) {
            var data = new ArrayBuffer( params.data.length );
            var ui8a = new Uint8Array( data, 0 );
            for ( var i = 0; i < params.data.length; i++ ) {
                ui8a[i] = ( params.data.charCodeAt(i) & 0xff );
            }
            http.send( new Blob([data], {type: options.binary}) );
        } else {
            http.send( params.data );
        }
    }
}