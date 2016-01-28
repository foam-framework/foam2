var MIN_METRIC_COVERAGE = 90.0;

var data = '';
process.stdin.on('data', function(chunk) { data += chunk; });
process.stdin.on('end', function() {
  var regExp = /[0-9]+([.][0-9]+)?%/g;
  var match;
  do {
    match = regExp.exec(data);
    if (match) {
      var percent = parseFloat(match[0].substring(0, match[0].length - 1));
      if (percent < MIN_METRIC_COVERAGE) {
        console.error('Insufficient code coverage');
        process.exit(1);
      }
    }
  } while (match);
  console.log('Code coverage OK');
  process.exit(0);
});
