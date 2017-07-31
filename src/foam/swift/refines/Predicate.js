foam.INTERFACE({
  refines: 'foam.mlang.predicate.Predicate',
  methods: [
    {
      name: 'f',
      swiftReturnType: 'Bool',
      swiftEnabled: true,
      args: [
        'obj'
      ]
    },
  ],
  axioms: [
    {
      installInClass: function(cls) {
        // Predicate is already a thing in Swift we avoid using that name.
        cls.model_.swiftName = 'FoamPredicate';
      }
    }
  ]
});
