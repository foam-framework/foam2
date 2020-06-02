/**
* @license
* Copyright 2020 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.u2.util',
  name: 'NumberUtil',
  documentation: `
    A utility class to truncate numbers for displays. This is to allow really
    large values to be displayed nicely on table columns or elements with minimal
    space.
  `,

  methods: [
    /*
    * shortenNumber
    * Takes a number (no floats) and shortens the number for display
    * It uses precision and optional currency to appropriately display a number
    * without breaking containers
    */
    function shortenNumber(number, precision, currency) {
      var brackets = ['K', 'M', 'B', 'T'];
      var num = String(num);
      var shortened = '';

      if ( ! requiresShortening_(num, currency) ) return num;

      if ( currency ) {
        var flatValue = currency.precision
      }
    },

    function requiresShortening_(number, currency) {
      var decimal = number;
      if ( currency ) {
        if ( decimal.length < currency.precision ) return false;
        decimal = number.substring(0, number.length - ( 1 + currency.precision ));
      }
      return decimal / 1000 >= 1;
    }
  ]
});
