/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'MultiBoxInputView',
  extends: 'foam.u2.View',
  documentation: `
      Generate a six(default) 48 * 48 multi box input field.
      Each input field is limited to 1 digital value. NumOfParts defines
      the number of input boxes. The input field will switch to error style
      when incorrectCode is set to true.
      `,
  requires: [
    'foam.core.ArraySlot',
    'foam.u2.TextField'
  ],

  css: `
    ^ {
      width: 80%;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;
    }
    ^ input {
      border-width: 1px;
      border-radius: 5px;
      width: 48px;
      height: 48px;
      text-align: center;
      margin: 8px 14px 8px 0;
      font-size: 22px;
    }
    ^ .wrong-code {
      border-color: #f91c1c;
      background-color: #fff6f6;
    }
  `,
  properties: [
    {
      class: 'String',
      name: 'data'
    },
    {
      class: 'Boolean',
      name: 'incorrectCode'
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
      value: 6
    },
    {
      class: 'FObjectArray',
      of: 'foam.u2.Element',
      name: 'elements'
    }
  ],
  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      for ( let i = 0 ; i < this.numOfParts ; i++ ) {
        var isFirstElement = i === 0;
        let v = this.TextField.create({ onKey: true });
        v.setAttribute('maxlength', 1);
        v.setAttribute('autofocus', isFirstElement);
        v.addClass('input').enableClass('wrong-code', this.incorrectCode$ );
        v.on('focus', () => {
          self.currentIndex = i;
        });
        v.on('keydown', (e) => {
          switch ( e.keyCode ) {
            // keyCode 37: '⟵' this will focus the left input field from the current focused element.
            case 37:
                this.currentIndex--;
            break;
            // keyCode 39: '⟶' this will focus the right input field from the current focused element.
            case 39:
                this.currentIndex++;
            break;
            // keyCode 8: 'DELETE'
            case 8:
              if ( this.elements[this.currentIndex].data === ' ' || ! this.elements[this.currentIndex].data ) {
                this.currentIndex--;
              };
            break;
          }
          this.elements[this.currentIndex].focus();
        });

        this.tag(v).addClass(this.myClass());
        this.onDetach(v.data$.sub(this.onDataUpdate));
        this.elements.push(v);
      }

      this.onDetach(this.data$.follow(this.ArraySlot.create({
        slots: this.elements.map((elm) => elm.data$)
      }).map((arr) => arr.reduce((str, c) => str + (c || ' '), ''))));
    }
  ],
  listeners: [
    {
      name: 'onDataUpdate',
      code: function(detachable, eventName, propertyName, propertySlot) {
        if ( propertySlot.get() ) {
          this.currentIndex++;
          this.elements[this.currentIndex].focus();
        }
      }
    }
  ],
});