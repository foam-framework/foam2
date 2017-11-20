foam.CLASS({
  package: 'foam.lib.json',
  name: 'UnknownFObject',

  documentation: 'A FObject for unknown model',

  properties: [
    {
      class: 'String',
      name: 'Json'
    }
  ],

  methods: [
    {
      name: 'fclone',
      javaReturns: 'foam.core.FObject',
      javaCode: 'return new UnknownFObject(getX(), getJson());'
    },
    {
      name: 'compareTo',
      args: [
        {
          name: 'o',
          javaType: 'Object'
        }
      ],
      javaReturns: 'int',
      javaCode:
`if ( o == this ) return 0;
if ( o == null ) return 1;
if ( ! ( o instanceof UnknownFObject ) ) return 1;
return getJson().equals(((UnknownFObject) o).getJson()) ? 0 : 1;`
    },
    {
      name: 'toString',
      javaCode: 'return getJson();'
    }
  ]
});