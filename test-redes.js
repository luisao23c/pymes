var http = require('http');
http.get('http://localhost:3000/taqueria-el-guero', function(r) {
  var d = '';
  r.on('data', function(c) { d += c; });
  r.on('end', function() {
    var idx = d.indexOf('title="Facebook"');
    if (idx > -1) {
      console.log('FOUND at', idx);
      console.log(d.substring(Math.max(0, idx - 200), idx + 300));
    } else {
      console.log('NOT FOUND');
    }
  });
});
