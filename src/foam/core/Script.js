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
      // An instance of the script isn't useful at this point so just blindly
      // execute the code. foam.SCRIPT can be overwritten later to capture the
      // details of the script if need be.
      m.code();
    }
  ]
});
