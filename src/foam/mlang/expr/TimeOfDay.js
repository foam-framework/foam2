/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.mlang.expr',
  name: 'TimeOfDay',
  extends: 'foam.mlang.AbstractExpr',
  implements: [ 'foam.core.Serializable' ],

  javaImports: [
    'java.time.LocalDate',
    'java.time.ZoneId',
    'java.util.Date'
  ],

  properties: [
    {
      class: 'Int',
      name: 'hour'
    },
    {
      class: 'Int',
      name: 'minute'
    },
    {
      class: 'Int',
      name: 'second'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.Country',
      name: 'country'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.TimeZone',
      name: 'timezone',
      required: true
    }
  ],

  methods: [
    {
      name: 'f',
      code: function() {
        var typeToIdx = {
          year: 0,
          month: 1,
          day: 2
        };
        var zonetime = new Intl.DateTimeFormat('default', {
          timeZone: this.timezone,
          year: "numeric",
          month: "2-digit",
          day: "2-digit"
        });
        var formatted = zonetime.formatToParts(new Date());
        var p = {};
        for ( var i = 0 ; i < formatted.length ; i++ ) {
          var { type, value } = formatted[i];
          var offset = typeToIdx[type];

          if ( ! (offset === undefined) ) {
            p[type] = parseInt(value, 10);
          }
        }
        var d = new Date(p.year, p.month, p.day, this.hour, this.minute, thie.second);
        return d;
      },
      javaCode: `
        var zone = ZoneId.of(getTimezone());
        var time = LocalDate.now(zone).atStartOfDay(zone);
        time = time.plusHours(getHour());
        time = time.plusMinutes(getMinute());
        time = time.plusSeconds(getSecond());

        return Date.from(time.toInstant());
      `
    },
    {
      name: 'toString',
      type: 'String',
      code: function() {
        return 'TimeOfDay(hour:' + this.hour +
                        ', minute:' + this.minute +
                        ', second:' + this.second +
                        ', country:' + this.country +
                        ', timezone:' + this.timezone + ')';
      },
      javaCode: `
        return "TimeOfDay(hour:" + getHour() +
                        ", minute:" + getMinute() +
                        ", second:" + getSecond() +
                        ", country:" + getCountry() +
                        ", timezone:" + getTimezone() + ")";
      `
    }
  ]
});
