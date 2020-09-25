'use strict';

const request = require('request-promise');
const querystring = require('querystring');
const bodyParser = require('body-parser');
const converter = require('rel-to-abs');
const fs = require('fs');
const index = fs.readFileSync('index.html', 'utf8');
const ResponseBuilder = require('./app/ResponseBuilder');

// Define the allowed headers/methods for Access Control (CORS) headers
const allowHeaders = 'x-requested-with, Content-Type, origin, authorization, accept, client-security-token, cache-control, if-none-match, if-not-modified, x-api-key, x-trip-id, accept-language, accept-encoding, x-total-count, pragma, expires, X-Atlassian-Token';
const allowMethods = 'OPTIONS,HEAD,GET,POST';

// Define the CORS proxy headers to be sent on each response
// (note that we're using Express res.set() so any existing values will be overwritten with these)
// see https://expressjs.com/en/api.html#res.set
const corsHeaders = {
    'Access-Control-Allow-Headers': allowHeaders,
    'Access-Control-Expose-Headers': allowHeaders,
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Methods': allowMethods,
    'Access-Control-Allow-Credentials': true,
    'X-Proxied-By': 'cors-container'
};

module.exports = function(app) {
app.use(bodyParser.text({ type: 'text/plain' })), // for parsing application/json
    app.options('/*', (req, res) => {
        const allowOrigin = req.get('Origin') || '*';
        return res
            .set('Access-Control-Allow-Origin', allowOrigin)
            .set(corsHeaders)
            .send();
    }),
    app.get('/*', (req, res) => {
        const responseBuilder = new ResponseBuilder(res);

        const originalUrl = req.originalUrl;
        const requestedUrl = req.params[0];
        const corsBaseUrl = '//' + req.get('host');
        const auth = req.get('authorization') || '';
        
        var queryParamsDecoded = querystring.decode(req.originalUrl.split('?')[1] || '');
        const proxyAuth = queryParamsDecoded.proxyAuth === 'true' || false;

        var proxiedRequestHeaders = {
            'User-Agent': 'CorsContainer'
        };
        if (auth && proxyAuth) {
            proxiedRequestHeaders.Authorization = auth;
            console.log('Sending Authorization header to proxied URL');
        }

        
        // Don't proxy the proxyAuth param
        delete queryParamsDecoded.proxyAuth;

        console.info(req.protocol + '://' + req.get('host') + originalUrl);

        if(requestedUrl === ''){
            res.send(index);
            return;
        }
          if(requestedUrl == 'datatable'){
            res.send(fs.readFileSync('datatable.html', 'utf8'));
            return;
        } 
            if(requestedUrl == 'stocktracker'){
            res.send(fs.readFileSync('stocktracker.html', 'utf8'));
            return;
        }
            if(requestedUrl == 'st.nojs'){
            res.send(fs.readFileSync('st.nojs', 'utf8'));
            return;
        }
            if(requestedUrl == 'stocktable.html'){
            res.send(fs.readFileSync('stocktable.html', 'utf8'));
            return;
        }
                if(requestedUrl == 'test.stock'){
            res.send(fs.readFileSync('stock.table', 'utf8'));
            return;
         }                   
                                    if(requestedUrl == 'test1.stock'){
            res.set('content-type', 'application/json');                            
            res.send(fs.readFileSync('stock.table', 'utf8'));
            return;
        }
            if(requestedUrl == 'st.nojscript'){
            res.send(fs.readFileSync('st.nojscript', 'utf8'));
            return;
        }    
                if(requestedUrl == 'logo2.png'){
            res.send(fs.readFileSync('logo2.png'));
            return;
        }
                if(requestedUrl == 'preview.png'){
            res.send(fs.readFileSync('preview.png'));
            return;
        }
                if(requestedUrl == 'refresh.png'){
            res.send(fs.readFileSync('refresh.png'));
            return;
        }
                    if(requestedUrl == 'delete.png'){
            res.send(fs.readFileSync('delete.png'));
            return;
        }
      
    
        request({
            uri: requestedUrl + '?' + querystring.stringify(queryParamsDecoded),
            resolveWithFullResponse: true,
            headers: proxiedRequestHeaders
        })
            .then(originResponse => {
                responseBuilder
                    .build(originResponse.headers);
                const allowOrigin = req.get('Origin') || '*';
                res = res
                    .set('Access-Control-Allow-Origin', allowOrigin)
                    .set(corsHeaders);
                if(req.headers['rewrite-urls']){
                    res.send(converter
                        .convert(originResponse.body, requestedUrl)
                        .replace(requestedUrl, corsBaseUrl + '/' + requestedUrl)
                    );
                }else{
                    res.send(originResponse.body);
                }
            })
            .catch(originResponse => {
                responseBuilder
                    .build(originResponse.headers);

                res.status(originResponse.statusCode || 500);
                const allowOrigin = req.get('Origin') || '*';
                return res
                    .set('Access-Control-Allow-Origin', allowOrigin)
                    .set(corsHeaders)
                    .send(originResponse.message);
            });
    }),

    app.post('/*', (req, res) => {
        const responseBuilder = new ResponseBuilder(res);

        const originalUrl = req.originalUrl;
        const requestedUrl = req.params[0];
        const reqContentType = req.get('Content-Type') || 'application/json; charset=utf-8';
        const corsBaseUrl = '//' + req.get('host');
        const auth = req.get('authorization') || '';
        const queryParams = req.originalUrl.split('?')[1] || '';
        console.info(req.protocol + '://' + req.get('host') + originalUrl);
        console.info('Content-type in proxied request: ' + reqContentType);
        const jsonBody = JSON.stringify(req.body);
        if(requestedUrl === ''){
                        fs.writeFile('datatable.html', JSON.stringify(req.body), function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("The file was saved!");
}); 

        }
        
        if(requestedUrl === 'post'){
            var processed = req.body;
            var processed = processed.replace(/^\"/,'');
            var processed = 'test'
                        fs.writeFile('stock.table', processed, function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("The file was saved!");
}); 

        }        
        
        console.info('Request body being sent: ' + jsonBody);
        request({
            method: 'POST',
            uri: requestedUrl + '?' + queryParams,
            resolveWithFullResponse: true,
            headers: {
                'Authorization': auth,
                // Weird JIRA backdoor thing to get around XSRF :D
                'X-Atlassian-Token': 'no-check',
                'User-Agent': 'CorsContainer',
                'Content-Type': reqContentType
            },
            body: jsonBody
        })
            .then(originResponse => {
                responseBuilder
                    .build(originResponse.headers);
                const allowOrigin = req.get('Origin') || '*';
                res = res
                    .set('Access-Control-Allow-Origin', allowOrigin)
                    .set(corsHeaders);
                if(req.headers['rewrite-urls']){
                    res.send(converter
                        .convert(originResponse.body, requestedUrl)
                        .replace(requestedUrl, corsBaseUrl + '/' + requestedUrl)
                    );
                }else{
                    res.send(originResponse.body);
                }
            })
            .catch(originResponse => {
                responseBuilder
                    .build(originResponse.headers);

                res.status(originResponse.statusCode || 500);
                const allowOrigin = req.get('Origin') || '*';
                return res
                    .set('Access-Control-Allow-Origin', allowOrigin)
                    .set(corsHeaders)
                    .send(originResponse.message);
            });
    });
};
