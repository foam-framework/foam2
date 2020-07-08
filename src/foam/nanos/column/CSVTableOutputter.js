/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

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