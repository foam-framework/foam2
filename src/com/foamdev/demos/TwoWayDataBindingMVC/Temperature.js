/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.foamdev.demos.twoWayDataBindingMVC',
  name: 'Temperature',

  properties: [
    { class: 'Float', name: 'f' , view: { class: 'foam.u2.TextField', onKey: true, className: 'fahrenheit' } },
    { class: 'Float', name: 'c' , view: { class: 'foam.u2.TextField', onKey: true, className: 'celsius' } }
  ],
  
  methods: [
    function init() {
      this.f$.relateTo(
        this.c$,
        function f2c(c) {
          console.log('f2c', c); 
          return 5/9 * ( c - 32 );
        },
        function c2f(f) {
          console.log('c2f', f); 
          return 9/5 * f + 32;
        }
      );
    }
  ]
});
