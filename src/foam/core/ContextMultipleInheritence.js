/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

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
        // TODO(adamvy): Revisit this.  Consider adding a MultiContext object which
        // implemented context multiple inheritence property.
        if ( foam.core.FObject.isInstance(opt_args) ) {
          var obj = opt_args;

          var exports = obj.cls_.getAxiomsByClass(foam.core.Export);

          if ( ( ! exports ) || ( ! exports.length ) ) return X;

          opt_args = exports[0].getExportMap.call(obj);
        }

        return this.__context__.createSubContext.call(X, opt_args, opt_name);
      }
    }
  ]
});

foam.SCRIPT({
  package: 'foam.core',
  name: 'ContextMultipleInheritenceScript',
  requires: [
    'foam.core.internal.ContextMultipleInheritence',
  ],
  code: function() {
    var tmp = foam.core.internal.ContextMultipleInheritence.create();
    tmp.setPrivate_('__context__', foam.__context__);
    foam.__context__ = tmp.__subContext__;
  }
})
