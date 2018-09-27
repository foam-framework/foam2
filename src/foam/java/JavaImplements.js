foam.CLASS({
  package: 'foam.java',
  name: 'JavaImplements',
  flags: ['java'],
  properties: [
    {
      class: 'String',
      name: 'name'
    }
  ],
  methods: [
    function buildJavaClass(cls) {
      cls.implements = cls.implements.concat(this.name);
    }
  ]
});
