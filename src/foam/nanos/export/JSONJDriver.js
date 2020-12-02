/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.export',
  name: 'JSONJDriver',
  implements: [ 'foam.nanos.export.ExportDriver' ],

  documentation: 'Class for exporting data from a DAO to JSON/J',

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.json.Outputter',
      name: 'outputter',
      factory: function() {
        return {
          pretty: true,
          strict: true,
          formatDatesAsNumbers: true,
          outputDefaultValues: false,
          useShortNames: false,
          useTemplateLiterals: true,
          propertyPredicate: function(o, p) { return ! p.storageTransient; }
        };
       },
       hidden:true
    }
  ],

  methods: [
    function exportFObject(X, obj) {
      return 'p(' + this.outputter.stringify(obj) + ')\r\n';
    },

    function exportDAO(X, dao) {
      var output = '';
      return dao.select(function(o) {
        output += this.exportFObject(X, o);
      }.bind(this)).then(function() { return output; });
    }
  ]
});
