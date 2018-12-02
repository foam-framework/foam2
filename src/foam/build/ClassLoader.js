foam.INTERFACE({
  package: 'foam.build',
  name: 'ClassLoader',
  methods: [
    {
      name: 'load',
      async: true,
      returns: 'Class',
      args: [ { class: 'String', name: 'id' } ]
    }
  ]
});
