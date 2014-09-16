var Pivotal = function(token) {
    
    var self = this;

    self._token      = token || "";

    return {
        setToken: function(token) {
            self._token   = token;
        },
    }
}

Pivotal.prototype  = {
    
}