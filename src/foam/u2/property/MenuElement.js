/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */


foam.CLASS({
  package: 'foam.u2.property',
  name: 'MenuElement',
  extends: 'foam.u2.View',

  imports: [
    'document',
    'popup'
  ],

  properties: [
    ['nodeName', 'ul'],
    'itemHeight', 'itemWidth', 'hMargin',
    'choices', 'data', 'index'
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass());

      if ( this.choices.length == 0 ) {
        this.start('li')
          .addClass('choice')
          .add('Nothing to select :(')
          .end();
        return;
      }
      for ( var i = 0 ; i < this.choices.length ; i++ ) {
        this.start('li')
          .addClass('choice')
          .addClass(this.index === i ? 'selected' : '')
          .on('click', this.onClick.bind(this, i))
          .add(this.choices[i][1])
          .end();
      }
    },

    function load() {
      this.SUPER();
      this.document.body.addEventListener('touchstart', this.onTouch);
//      this.document.body.addEventListener('mousemove', this.onMouseMove);
    },

    function unload() {
      this.SUPER();
      this.document.body.removeEventListener('touchstart', this.onTouch);
//      this.document.body.removeEventListener('mousemove', this.onMouseMove);
    }
  ],

  listeners: [
    {
      name: 'onMouseMove',
      code: function(evt) {
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
      background: inherit;
      box-shadow: 0px 0px 30px 0px #b7b7b7;
      margin: 0;
      overflow-y: auto;
      position: relative;
      bottom: -3rem !important;
      max-height: 25rem;
      border-radius: 10px;
    }
    ^ .choice {
      align-content: flex-start;
      align-items: flex-end;
      cursor: pointer;
      margin: 0px;
      font-size: 80%;
      color: /*%GREY1%*/ #5e6061;
      padding: 2.5rem;
    }
    ^ .choice.selected {
      font-weight: bold;
      border-left: 0.7rem solid #868686;
      background-color: #cacaca;
    }
  `
});