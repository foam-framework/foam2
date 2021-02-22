/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'ValueView',
  extends: 'foam.u2.View',

  documentation: 'Just shows the value of data as a string.',

  properties: [
    {
      name: 'prop'
    }
  ],

  methods: [
    function fromProperty(prop) {
      this.SUPER(prop);
      this.prop = prop;
    },

    function initE() {
      this.SUPER();
      var self = this;
      var prop = this.prop;

      if ( prop && prop.unitPropValueToString ) {
        this.add(this.data$.map(data => {
          return prop.unitPropValueToString(self.__subContext__, data, prop.unitPropName);
        }));
      } else {
        this.add(this.data$);
      }
    }
  ]
});
