/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.layout',
  name: 'Cards',
  extends: 'foam.u2.Element',
  css: `
    ^ {
      display: flex;
      justify-content: flex-start;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'defaultMargin',
      value: '8px'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this.addClass(this.myClass());
    },

    function start(spec, args, slot) {

      var c = this.createChild_(spec, args);

      // added in order to create automatic spacing between cards
      if ( foam.u2.layout.Card.isInstance(c) ) c.style({ margin: this.defaultMargin });

      this.add(c);
      if ( slot ) slot.set(c);
      return c;
    }
  ]
});
