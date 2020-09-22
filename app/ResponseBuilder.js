'use strict';

function ResponseBuilder(response){
    this.response = response;
    this.headers = {};
}

ResponseBuilder.prototype.addHeaderByKeyValue = function(key, value) {
    this.headers[key] = value;
    return this;
}

ResponseBuilder.prototype.build = function(headers){
    if(headers){
        this.response.header(Object.assign(headers, this.headers));
    }
    return this;
}

module.exports = ResponseBuilder;