var ajax = function(options){
    var options = options || {};
    var method = options.method  || 'GET';
    var sync   = options.sync    || false;
    var url    = options.url    || window.location.pathname;
    var done   = options.done   || function(){};
    var fail   = options.fail   || function(){};
    var data   = options.data   || null;
    var type   = options.type   || 'uri';

    try {
        xhr = new XMLHttpRequest();
    } catch ( e ) {
        return fail(e);
    }

    xhr.open(method, url, sync);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            done(xhr);
        }
    };

    var query = '?';
    if (type === 'json') {
        data = JSON.stringify(data);
        xhr.setRequestHeader('Content-type', 'application/json');
    } else if (type === 'uri') {
        for (var key in data) {
            query += encodeURIComponent(key) + '=' + encodeURIComponent(data[key]);
        }
    } else {
        fail('Type not supported: ' + type);
    }

    try {
        if (method === 'POST' && type === 'json') {
            xhr.send(url, done, 'POST', data, sync);
        } else if (method === 'POST' && type === 'uri') {
            xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            xhr.send(url, done, 'POST', data, sync);
        } else if (method === 'GET') {
            xhr.send(url + query, done, 'GET', null, sync);
        } else {
            fail('Type not supported: ' + type);
        }
    } catch(err) {
        fail(err);
    };
}

window.ajax = ajax;