foam.CLASS({
  package: 'foam.nanos.pm',
  name: 'PMBox',
  extends: 'foam.box.ProxyBox',

  properties: [
    {
      name: 'classType',
      class: 'Class'
    },
    {
      name: 'name',
      class: 'String'
    }
  ],

  methods: [
    {
      name: 'send',
      javaCode: `
      PM pm = new PM(getClassType(), getName());
      try {
        getDelegate().send(msg);
      } finally {
        pm.log(getX());
      }
      `
    }
  ]
});
