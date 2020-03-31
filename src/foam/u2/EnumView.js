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
      name: 'choices',
      expression: function(of) {
        return of ? of.VALUES.map(async (v) => {
          console.log(v);
          var allReadPermission = of.name.toLowerCase() + '.read.*';
          var readPermission = of.name.toLowerCase() + '.read.' + v.label.toLowerCase();
        
          var allPermissionsGranted = await this.auth.check(null, allReadPermission);

          if ( allPermissionsGranted ) {
            return [v, v.label];
          } else {
            var readPermissionGranted = await this.auth.check(null, readPermission);
            if ( readPermissionGranted ) {
              return [v, v.label];
            } else {
              return [];
            }
          }
        }) : [];
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
