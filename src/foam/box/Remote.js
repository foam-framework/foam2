foam.CLASS({
  package: 'foam.box',
  name: 'Remote',
  properties: [
    {
      class: 'String',
      name: 'clientClass'
    }
  ],
  methods: [
    function installInClass(cls) {
      var clientClass = this.clientClass || cls.getAxiomsByClass(foam.core.Implements)[0].path;

      cls.installAxiom(foam.core.Method.create({
        name: 'outputJSON',
        code: function(outputter) {
          var cls = this.__context__.lookup(clientClass, true);

          if ( ! cls ) {
            throw new Error('Could not find ' + clientClass + ' to serialize ' + this.cls_.id);
          }

          if ( ! foam.core.Stub.isInstance(cls.getAxiomByName('delegate')) ) {
            throw new Error('Expected stub property to be named "delegate" for ' + cls.id);
          }

          var X = this.__subContext__;
          var registry = X.registry;

          var box = foam.box.SkeletonBox.create({ data: this }, X);
          box = registry.register(null, null, box);

          var obj = cls.create(null, X);
          obj.delegate = box;

          outputter.output(obj);
        }
      }));
    }
  ]
});
