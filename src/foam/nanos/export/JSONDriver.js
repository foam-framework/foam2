/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.export',
  name: 'JSONDriver',
  implements: [ 'foam.nanos.export.ExportDriver' ],

  documentation: 'Class for exporting data from a DAO to JSON',

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.json.Outputter',
      name: 'outputter',
      factory: function() { return foam.json.PrettyStrict; },
      hidden:true
    }
  ],

  methods: [
    function exportFObject(X, obj) {
      return this.outputter.stringify(obj);
    },

    function exportDAO(X, dao) {
      var self = this;
      return dao.select().then(function (sink) {
        return self.outputter.stringify(sink.array);
      });
    }
  ]
});
