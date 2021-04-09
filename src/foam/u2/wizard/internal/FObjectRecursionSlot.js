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
    {
      name: 'excludeAxioms',
      class: 'StringArray',
      factory: function () {
        return [
          'foam.dao.ManyToManyRelationshipAxiom',
          'foam.dao.OneToManyRelationshipAxiom',
          'foam.dao.DAOProperty'
        ];
      }
    },
    'cleanup_', // detachable to cleanup old subs when obj changes
  ],

  methods: [
    function init() {
      this.onDetach(this.cleanup);
      var debug_updateCalls = 0;
      var update = function (obj, parentRefs) {
        debug_updateCalls++;
        if ( parentRefs.includes(obj) ) {
          this.cleanup();
          return;
        }
        this.value = { obj: obj, cause: this.obj$ };
        this.subToProps_(obj);
      };
      // this.slot(update);
      this.onDetach(this.obj$.sub(() => {
        update.call(this, this.obj, this.parentRefs); }));
      this.onDetach(this.parentRefs$.sub(() => {
        update.call(this, this.obj, this.parentRefs); }));
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
        if ( this.excludeAxioms.some(v => prop.cls_.id == v) ) continue;
        let prop$ = prop.toSlot(o);
        if ( foam.core.FObjectProperty.isInstance(prop) ) {
          if ( this.parentRefs.includes(prop$) ) continue;

          let propR$ = this.cls_.create({
            obj$: prop$,
            parentRefs: [ ...this.parentRefs, prop$, o ],
          }, this);

          cleanup.onDetach(propR$.sub(() => {
            // ???: make this log a debug mode feature
            // console.log('update', o && o.cls_.id, prop.name, o, propR$, prop, this);
            this.value = { obj: o, cause: propR$ };
          }));

          continue;
        }
        if ( foam.core.FObjectArray.isInstance(prop) ) {
          let innerCleanup = foam.core.FObject.create();
          let updateArray = arry => {
            innerCleanup.detach();
            innerCleanup = foam.core.FObject.create();
            for ( let elem of arry ) {
              let elemR$ = this.cls_.create({
                obj: elem,
                parentRefs: [ ...this.parentRefs, prop$, o ]
              }, this);
              innerCleanup.onDetach(elemR$.sub(() => {
                this.value = { obj: elem, cause: elemR$ };
              }));
            }
          };
          cleanup.onDetach(prop$.sub(() => {
            updateArray(prop$.get());
            this.value = { obj: o, cause: prop$ };
          }));
          updateArray(prop$.get());
          continue;
        }
        prop$.sub(() => {
          this.value = { obj: o, cause: prop$ };
        });
      }
    }
  ],

  listeners: [
    function cleanup() { this.cleanup_ && this.cleanup_.detach(); },
    function invalidate() { this.clearProperty('value'); }
  ]
});
