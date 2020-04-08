/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2',
  name: 'EnumView',
  extends: 'foam.u2.view.ChoiceView',

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
       name: 'permissioned'
    },
    {
      name: 'permissionResults',
      expression: async function(of, permissioned) {
        var results = [];
        if ( of && permissioned ) {
          var model = of.name.toLowerCase();
          for ( var i = 0 ; i < of.VALUES.length ; i++ ) {
            var readPermission = model + '.read.' + of.VALUES[i].label.toLowerCase();
            var permResult = await this.auth.check(null, readPermission);
            results.push([of.VALUES[i].label, permResult]);
          }
        }
        return results;
      }
    },
    {
      name: 'choices',
      expression: function(of) {
        return of ? of.VALUES.map(function(v) {
          return [v, v.label];
        }) : [];
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      if ( this.permissioned ) {
        this.permissionedChoices();
      }
    },

    function fromProperty(p) {
      this.SUPER(p);
      if ( ! this.of ) this.of = p.of;
    },

    function permissionedChoices() {
      this.permissionResults.then((array) => {
        var values = [];
        if ( this.of ) {
            var hash = {};
            for ( var i = 0 ; i < array.length ; i+=1 ) {
              hash[array[i]] = i;
            }
            this.of.VALUES.map((v) => {
              var value = [v.label, true];
              if ( hash.hasOwnProperty(value) ) {
                values.push([v, v.label]);
              }
            });
        }
        return values;
      }).then((array) => {
        this.choices = array;
      });
    }
  ]
});
