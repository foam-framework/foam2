foam.CLASS({
  package: 'foam.glang',
  name: 'EndOfDay',
  properties: [
    {
      name: 'delegate'
    }
  ],
  methods: [
    {
      name: 'f',
      code: function(obj) {
        var ts = new Date(this.delegate.f(obj));
        ts.setHours(23, 59, 59);
        ts.setMilliseconds(999);
        return ts;
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.glang',
  name: 'EndOfWeek',
  properties: [
    {
      name: 'delegate'
    },
    {
      class: 'Int',
      name: 'startOfWeek',
      documentation: 'Value between 0 - Sunday and 6 - Saturday inclusive.  Indicates which day is considered the first day of a new week.',
      min: 0,
      max: 6,
      value: 6
    }
  ],
  methods: [
    {
      name: 'f',
      code: function(obj) {
        var ts = new Date(this.delegate.f(obj));
        ts.setDate(ts.getDate() + 5 + this.startOfWeek - ts.getDay());
        ts.setHours(23, 59, 59);
        ts.setMilliseconds(999);

        return ts;
        return ts.getTime() > Date.now() ? new Date() : ts;
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.glang',
  name: 'EndOfMonth',
  properties: [
    {
      name: 'delegate'
    }
  ],
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
        return ts.getTime() > Date.now() ? new Date() : ts;
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.glang',
  name: 'EndOfQuarter',
  properties: [
    {
      name: 'delegate',
    }
  ],
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
        return ts.getTime() > Date.now() ? new Date() : ts;
      }
    }
  ]
});
