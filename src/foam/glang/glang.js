/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.glang',
  name: 'AbstractDateGlang',
  extends: 'foam.mlang.AbstractExpr',
  abstract: true,
  requires: [
    'foam.mlang.IdentityExpr',
  ],
  implements: [
    'foam.core.Serializable',
    'foam.mlang.order.Comparator',
  ],
  properties: [
    {
      class: 'foam.mlang.ExprProperty',
      name: 'delegate',
      factory: function() { return this.IdentityExpr.create() }
    }
  ],
  methods: [
    {
      name: 'createStatement',
      javaCode: 'return "";'
    },
    {
      name: 'prepareStatement',
      javaCode: '// noop'
    },
    {
      name: 'compare',
      code: function(o1, o2) {
        return foam.Date.compare(this.f(o1), this.f(o2));
      },
      javaCode: `
        java.util.Date date1 = (java.util.Date) f(o1);
        java.util.Date date2 = (java.util.Date) f(o2);
        return date1.compareTo(date2);
      `
    }
  ]
});

foam.CLASS({
  package: 'foam.glang',
  name: 'EndOfTimeSpan',
  extends: 'foam.glang.AbstractDateGlang',
  properties: [
    {
      class: 'Long',
      name: 'timeSpanMs'
    }
  ],
  methods: [
    {
      name: 'f',
      code: function(obj) {
        var ts = new Date(this.delegate.f(obj));
        var ms = this.timeSpanMs;
        return new Date(Math.floor(ts.getTime() / ms) * ms + ms - 1);
      },
      javaCode: `
        java.util.Date ts = (java.util.Date) getDelegate().f(obj);
        long ms = getTimeSpanMs();
        return new java.util.Date((ts.getTime() / ms) * ms + ms - 1);
      `
    }
  ]
});

foam.CLASS({
  package: 'foam.glang',
  name: 'StartOfHour',
  extends: 'foam.glang.AbstractDateGlang',
  methods: [
    {
      name: 'f',
      code: function(obj) {
        var ts = new Date(this.delegate.f(obj));
        ts.setMinutes(0, 0);
        return ts;
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.glang',
  name: 'EndOfHour',
  extends: 'foam.glang.AbstractDateGlang',
  methods: [
    {
      name: 'f',
      code: function(obj) {
        var ts = new Date(this.delegate.f(obj));
        ts.setMinutes(59, 59);
        ts.setMilliseconds(999);
        return ts;
      },
      javaCode: `
      // Convert to LocalDate
      java.util.Date date = (java.util.Date) getDelegate().f(obj);
      java.time.LocalDate localDate = java.time.Instant.ofEpochMilli(date.getTime()).atZone(java.time.ZoneId.systemDefault()).toLocalDate();

      // Convert to LocalDateTime set to End of Day
      java.time.LocalDateTime localDateTime = localDate.atTime(java.time.LocalTime.MAX);

      // Convert to Date using LocalDateTime
      return java.util.Date.from(localDateTime.atZone(java.time.ZoneId.systemDefault()).toInstant());
      `
    }
  ]
});

foam.CLASS({
  package: 'foam.glang',
  name: 'StartOfDay',
  extends: 'foam.glang.AbstractDateGlang',
  methods: [
    {
      name: 'f',
      code: function(obj) {
        var ts = new Date(this.delegate.f(obj));
        ts.setHours(0, 0, 0, 0);
        return ts;
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.glang',
  name: 'EndOfDay',
  extends: 'foam.glang.AbstractDateGlang',
  methods: [
    {
      name: 'f',
      code: function(obj) {
        var ts = new Date(this.delegate.f(obj));
        ts.setHours(23, 59, 59);
        ts.setMilliseconds(999);
        return ts;
      },
      javaCode: `
// Convert to LocalDate
java.util.Date date = (java.util.Date) getDelegate().f(obj);
java.time.LocalDate localDate = java.time.Instant.ofEpochMilli(date.getTime()).atZone(java.time.ZoneId.systemDefault()).toLocalDate();

// Convert to LocalDateTime set to End of Day
java.time.LocalDateTime localDateTime = localDate.atTime(java.time.LocalTime.MAX);

// Convert to Date using LocalDateTime
return java.util.Date.from(localDateTime.atZone(java.time.ZoneId.systemDefault()).toInstant());
      `
    }
  ]
});

foam.CLASS({
  package: 'foam.glang',
  name: 'StartOfWeek',
  extends: 'foam.glang.AbstractDateGlang',
  properties: [
    {
      class: 'Int',
      name: 'startOfWeek',
      documentation: 'Value between 0 - Sunday and 6 - Saturday inclusive.  Indicates which day is considered the first day of a new week.',
      min: 0,
      max: 6,
      value: 0
    }
  ],
  methods: [
    {
      name: 'f',
      code: function(obj) {
        var ts = new Date(this.delegate.f(obj));
        ts.setDate(ts.getDate() - ((ts.getDay() - this.startOfWeek + 7) % 7));
        ts.setHours(0, 0, 0, 0);
        return ts;
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.glang',
  name: 'EndOfWeek',
  extends: 'foam.glang.AbstractDateGlang',
  properties: [
    {
      class: 'Int',
      name: 'startOfWeek',
      documentation: 'Value between 0 - Sunday and 6 - Saturday inclusive.  Indicates which day is considered the first day of a new week.',
      min: 0,
      max: 6,
      value: 0
    }
  ],
  methods: [
    {
      name: 'f',
      code: function(obj) {
        var ts = new Date(this.delegate.f(obj));

        var date = ts.getDate();
        var endOfWeek = (this.startOfWeek + 6) % 7;
        var day = ts.getDay();
        var daysToEndOfWeek = (endOfWeek - day + 7) % 7;
        
        ts.setDate(date + daysToEndOfWeek);

        ts.setHours(23, 59, 59);
        ts.setMilliseconds(999);

        return ts;
      },
      javaCode: `
// Convert to LocalDate
java.util.Date date = (java.util.Date) getDelegate().f(obj);
java.time.LocalDate localDate = java.time.Instant.ofEpochMilli(date.getTime()).atZone(java.time.ZoneId.systemDefault()).toLocalDate();

// Set to end of week
localDate = localDate.plusDays(6 - (long)localDate.getDayOfWeek().getValue());

// Convert to LocalDateTime set to End of Day
java.time.LocalDateTime localDateTime = localDate.atTime(java.time.LocalTime.MAX);

// Convert to Date using LocalDateTime
return java.util.Date.from(localDateTime.atZone(java.time.ZoneId.systemDefault()).toInstant());
      `
    }
  ]
});

foam.CLASS({
  package: 'foam.glang',
  name: 'StartOfMonth',
  extends: 'foam.glang.AbstractDateGlang',
  methods: [
    {
      name: 'f',
      code: function(obj) {
        var ts = new Date(this.delegate.f(obj));
        ts.setMonth(ts.getMonth());
        ts.setDate(1);
        ts.setHours(0, 0, 0, 0);
        return ts;
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.glang',
  name: 'EndOfMonth',
  extends: 'foam.glang.AbstractDateGlang',
  methods: [
    {
      name: 'f',
      code: function(obj) {
        var ts = new Date(this.delegate.f(obj));
        ts.setMonth(ts.getMonth() + 1);
        ts.setDate(0);
        ts.setHours(23, 59, 59);
        ts.setMilliseconds(999);
        return ts;
      },
      javaCode: `
// Convert to LocalDate
java.util.Date date = (java.util.Date) getDelegate().f(obj);
java.time.LocalDate localDate = java.time.Instant.ofEpochMilli(date.getTime()).atZone(java.time.ZoneId.systemDefault()).toLocalDate();

// Set to end of month
localDate = localDate.plusDays((long)localDate.lengthOfMonth() - (long)localDate.getDayOfMonth());

// Convert to LocalDateTime set to End of Day
java.time.LocalDateTime localDateTime = localDate.atTime(java.time.LocalTime.MAX);

// Convert to Date using LocalDateTime
return java.util.Date.from(localDateTime.atZone(java.time.ZoneId.systemDefault()).toInstant());
      `
    }
  ]
});

foam.CLASS({
  package: 'foam.glang',
  name: 'StartOfQuarter',
  extends: 'foam.glang.AbstractDateGlang',
  methods: [
    {
      name: 'f',
      code: function(obj) {
        var ts = new Date(this.delegate.f(obj));
        ts.setMonth(Math.floor(ts.getMonth() / 3) * 3);
        ts.setDate(0);
        ts.setHours(0, 0, 0, 0);
        return ts;
      },
    }
  ]
});

foam.CLASS({
  package: 'foam.glang',
  name: 'EndOfQuarter',
  extends: 'foam.glang.AbstractDateGlang',
  methods: [
    {
      name: 'f',
      code: function(obj) {
        var ts = new Date(this.delegate.f(obj));
        // N % 3 is how many months into the quarter we are 0 1 or 2
        // 2 - ( N % 3 ) is how many months left till EOQ.
        // N + ( 2 - ( N % 3 ) ) is the last month of this quarter
        // N + ( 2 - ( N % 3 ) ) + 1 is the first month of next quarter
        // which reduces to N + 3 - ( N % 3 ).
        ts.setMonth(ts.getMonth() + 3 - ( ts.getMonth() % 3 ));
        ts.setDate(0);
        ts.setHours(23, 59, 59);
        ts.setMilliseconds(999);
        return ts;
      },
      javaCode: `
// Convert to LocalDate
java.util.Date date = (java.util.Date) getDelegate().f(obj);
java.time.LocalDate localDate = java.time.Instant.ofEpochMilli(date.getTime()).atZone(java.time.ZoneId.systemDefault()).toLocalDate();

// Set month to end of quarter
localDate = localDate.plusMonths(2 - ((long)localDate.getMonthValue() - 1) % 3);

// Set to end of month
localDate = localDate.plusDays((long)localDate.lengthOfMonth() - (long)localDate.getDayOfMonth());

// Convert to LocalDateTime set to End of Day
java.time.LocalDateTime localDateTime = localDate.atTime(java.time.LocalTime.MAX);

// Convert to Date using LocalDateTime
return java.util.Date.from(localDateTime.atZone(java.time.ZoneId.systemDefault()).toInstant());
      `
    }
  ]
});

foam.CLASS({
  package: 'foam.glang',
  name: 'StartOfYear',
  extends: 'foam.glang.AbstractDateGlang',
  methods: [
    {
      name: 'f',
      code: function(obj) {
        var ts = new Date(this.delegate.f(obj));
        ts.setMonth(0);
        ts.setDate(1);
        ts.setHours(0, 0, 0, 0);
        return ts;
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.glang',
  name: 'EndOfYear',
  extends: 'foam.glang.AbstractDateGlang',
  methods: [
    {
      name: 'f',
      code: function(obj) {
        var ts = new Date(this.delegate.f(obj));
        ts.setMonth(11);
        ts.setDate(31);
        ts.setHours(23, 59, 59);
        ts.setMilliseconds(999);
        return ts;
      },
      javaCode: `
java.util.Date date = (java.util.Date) getDelegate().f(obj);

java.time.Instant t = java.time.Instant.ofEpochMilli(date.getTime())
  .atZone(java.time.ZoneId.systemDefault())
  .toLocalDate()
  .with(java.time.temporal.TemporalAdjusters.lastDayOfYear())
  .atTime(23, 59, 59)
  .atZone(java.time.ZoneId.systemDefault())
  .toInstant();

return java.util.Date.from(t);
      `
    }
  ]
});
