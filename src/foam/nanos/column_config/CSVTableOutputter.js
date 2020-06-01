foam.CLASS({
  package: 'foam.nanos.column',
  name: 'CSVTableOutputter',
  methods: [
    function arrayToCSV(arrayOfValues) {
      var output = [];
      for ( var row of arrayOfValues ) {
        output.push(row.join(','));
      }
      return output.join('\n');
    }
  ]
});