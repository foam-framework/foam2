
foam.ENUM({
  package: 'foam.nanos.om',
  name: 'DateFrequency',

  properties: [
    {
      class: 'foam.mlang.ExprProperty',
      name: 'startExpr'
    },
    {
      class: 'foam.mlang.ExprProperty',
      name: 'endExpr'
    },
    {
      class: 'Int',
      name: 'numLineGraphPoints',
      expression: function(numBarGraphPoints) {
        return numBarGraphPoints * 2;
      }
    },
    {
      class: 'Int',
      name: 'numBarGraphPoints'
    }
  ],

  values: [
    {
      name: 'ONE_MINUTE',
      label: '1min',
      startExpr: { class: 'foam.glang.StartOfMinute' },
      endExpr: { class: 'foam.glang.EndOfMinute' },
      numBarGraphPoints: 60
    },
    {
      name: 'HOURLY',
      label: 'Hourly',
      startExpr: { class: 'foam.glang.StartOfHour' },
      endExpr: { class: 'foam.glang.EndOfHour' },
      numBarGraphPoints: 24
    },
    {
      name: 'DAILY',
      label: 'Daily',
      startExpr: { class: 'foam.glang.StartOfDay' },
      endExpr: { class: 'foam.glang.EndOfDay' },
      numBarGraphPoints: 7
    },
    {
      name: 'WEEKLY',
      label: 'Weekly',
      startExpr: { class: 'foam.glang.StartOfWeek' },
      endExpr: { class: 'foam.glang.EndOfWeek' },
      numBarGraphPoints: 4
    },
    {
      name: 'MONTHLY',
      label: 'Monthly',
      startExpr: { class: 'foam.glang.StartOfMonth' },
      endExpr: { class: 'foam.glang.EndOfMonth' },
      numBarGraphPoints: 4
    },
    {
      name: 'QUARTERLY',
      label: 'Quarterly',
      startExpr: { class: 'foam.glang.StartOfQuarter' },
      endExpr: { class: 'foam.glang.EndOfQuarter' },
      numBarGraphPoints: 4
    },
    {
      name: 'ANNUALLY',
      label: 'Annually',
      startExpr: { class: 'foam.glang.StartOfYear' },
      endExpr: { class: 'foam.glang.EndOfYear' },
      numBarGraphPoints: 6
    },
  ]
});
