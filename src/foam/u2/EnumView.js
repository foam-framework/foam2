/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2',
  name: 'EnumView',
  extends: 'foam.u2.view.ChoiceView',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.nanos.auth.GroupPermissionJunction'
  ],

  imports: [
    'auth',
    'groupPermissionJunctionDAO'
  ],

  properties: [
    {
      class: 'Class',
      name: 'of',
      required: true
    },
    {
      name: 'hasAllReadPermission',
      expression: async function(of) {
        if ( of ) {
          var allReadPermission = this.of.name.toLowerCase() + '.read.*';
          return await this.auth.check(null, allReadPermission);
        } else {
          return false;
        }
      }
    },
    {
      name: 'choices',
      expression: function(of, hasAllReadPermission) {
        if ( of ) {
          if ( hasAllReadPermission ) {
            return of.VALUES.map((v) => {
              return [v, v.label];
            });
          } else {
            return [];
          }
        } else {
          return [];
        }
      }
    }
  ],

  methods: [
    function fromProperty(p) {
      this.SUPER(p);
      if ( ! this.of ) this.of = p.of;
    }
  ]
});
