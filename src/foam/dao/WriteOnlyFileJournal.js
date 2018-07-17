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
          protected Outputter outputter_ = new Outputter(OutputterMode.STORAGE);
          // FIXME: the following line fails compilation
          //outputter_.setOutputClassNames(getOutputClassNames());
        `);
      }
    }
  ],

  methods: [
    {
      name: 'put',
      synchronized: true,
      javaCode: `
        // FIXME: can't get this line to compile in cls.extras.push
        outputter_.setOutputClassNames(getOutputClassNames());

        // Since only writing, dispense with id lookup and delta
        String record = outputter_.stringify((FObject) obj);
        write_("p(" + record + ")");
      `
    },
    {
      name: 'replay',
      javaCode: ``
    }
  ]
});
