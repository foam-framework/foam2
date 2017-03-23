foam.INTERFACE({
  refines: 'foam.mlang.predicate.Predicate',
  methods: [
    {
      name: 'f',
      swiftEnabled: true,
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
