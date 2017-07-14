require('../../../foam.js');
require('./functors.js');
require('./fetch.js');

com.google.urlz.JSONFetcher.create({
  url: 'https://api.github.com/search/repositories?q=foam',
  dataPath: [ 'items', '0' ]
}).fetch().then(function(o) {
  console.log('Running cached DObject on itself quickly');
  var ps = [];
  for ( var i = 0; i < 100; i++ ) {
    ps.push(o.f(o, o.__context__).then(function(retrieved) {
      console.log('Retrieved', retrieved);
    }));
  }
  Promise.all(ps).then(function() {
    console.log('Waiting 1min, then running cached DObject on itself');
    setTimeout(function() {
      o.f(o, o.__context__).then(function(retrieved) {
        console.log('Retrieved', retrieved);
      });
    }, 60000);
  });
});
