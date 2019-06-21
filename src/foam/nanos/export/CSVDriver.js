/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.export',
  name: 'CSVDriver',
  implements: [ 'foam.nanos.export.ExportDriver' ],

  requires: [
    'foam.dao.CSVSink'
  ],

  documentation: 'Class for exporting data from a DAO to CSV',

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.lib.csv.Outputter',
      name: 'outputter',
      factory: function() { return foam.lib.csv.Standard; }
    }
  ],

  methods: [
    function exportFObject(X, obj) {
      return this.outputter.toCSV(obj);
    },
    // function exportDAO(X, dao) {
    //   debugger;
    //   var sink = this.CSVSink.create();
    //   sink.reset();
    //   debugger;
    //   // passing in our CSVSink runs our CSV outputter and
    //   // s.csv is accessing our csv property string.
    //   return dao.select(sink).then( (s) => s.csv);
    // }
    {
      name: 'exportDAO',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'dao',
          class: 'foam.dao.DAO'
        }
      ],
      type: 'String',
      javaCode: `
        foam.dao.CSVSink sink = foam.dao.CSVSink.Builder(x).build();
        sink.reset();
        sink = dao.select(sink);
        return sink.getCsv();
      `
    }
  ]
});
