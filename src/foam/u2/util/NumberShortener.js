/**
* @license
* Copyright 2020 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.u2.util',
  name: 'NumberShortener',
  documentation: `
    A utility class to truncate numbers for displays. This is to allow really
    large values to be displayed nicely on table columns or elements with minimal
    space.
  `,

  static: [
    /*
    * shortenNumber
    * Takes a number (no floats) and shortens the number for display
    * It uses precision and optional currency to appropriately display a number
    * without breaking containers
    */
    function shortenNumber(number, precision, currency) {
      var brackets = ['K', 'M', 'B', 'T'];
      var num = String(number);
      var shortened = '';

      if ( ! this.requiresShortening_(num, currency) ) {
        return currency ? currency.format(number) : num;
      }

      var flatValue = currency ? num.substring(0, num.length - currency.precision) : num;
      brackets.forEach((bracket, index) => {
        var numZeroes = (index + 1) * 3;
        var lowerBound = Math.pow(10, numZeroes);
        var upperBound = lowerBound * 1000;
        if ( flatValue >= lowerBound && flatValue < upperBound ) {
          var maxPrecision = precision <= numZeroes ? precision : numZeroes;
          var value = precision ? (flatValue/lowerBound).toFixed(maxPrecision) : Math.floor(flatValue/lowerBound);
          shortened = currency ? `${currency.id}${currency.symbol} ${value}${bracket}` : `${value}${bracket}`;
        }
      });
      return shortened;
    },

    function requiresShortening_(number, currency) {
      var decimal = number;
      if ( currency ) {
        if ( decimal.length < currency.precision ) return false;
        decimal = number.substring(0, number.length - currency.precision );
      }
      return decimal / 1000 >= 1;
    }
  ]
});
