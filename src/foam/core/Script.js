foam.CLASS({
  package: 'foam.core',
  name: 'Script',
  properties: [
    {
      class: 'String',
      name: 'id',
    },
    {
      class: 'Function',
      name: 'code',
    },
    {
      name: 'flags',
    },
    {
      class: 'StringArray',
      name: 'requires',
    },
  ],
});

foam.LIB({
  name: 'foam',
  methods: [
    function SCRIPT(m) {
      var s = foam.core.Script.create(m);
      s.code();
      return s;
    }
  ]
});
