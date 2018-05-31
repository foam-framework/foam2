/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2',
  name: 'EnumView',
  extends: 'foam.u2.view.ChoiceView',

  properties: [
    {
      class: 'Class',
      name: 'of',
      required: true
    },
    {
      name: 'choices',
      expression: function(of) {
        return of ? of.VALUES.map(function(v) { return [ v, v.label ]; }) : [];
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
