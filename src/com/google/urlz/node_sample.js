require('../../../foam.js');
require('./sample.js');
require('./fetch.js');

com.google.urlz.JSONFetcher.create({
  url: 'https://api.github.com/search/repositories?q=foam',
  dataPath: [ 'items', '0' ]
}).fetch().then(function(o) {
  console.log(foam.json.objectify(o));
});
