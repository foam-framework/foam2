foam.LIB({
  name: 'foam.u2.wizard.Slot',

  methods: [
    {
      name: 'filter',
      code: function (from, f) {
        var s = foam.core.SimpleSlot.create({ value: from.get() });
        s.onDetach(from.sub(() => {
          var v = from.get();
          if ( f(v) ) s.set(v);
        }));
        return s;
      }
    },
    {
      name: 'blockFramed',
      code: function () {
        return new Promise((resolve) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              resolve();
            });
          });
        });
      }
    }
  ]
});
