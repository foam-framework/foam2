/**
 * @license
 * Copyright 2016 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.core',
  name: 'Duration',
  extends: 'Long',

  documentation: `
    A length of time in milliseconds. Further refined in TableCellFormatter.js
    to make values human-readable when displayed in tables.
  `,

  static: [
    {
      name: 'duration',
      code: function(value) {
        value = Math.round(value);
        var days = Math.floor(value / 86400000);
        value -= days * 86400000;
        var hours = Math.floor(value / 3600000);
        value -= hours * 3600000;
        var minutes = Math.floor(value / 60000);
        value -= minutes * 60000;
        var seconds = Math.floor(value / 1000);
        value -= seconds * 1000;
        var milliseconds = value % 1000;

        // For long durations, don't show smaller components
        if ( days ) {
          minutes = 0;
          seconds = 0;
          milliseconds = 0;
        } else if ( hours ) {
          seconds = 0;
          milliseconds = 0;
        } else if ( minutes ) {
          milliseconds = 0;
        }

        var formatted = [[days, 'd'], [hours, 'h'], [minutes, 'm'], [seconds, 's'], [milliseconds, 'ms']].reduce((acc, cur) => {
          return cur[0] > 0 ? acc.concat([cur[0] + cur[1]]) : acc;
        }, []).join(' ');

        return formatted || '0ms';
      }
    }
  ]
});
