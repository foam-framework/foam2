/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'FObjectView',
  extends: 'foam.u2.Controller',

  documentation: 'View for editing FObjects.',

  axioms: [
    foam.u2.CSS.create({
//      code: '^:read-only { border: none; background: rgba(0,0,0,0); }'
    })
  ],

  properties: [
    {
      class: 'String',
      name: 'objectClass',
      postSet: function(oldValue, newValue) {
        if ( newValue !== oldValue ) {
          var m = this.lookup(newValue, true);
          if ( m ) {
            this.data = m.create(this.data);
          }
        }
      }
    },
    {
      name: 'data',
      view: 'foam.u2.DetailView',
      postSet: function(_, data) {
        if ( ! data ) {
          this.objectClass = '';
        } else if ( data.cls_.id != this.objectClass ) {
          this.objectClass = data.cls_.id;
        }
      }
    }
  ],

  methods: [
    function initE() {
      this
        .add(this.OBJECT_CLASS)
        .add(this.DATA);
    }
  ]
});
