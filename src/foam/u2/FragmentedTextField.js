/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2',
  name: 'FragmentedTextField',
  extends: 'foam.u2.View',

  requires: [
    'foam.core.ArraySlot',
  ],

  css: `
    ^ {
      display: flex;
      position: relative;
    }
    ^symbol {
      display: flex;
      align-items: center;
      background: %GREY5%;
      border: 1px solid %GREY3%;
      margin-left: -1px;
      margin-right: -1px;
      line-height: 100%;

      /* TODO: get from theme when available */
      padding-left: 8px;
      padding-right: 8px;
    }
    ^ > *:not(:first-child):not(:last-child) {
      border-radius: 0 !important;
    }
    ^ > *:first-child {
      border-top-right-radius: 0 !important;
      border-bottom-right-radius: 0 !important;
    }
    ^ > *:last-child {
      border-top-left-radius: 0 !important;
      border-bottom-left-radius: 0 !important;
    }
  `,

  properties: [
    {
      name: 'delegates',
      class: 'Array'
    },
  ],

  methods: [
    function initE() {
      return this
        .addClass(this.myClass())
        .createInnerFields()
    },
    function createInnerFields() {
      var slots = [];
      for ( let i = 0 ; i < this.delegates.length ; i++ ) {
        let e = this.delegates[i];
        if ( typeof e === 'string' ) {
          this.start().addClass(this.myClass('symbol'))
            .add(e).end();
          continue;
        }
        var u2Elem = this.start(e)
        slots.push(u2Elem.data$)
      }

      this.data$ = this.ArraySlot.create({ slots }).map(arr => {
        return '' + arr.join('');
      });

      return this;
    }
  ]
});