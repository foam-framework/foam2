foam.CLASS({
  package: 'foam.dao',
  name: 'WriteOnlyFileJournal',
  extends: 'foam.dao.FileJournal',

  javaImports: [
    'foam.core.FObject',
    'foam.lib.json.Outputter',
    'foam.lib.json.OutputterMode'
  ],

  properties: [
    {
      name: 'outputClassNames',
      class: 'Boolean',
      value: false
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function (cls) {
        cls.extras.push(`
          protected Outputter outputter_ = new Outputter(OutputterMode.STORAGE)
              .setOutputClassNames(getOutputClassNames());
        `);
      }
    }
  ],

  methods: [
    {
      name: 'put',
      synchronized: true,
      javaCode: `
        try {
          // Since only writing, dispense with id lookup and delta
          String record = outputter_.stringify((FObject) obj);
          write_("p(" + record + ")");
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
