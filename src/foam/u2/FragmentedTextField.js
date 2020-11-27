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
        } else if ( e.cls_ === foam.u2.FragmentedTextFieldFragment ) {
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
      // returns an array of data chunks in the size of the delegates
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
        var arr = this.processData(this.childNodes[this.currentIndex].data, this.currentIndex, []);
        for ( var i = 0; i < arr.length; i++ ) {
          var nextIndex = this.currentIndex + 1;
          while ( this.childNodes[nextIndex] && ! foam.u2.TextField.isInstance(this.childNodes[nextIndex]) ) {
            nextIndex++;
          }
          this.childNodes[this.currentIndex].data = arr[i];
          if ( next = this.childNodes[nextIndex] ) {
            if ( this.delegates[this.currentIndex].maxLength > arr[i].length ) break;

            if ( ! ( next && next.data ) ) {
              this.currentIndex = nextIndex;
              next.focus();
            } else break;
          }
        }
        this.childNodes[this.currentIndex].focus();
      }
    }
  ]
});
