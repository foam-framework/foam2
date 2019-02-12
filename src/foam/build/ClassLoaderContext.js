foam.CLASS({
  package: 'foam.build',
  name: 'ClassLoaderContext',
  exports: [
    'aref',
    'acreate'
  ],
  methods: [
    {
      class: 'ContextMethod',
      name: 'aref',
      async: true,
      code: async function(x, id) {
//        console.log("aref(" + id + ")");
        var cls = x.lookup(id, true);
        if ( cls ) return cls;

        return await x.classloader.load(id)
      }
    },
    {
      class: 'ContextMethod',
      name: 'acreate',
      async: true,
      code: async function(x, id, args) {
//        console.log("acreate(" + id + ", " + args);
        var cls = x.lookup(id, true);
        if ( cls ) {
//          console.log("** cls found");
          return cls.create(args, x);
        }

        cls = await x.classloader.load(id);

        return cls.create(args, x);
      }
    }
  ]
});
