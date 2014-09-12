var Pivotal = function(token) {
    
    var self = this;

    self.API_VERSION = "v5";
    self.API_HOST    = "https://www.pivotaltracker.com/services/";
    self._token      = token || "";

    function getArray(name, hash) {
        console.log(name, hash);
        var arr = {};
        for (var k in hash) {
            arr[name + '[0][' + k + ']'] = hash[k];
        }
        return arr;
    }
    
    return {
        setToken: function(token) {
            self._token   = token;
        },
        getProjects : function() {
            return self.request({
                url   : "/projects",
                method: "GET"
            });
        },
        addStory : function(data) {
            return self.request({
                url   : "/projects/" + data.project + "/stories",
                data  : { 
                    name: data.name,
                    description: data.description,
                    story_type: data.story_type
                }
            });
        },

        addComment : function(data) {
            return self.request({
                url: "/projects/" + data.project + "/stories/" + data.storyid + "/comments",
                data: JSON.stringify(data.data),
                contentType: 'application/json'
            });
        },
        
        attachmentStory : function(data) {
            var CRLF = "\r\n",
                boundary = "AJAX--------------" + (new Date).getTime(),
                contentType = "multipart/form-data; boundary=" + boundary,
                send = '--' + boundary
                     + CRLF
                     + 'Content-Disposition: form-data; name="project_id"' + CRLF
                     + CRLF
                     + data.project + CRLF
                     + CRLF;
                /*
                for (var k in data.comment) {
                    send += '--' + boundary
                         + CRLF
                         + 'Content-Disposition: form-data; name="comment[' + k + ']"' + CRLF
                         + CRLF
                         + data.comment[k] + CRLF
                         + CRLF

                }
                */
                // console.log('Sending attachmentStory', send);
                send += '--' + boundary
                     + CRLF
                     +  'Content-Disposition: form-data; name="file"; filename="' + data.name + '"' + CRLF
                     + 'Content-Type: image/png' + CRLF
                     + CRLF
                     + data.content + CRLF
                     + CRLF
                     + '--' + boundary + "--" + CRLF;
          
            return self.request({
                url   : "/projects/" + data.project + "/uploads",
                data  : send,
                contentType : contentType,
                binary : data.type,
                processData: false
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
                contentType : "application/x-www-form-urlencoded",
                processData : true
            };

        $.extend(params, options);

        params.url = params.host + params.apiVersion + params.url;

        params.headers["Content-Type"] = params.contentType;
        params.headers["X-TrackerToken"] = this._token;


        if ( options.binary ) {
            var data = new ArrayBuffer( params.data.length );
            var ui8a = new Uint8Array( data, 0 );
            for ( var i = 0; i < params.data.length; i++ ) {
                ui8a[i] = ( params.data.charCodeAt(i) & 0xff );
            }
            params.data = new Blob([data], {type: options.binary});
        }

        var def = $.ajax(params.url, {
            type: params.method,
            headers: params.headers,
            data: params.data,
            success: function(response){
                if ( params.done ) {
                    params.done(response);
                }
            },
            error: function(jqXHR, textStatus, errorThrown){
                if ( params.fail ) {
                    params.fail(textStatus, errorThrown);
                }
            },
            processData: params.processData,
            dataType: 'json'
        });

        return def;
    }
}