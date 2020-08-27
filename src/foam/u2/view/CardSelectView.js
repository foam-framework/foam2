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

  css: `
    ^ {
      display: flex;
      padding-top: 5%;
      padding-bottom: 5%;
      margin: 1%;
      justify-content: center;
    }

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
  `,

  documentation: `
    A selectable card which takes a boolean as data, has three stares: disabled, selected and unselected
  `,

  properties: [
    {
      class: 'String',
      name: 'label',
      factory: function(){
        return String(this.value);
      }
    }
  ],

  methods: [
    function initE() {
      this
        .start(this.CardBorder)
          .addClass(this.myClass())
          .enableClass(this.myClass('selected'), this.slot((data, mode) => {
            return data && mode !== foam.u2.DisplayMode.DISABLED
          }))
          .enableClass(this.myClass('disabled'), this.slot((data, mode) => {
            return ! data && mode === foam.u2.DisplayMode.DISABLED
          }))
          .enableClass(this.myClass('selected-disabled'), this.slot((data, mode) => {
            return data && mode === foam.u2.DisplayMode.DISABLED
          }))
          .on('click', this.onClick)
          .add(this.label) 
        .end()
    }
  ],

  listeners: [
    function onClick() {
      if ( this.mode !== foam.u2.DisplayMode.DISABLED ) {
        this.data = ! this.data
      }
    }
  ]
});
