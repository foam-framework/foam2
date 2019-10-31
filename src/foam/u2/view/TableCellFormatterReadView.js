/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'TableCellFormatterReadView',
  extends: 'foam.u2.View',

  documentation: `
    A read-only view for properties that calls the tableCellFormatter method for
    that property.
  `,

  imports: [
    'data as parentObj'
  ],

  properties: [
    'prop'
  ],

  methods: [
    function initE() {
      var self = this;
      this.SUPER();
      this.add(this.slot(function(data, prop) {
        if ( ! prop ) return;
        return this.E().callOn(prop.tableCellFormatter, 'format', [ data, self.parentObj, prop ]);
      }));
    },

    function fromProperty(prop) {
      this.prop = prop;
      this.SUPER(prop);
    }
  ]
});
