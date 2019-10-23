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

    // function format(value) {
    //   value = Math.round(value);
    //   var hours = Math.floor(value / 3600000);
    //   value -= hours * 3600000;
    //   var minutes = Math.floor(value / 60000);
    //   value -= minutes * 60000;
    //   var seconds = Math.floor(value / 1000);
    //   value -= seconds * 1000;
    //   var milliseconds = value % 1000;

    //   var formatted = [[hours, 'h'], [minutes, 'm'], [seconds, 's'], [milliseconds, 'ms']].reduce((acc, cur) => {
    //     return cur[0] > 0 ? acc.concat([cur[0] + cur[1]]) : acc;
    //   }, []).join(' ');

    //   return formatted || '0ms';
    // }

    function fromProperty(prop) {
      this.prop = prop;
      this.SUPER(prop);
    }
  ]
});
