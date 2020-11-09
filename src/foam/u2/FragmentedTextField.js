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
    {
      class: 'Int',
      name: 'currentIndex',
      value: 0,
      preSet: function(old, nu) {
        if ( nu > this.numOfParts - 1 ) return this.numOfParts - 1;
        if ( nu < 1 ) return 0;
        return nu;
      }
    },
    {
      class: 'Int',
      name: 'numOfParts',
      value: 0
    }
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
        } else if ( e.class === 'foam.u2.Fragment' ) {
          e = e.view;
        }
        var u2Elem = this.start(e)
        u2Elem.on('focus', () => {
          this.currentIndex = i;
        })
        slots.push(u2Elem.data$)
      }

      this.data$ = this.ArraySlot.create({ slots }).map(arr => {
        return '' + arr.join('');
      });
      this.data$.sub(this.onDataUpdate);
      this.numOfParts = this.delegates.length;

      return this;
    },
    function processData(data, index, arr) {
      var currentElement = this.childNodes[index];
      if ( ! data || ! currentElement ) return arr;
      var maxLength = this.delegates[index].maxLength;
      arr.push(data.substring(0, maxLength));
      return this.processData(data.substring(maxLength), index + 2, arr);
    }
  ],

  listeners: [
    {
      name: 'onDataUpdate',
      code: function() {
        // data update listener will be triggered after the overflowing data is cut into the maxlength of the fragment
        // so need a check to prevent the listener action from repeating
        // if ( new == old.substring(0, maxlength) )  return;
        var arr = this.processData(this.childNodes[this.currentIndex].data, this.currentIndex, []);
        for ( var i = 0; i < arr.length; i++ ) {
          var currentElement = this.childNodes[this.currentIndex];
          currentElement.data = arr[i];
          var next = this.childNodes[this.currentIndex + 2];
          var nextInArr = arr[i+1];
          if ( next ) {
            if ( next.data && nextInArr ) break;

            if ( ! nextInArr && ( this.delegates[this.currentIndex].maxLength <= arr[i].length ) || ! next.data ) {
              this.currentIndex = this.currentIndex + 2;
              next.focus();
            }
          }
        }
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.u2',
  name: 'Fragment',

  properties: [
    {
      class: 'Int',
      name: 'maxLength'
    },
    {
      class: 'Object',
      name: 'view'
    }
  ]
})