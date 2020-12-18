/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'CardSelectView',
  extends: 'foam.u2.View',

  requires: [
    'foam.u2.borders.CardBorder'
  ],

  axioms: [
    foam.pattern.Faceted.create()
  ],

  css: `
    ^selected {
      border-color: /*%PRIMARY3%*/ #406dea !important;
    }

    ^disabled {
      background-color: /*%GREY5%*/ #f5f7fa !important;
      color: /*%GREY2%*/ #9ba1a6;
    }

    ^selected-disabled {
      border-color: /*%PRIMARY5%*/ #b2c4f6 !important;
      background-color: /*%GREY5%*/ #f5f7fa !important;
      color: /*%GREY2%*/ #9ba1a6;
    }

    ^innerFlexer {
      min-width: -webkit-fill-available;
    }

    ^ .foam-u2-borders-CardBorder {
      min-height: 10vh;
      background-color: #ffffff;
      border: solid 1px #e7eaec;
      border-radius: 5px;
      position: relative;
      padding: 16px;
      transition: all 0.2s linear;
    }
  `,

  documentation: `
    A selectable card which takes a boolean as data, has three stares: disabled, selected and unselected
  `,

  properties: [
    {
      class: 'String',
      name: 'label',
      factory: function() {
        return String(this.value);
      }
    },
    {
      name: 'obj'
    }
  ],

  methods: [
    function initE() {
      this
      .addClass(this.myClass())
      .addClass(this.myClass('innerFlexer'))
      .start(this.CardBorder)
        .enableClass(this.myClass('selected'), this.slot((data, mode) => {
          return data && mode !== foam.u2.DisplayMode.DISABLED;
        }))
        .enableClass(this.myClass('disabled'), this.slot((data, mode) => {
          return ! data && mode === foam.u2.DisplayMode.DISABLED;
        }))
        .enableClass(this.myClass('selected-disabled'), this.slot((data, mode) => {
          return data && mode === foam.u2.DisplayMode.DISABLED;
        }))
        .on('click', this.onClick)
        .add(this.label)
      .end();
    }
  ],

  listeners: [
    function onClick() {
      if ( this.mode !== foam.u2.DisplayMode.DISABLED ) {
        this.data = ! this.data;
      }
    }
  ]
});
