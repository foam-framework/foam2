foam.CLASS({
  package: 'foam.core',
  name: 'DateOnly',
  documentation: 'For the purpose of specifying static dates. No time associated with this.',
  properties: [
    {
      class: 'Int',
      name: 'year'
    },
    {
      class: 'Int',
      name: 'month'
    },
    {
      class: 'Int',
      name: 'day'
    }
  ],
  methods: [
    {
      name: 'toString',
      code: function() {
        return `${this.year}-${this.month}-${this.day}`;
      },
      javaCode: `
        StringBuilder sb = new StringBuilder();
        sb.append(getYear());
        sb.append("-");
        if ( String.valueOf(getMonth()).length() == 1 ) sb.append("0");
        sb.append(getMonth());
        sb.append("-");
        if ( String.valueOf(getDay()).length() == 1 ) sb.append("0");
        sb.append(getDay());
        return sb.toString();
      `
    }
  ]

});

foam.CLASS({
  package: 'foam.core',
  name: 'DateOnlyProperty',
  extends: 'foam.core.FObjectProperty',
  documentation: 'For the purpose of specifying static dates. No time associated with this.',
  properties: [
    {
      class: 'Class',
      name: 'of',
      value: 'foam.core.DateOnly'
    },
    {
      name: 'view',
      value: {
        class: 'foam.u2.view.date.DateOnlyView'
      }
    },
    {
      name: 'validationTextVisible',
      value: true
    }
  ]
});
