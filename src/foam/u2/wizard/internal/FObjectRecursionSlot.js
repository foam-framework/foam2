/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.internal',
  name: 'FObjectRecursionSlot',
  extends: 'foam.core.SimpleSlot',
  documentation: `
    Updates when propertyChange is published for any property of an FObject
    recursively.

    To ensure subsequent slots publish an update even when sub-properties are
    updated, the value of this slot is a wrapper object containing the FObject
    being listened to; it is in the following format: { obj: [FObject] }
  `,
  requires: [ 'foam.core.ExpressionSlot' ],

  properties: [
    {
      name: 'obj',
      class: 'FObjectProperty',
      of: 'foam.core.FObject'
    },
    {
      name: 'parentRefs',
      class: 'Array',
      documentation: `
        Object references already seen. This is used to prevent infinite
        recursion.
      `
    },
    {
      name: 'testProp',
      class: 'Array'
    },
    {
      name: 'value',
      factory: function() {
        return { obj: this.obj, cause: null };
      }
    },
    'cleanup_', // detachable to cleanup old subs when obj changes
  ],

  methods: [
    function init() {
      this.onDetach(this.cleanup);
      var debug_updateCalls = 0;
      var update = function (obj, parentRefs) {
        console.log('one of these called');
        debug_updateCalls++;
        if ( parentRefs.includes(obj) ) {
          this.cleanup();
          return;
        }
        this.value = { obj: obj, cause: this.obj$ };
        this.subToProps_(obj);
      };
      // this.slot(update);
      this.obj$.sub(() => { update.call(this, this.obj, this.parentRefs); });
      this.parentRefs$.sub(() => { update.call(this, this.obj, this.parentRefs); });
      update.call(this, this.obj, this.parentRefs);
    },
    function set() { /* nop */ },
    function subToProps_(o) {
      this.cleanup();
      var cleanup = foam.core.FObject.create();
      this.cleanup_ = cleanup;

      if ( ! (o && o.cls_) ) return;
      var props = o.cls_.getAxiomsByClass(foam.core.Property);

      for ( let prop of props ) {
        let prop$ = prop.toSlot(o);
        if ( prop.cls_.id != 'foam.core.FObjectProperty' ) {
          prop$.sub(() => {
            this.value = { obj: o, cause: prop$ };
          });
          continue;
        }
        if ( this.parentRefs.includes(prop$) ) continue;

        let propR$ = this.cls_.create({
          obj$: prop$,
          parentRefs: [ ...this.parentRefs, prop$, o ],
        }, this);

        cleanup.onDetach(propR$.sub(() => {
          this.value = { obj: o, cause: propR$ };
        }));
      }
    }
  ],

  listeners: [
    function cleanup() { this.cleanup_ && this.cleanup_.detach(); },
    function invalidate() { this.clearProperty('value'); }
  ]
});
