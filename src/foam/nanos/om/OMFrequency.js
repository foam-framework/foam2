/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.ENUM({
  package: 'foam.nanos.om',
  name: 'OMFrequency',

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
    },
    {
      documentation: 'time in milliseconds of a frequency',
      class: 'Long',
      name: 'frequencyIncrement'
    }
  ],

  values: [
    {
      name: 'OneMinute',
      label: '1Minute',
      startExpr: { class: 'foam.glang.StartOf1Minute' },
      endExpr: { class: 'foam.glang.EndOf1Minute' },
      numBarGraphPoints: 20,
      frequencyIncrement: 60000
    },
    {
      name: 'FiveMinute',
      label: '5Minute',
      startExpr: { class: 'foam.glang.StartOf5Minute' },
      endExpr: { class: 'foam.glang.EndOf5Minute' },
      numBarGraphPoints: 20,
      frequencyIncrement: 300000
    },
    {
      name: 'Hourly',
      label: 'Hourly',
      startExpr: { class: 'foam.glang.StartOfHour' },
      endExpr: { class: 'foam.glang.EndOfHour' },
      numBarGraphPoints: 24,
      frequencyIncrement: 3600000
    },
    {
      name: 'Daily',
      label: 'Daily',
      startExpr: { class: 'foam.glang.StartOfDay' },
      endExpr: { class: 'foam.glang.EndOfDay' },
      numBarGraphPoints: 7,
      frequencyIncrement: 86400000
    }
  ]
});
