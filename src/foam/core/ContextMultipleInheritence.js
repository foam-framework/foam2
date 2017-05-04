foam.CLASS({
  package: 'foam.core.internal',
  name: 'ContextMultipleInheritence',
  exports: [
    'createSubContext'
  ],
  methods: [
    {
      class: 'ContextMethod',
      name: 'createSubContext',
      code: function createSubContext(X, opt_args, opt_name) {
        if ( foam.core.FObject.isInstance(opt_args) ) {
          var obj = opt_args;

          var exports = obj.cls_.getAxiomsByClass(foam.core.Export);

          if ( ! exports ) return X;

          opt_args = exports[0].getExportMap.call(obj);
        }

        return this.__context__.createSubContext.call(X, opt_args, opt_name);
      }
    }
  ]
});

(function() {
  var tmp = foam.core.internal.ContextMultipleInheritence.create();
  tmp.setPrivate_('__context__', foam.__context__);
  foam.__context__ = tmp.__subContext__;
})();
