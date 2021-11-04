foam.LIB({
  name: 'foam.util',

  methods: [
    function maybeMap(f) {
      return input => Array.isArray(input)
        ? input.map(f)
        : f(input)
        ;
    }
  ]
});