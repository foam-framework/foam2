foam.INTERFACE({
  package: 'foam.build',
  name: 'ClassLoader',
  methods: [
    {
      name: 'load',
      async: true,
      type: 'Class',
      args: [ { class: 'String', name: 'id' } ]
    }
  ]
});
