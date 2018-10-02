foam.CLASS({
  package: 'foam.dao',
  name: 'WriteOnlyFileJournal',
  extends: 'foam.dao.FileJournal',

  properties: [
    {
      name: 'outputClassNames',
      class: 'Boolean',
      value: false
    },
    {
      name: 'outputter',
      javaFactory: `
        return new foam.lib.json.Outputter(foam.lib.json.OutputterMode.STORAGE)
          .setOutputClassNames(getOutputClassNames());
      `
    }
  ],

  methods: [
    {
      name: 'put_',
      synchronized: true,
      javaCode: `
        try {
          // Since only writing, dispense with id lookup and delta
          String record = getOutputter().stringify(nu);
          if ( ! foam.util.SafetyUtil.isEmpty(record) ) {
            write_(sb.get()
              .append("p(")
              .append(record)
              .append(")")
              .toString());
          }
        } catch ( Throwable t ) {
          throw new RuntimeException(t);
        }
      `
    },
    {
      name: 'replay',
      javaCode: `
        return;
      `
    }
  ]
});
