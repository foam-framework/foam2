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
      javaCode: `
        var zone = ZoneId.of(getTimezone());
        var time = LocalDate.now(zone).atStartOfDay(zone);
        time = time.plusHours(getHour());
        time = time.plusMinutes(getMinute());
        time = time.plusSeconds(getSecond());

        return Date.from(time.toInstant());
      `
    }
  ]
});
