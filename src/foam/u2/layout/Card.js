/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.layout',
  name: 'Card',
  extends: 'foam.u2.borders.CardBorder',

  css: `

  `,

  properties: [
    {
      class: 'Int',
      name: 'def',
      value: 12
    },
    {
      class: 'Int',
      name: 'md',
      expression: function(def) {
        return def;
      }
    },
    {
      class: 'Int',
      name: 'lg',
      expression: function(def) {
        return def;
      }
    },
    {
      class: 'Int',
      name: 'sm',
      expression: function(def) {
        return def;
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this.addClass(this.myClass());

      // TODO: find the display mode and adjust accordingly (e.g. for sm divide by 8), for now just use md
      var flex = this.md / 12;

      this.style({ 'flex-grow': flex })
    }
  ]
});