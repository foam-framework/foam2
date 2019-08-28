/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.foamdev.demos.twoWayDataBindingMVC',
  name: 'Controller',
  extends: 'foam.u2.Controller', // it will automatically exports: ['this as data']

  requires: [
    'com.foamdev.demos.twoWayDataBindingMVC.Temperature',
    'com.foamdev.demos.twoWayDataBindingMVC.TemperatureView',
  ],

  properties: [
    {
      name   : 'temperatureTest',
      factory: function() { return this.Temperature.create(); }
    }
  ],

  methods: [
    function initE() {
      this.tag(this.TemperatureView, { data: this.temperatureTest });
    }
  ]
});
