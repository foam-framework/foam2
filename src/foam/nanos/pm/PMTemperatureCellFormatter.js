/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.pm',
  name: 'PMTemperatureCellFormatter',
  implements: ['foam.u2.view.Formatter'],
  requires: ['foam.nanos.pm.TemperatureCView'],
  methods: [
    function format(e, value, obj, axiom) {
      e.tag({ class: 'foam.nanos.pm.TemperatureCView', totalTime: value });
    }
  ]
});
