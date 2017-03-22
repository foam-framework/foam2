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
        // Predicate is already a thing in Swift so best to avoid using that
        // name. TODO find out if there's a better way to do this refinement.
        cls.model_.swiftName = 'FoamPredicate';
      }
    }
  ]
});
