/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.mlang.expr',
  name: 'DateGroupingExpr',
  extends: 'foam.mlang.AbstractExpr',

  implements: [ 'foam.core.Serializable' ],

  documentation: `
    An expr whose value is the name of a date grouping.
    Currently works with hours, days, weeks, months, and years.
  `,

  javaImports: [
    'foam.nanos.auth.CreatedAware',
    'java.util.Arrays',
    'java.util.Comparator',
    'java.util.Date'
  ],

  properties: [
    {
      class: 'Enum',
      of: 'foam.mlang.expr.DateTypes',
      name: 'dateGroupingType',
      value: 'DAYS'
    },
    {
      class: 'FObjectArray',
      of: 'foam.mlang.expr.DateGrouping',
      name: 'dateGroups',
      factory: function() {
        return [];
      },
      javaFactory: `
        return new foam.mlang.expr.DateGrouping[0];
      `
    }
  ],

  methods: [
    {
      name: 'f',
      code: function(obj) {
        var dateGroupsSorted = [
          ...this.dateGroups
        ];
        
        // TODO: Add a check for overlap between dateGroups and other data validation
        dateGroupsSorted.sort((a, b) => a.low - b.high);

        var objDiffFromTodayMs =  Math.floor(new Date().getTime()) - Math.floor(obj.created.getTime());

        var objDiffFromTodayConverted = objDiffFromTodayMs / this.dateGroupingType.conversionFactorMs;
        
        var groupName = "Unknown Range";

        dateGroupsSorted.forEach(group => {
          if ( 
            objDiffFromTodayConverted >= group.low && 
            objDiffFromTodayConverted < group.high 
          ) groupName = group.name;
        })

        return groupName;
      },
      javaCode: `
        DateGrouping[] dateGroupsSorted = getDateGroups().clone();

        Arrays.sort(dateGroupsSorted, new Comparator<DateGrouping>() {
          public int compare(DateGrouping a, DateGrouping b) {
            return a.getLow() - b.getHigh();
          }
        });

        Date today = new Date();

        CreatedAware createdAwareObj = (CreatedAware) obj;

        Double objDiffFromTodayMs = Math.floor(today.getTime()) - Math.floor(createdAwareObj.getCreated().getTime());

        Double objDiffFromTodayConverted = objDiffFromTodayMs / getDateGroupingType().getConversionFactorMs();

        for ( int i = 0; i < dateGroupsSorted.length; i++ ){
          DateGrouping group = dateGroupsSorted[i];

          if (
            objDiffFromTodayConverted >= group.getLow() &&
            objDiffFromTodayConverted < group.getHigh()
          ) {
            return group.getName();
          }
        }

        return "Unknown Range";
      `
    }
  ]
});
