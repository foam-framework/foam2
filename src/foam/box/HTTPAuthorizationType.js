foam.ENUM({
  package: 'foam.box',
  name: 'HTTPAuthorizationType',

  documentation: 'Types of HTTP Athorization',

  values: [
    {
      name: 'NONE',
      label: 'None',
      ordinal: 0
    },
    // {
    //   name: 'BASIC',
    //   label: 'Basic',
    //   ordinal: 1
    // },
    {
      name: 'BEARER',
      label: 'Bearer',
      ordinal: 2
    }
  ]
});
