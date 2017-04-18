foam.CLASS({
  package: 'foam.java',
  name: 'CodeProperty',
  extends: 'Property',
  properties: [
    {
      name: 'adapt',
      value: function(o, v) {
        if ( typeof v === 'string' ) return foam.java.Code.create({ data: v });
        return v;
      }
    }
  ]
});
