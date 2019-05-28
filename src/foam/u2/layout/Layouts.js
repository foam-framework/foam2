/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.layout',
  name: 'AbstractLayout',
  extends: 'foam.u2.Element',
  requires: [
    'foam.u2.layout.Item'
  ],
  properties: [
    {
      class: 'Map',
      name: 'defaultChildStyle'
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'border',
      value: { class: 'foam.u2.borders.NullBorder' }
    }
  ],

  methods: [
    function start(spec, args, slot) {
      var c = this.SUPER(spec, args, slot);
      // Force the parent to this because the add() override could cause
      // the parent not to be this so the user would unknowingly have to
      // call end() more times.
      c.parentNode = this;
      return c;
    },

    /**
     * This expects all child elements to be instances of foam.u2.layout.Col
     * so we override the add method to enforce this.
     */
    function add(...args) {
      args.forEach(value => {
        if ( this.Item.isInstance(value) ) {
          this.SUPER(value);
        }
        else {
          this
            .start(this.Item)
              .style(this.defaultChildStyle)
              .start(this.border)
                .add(value)
              .end()
            .end();
        }
      });
      return this;
    }
  ]
});

foam.CLASS({
  package: 'foam.u2.layout',
  name: 'Rows',
  extends: 'foam.u2.layout.AbstractLayout',
  css: `
    ^ {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: stretch;
    }
  `,
  methods: [
    function initE() {
      this.SUPER();
      this.addClass(this.myClass());
    },
  ]
});

foam.CLASS({
  package: 'foam.u2.layout',
  name: 'Cols',
  extends: 'foam.u2.layout.AbstractLayout',
  css: `
    ^ {
      display: flex;
      justify-content: space-between;
      align-items: stretch;
    }
  `,
  methods: [
    function initE() {
      this.SUPER();
      this.addClass(this.myClass());
    },
  ]
});

foam.CLASS({
  package: 'foam.u2.layout',
  name: 'Item',
  extends: 'foam.u2.Element'
});
