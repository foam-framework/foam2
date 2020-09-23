/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */


foam.CLASS({
  package: 'foam.u2.property',
  name: 'MenuElement',
  extends: 'foam.u2.property.MDAbstractChoiceView',

  imports: [
    'document',
    'dynamic',
    'popup'
  ],

  properties: [
    ['nodeName', 'ul'],
    'itemHeight', 'itemWidth', 'hMargin'
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass());

      if ( this.choices.length == 0 ) {
        this.add('Nothing to select :(');
        return;
      }
      for ( var i = 0 ; i < this.choices.length ; i++ ) {
        this.start('li')
          .addClass('choice')
          .addClass(this.slot(function(i) {
            return this.index === i ? 'selected' : '';
          }.bind(this, i), this.index$))
          .on('click', this.onClick.bind(this, i))
          .add(this.choices[i][1])
          .end();
      }
    },

    function load() {
      this.SUPER();
      this.document.body.addEventListener('touchstart', this.onTouch);
      this.document.body.addEventListener('mousemove', this.onMouseMove);
    },

    function unload() {
      this.SUPER();
      this.document.body.removeEventListener('touchstart', this.onTouch);
      this.document.body.removeEventListener('mousemove', this.onMouseMove);
    },
  ],

  listeners: [
    {
      name: 'onMouseMove',
      code: function(evt) {
        // Containment is not sufficient.
        // It's too eager to close the popup, and we want to keep it open so
        // long as the mouse is nearby.
        var pos = this.el().getBoundingClientRect();
        var margin = 50;
        if (evt.clientX < pos.left - margin || pos.right + margin < evt.clientX ||
            evt.clientY < pos.top - margin || pos.bottom + margin < evt.clientY) {
          this.popup.close();
        }
      }
    },
    {
      name: 'onTouch',
      code: function(evt) {
        // Make sure the target element is a child of the popup, otherwise close
        // the popup.
        if (!this.el().contains(evt.target)) {
          this.popup.close();
        }
      }
    },
    {
      name: 'onClick',
      code: function(index) {
        this.index = index;
        this.popup.close();
      }
    },
  ],

  css: `
    ^ {
      background: white;
      border: 2px solid grey;
      display: table-footer-group;
      flex-direction: column;
      list-style-type: none;
      margin: 0;
      overflow-y: auto;
      padding: 0;
      position: absolute;
    }
    ^ .choice {
      align-content: flex-start;
      align-items: flex-end;
      cursor: pointer;
      display: inline-flex;
      margin: 0px;
      overflow: hidden;
      padding: 1rem;
      width: 100%;
    }
    ^ .choice.selected {
      font-weight: bold;
    }
  `
});