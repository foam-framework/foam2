foam.CLASS({
  package: 'foam.core',
  name: 'TypeProperty',
  extends: 'foam.core.Property',
  properties: [
    [
      'adapt',
      function(_, v) {
        return v;
      }
    ],
    [
      'assertValue',
      function(v) {
        //foam.assert(foam.core.Type.isSubClass(v), 'type is not a subclass of Type:', v);
      }
    ]
  ]
});

foam.CLASS({
  package: 'foam.core',
  name: 'AbstractMethodReturnTypeRefinement',
  refines: 'foam.core.AbstractMethod',
  properties: [
    {
      class: 'TypeProperty',
      name: 'returns',
      value: 'Void'
    }
  ]
});
