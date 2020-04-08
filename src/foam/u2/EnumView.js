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
    'foam.nanos.auth.Permission'
  ],

  imports: [
    'auth'
  ],

  properties: [
    {
      class: 'Class',
      name: 'of',
      required: true
    },
    {
       class: 'Boolean',
       name: 'permissioned',
       value: false
    },
    {
      name: 'permissionResults',
      expression: async function(of, permissioned) {
        if ( of ) {
          if ( permissioned ) {
            var results = [];
            var model = of.name.toLowerCase();
            for ( var i = 0; i < of.VALUES.length; i++ ) {
              var readPermission = model + '.read.' + of.VALUES[i].label.toLowerCase();
              var permResult = await this.auth.check(null, readPermission);
              results.push([of.VALUES[i].label, permResult]);
            }
            return results;
          } else {
            return of.VALUES.map((v) => {
              return [v, v.label];
            });
          }
        } else {
          return [];
        }
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this.permissionedChoices();
    },

    function fromProperty(p) {
      this.SUPER(p);
      if ( ! this.of ) this.of = p.of;
    },

    function permissionedChoices() {
      this.permissionResults.then((array) => {
        var values = [];
        if ( this.of ) {
          if ( this.permissioned ) {
            var hash = {};
            for ( var i = 0; i < array.length; i+=1 ) {
              hash[array[i]] = i;
            }
            this.of.VALUES.map((v) => {
              var value = [v.label, true];
              if ( hash.hasOwnProperty(value) ) {
                values.push([v, v.label]);
              }
            });
            return values;
          } else {
            return array;
          }
        }
      }).then((array) => {
        this.choices = array;
      });
    }
  ]
});
