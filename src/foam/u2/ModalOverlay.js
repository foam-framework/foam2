/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2',
  name: 'ModalOverlay',
  extends: 'foam.u2.Element',

  documentation: `Handles the grey background and centering of some inner
    element. Generally you either want to create a ModalOverlay and put a
    $$DOC{ref:"foam.u2.md.Card"} or $$DOC{ref:"foam.u2.md.Dialog"} in it;
    or more simply, use $$DOC{ref:"foam.u2.md.EasyDialog"} for simple
    informative popups.`,

  imports: [
    'document'
  ],
  exports: [
    'as overlay'
  ],

  properties: [
    'innerE',
    {
      name: 'redirectToInner_',
      value: true
    },
    {
      class: 'Array',
      name: 'innerQueue_'
    },
  ],

  methods: [
    function initE() {
      this.redirectToInner_ = false;

      var container = this.addClass(this.myClass()).start().addClass(this.myClass('container'));

      container.start().addClass(this.myClass('background'))
        .on('click', this.close.bind(this))
      .end();

      this.innerE = container.start().addClass(this.myClass('inner'));
      for ( var i = 0 ; i < this.innerQueue_.length ; i++ ) {
        this.innerE.add.apply(this.innerE, this.innerQueue_[i]);
      }
      this.innerE.end();

      this.redirectToInner_ = true;
    },
    function add() {
      if ( this.redirectToInner_ ) {
        if ( this.innerE )
          this.innerE.add.apply(this.innerE, arguments);
        else
          this.innerQueue_.push(Array.prototype.slice.call(arguments));
        return this;
      }

      return this.SUPER.apply(this, arguments);
    },

    function open() {
      this.document.body.insertAdjacentHTML('beforeend', this.outerHTML);
      this.load();
    },

    function close() {
      this.remove();
    }
  ],

  css: `
    ^ {
      align-items: center;
      bottom: 0;
      display: flex;
      justify-content: space-around;
      left: 0;
      position: fixed;
      right: 0;
      top: 0;
      z-index: 1000;
    }

    ^container {
      align-items: center;
      display: flex;
      height: 100%;
      justify-content: space-around;
      position: relative;
      width: 100%;
    }
    ^background {
      background-color: #000;
      bottom: 0;
      left: 0;
      opacity: 0.4;
      position: absolute;
      right: 0;
      top: 0;
    }
    ^inner {
      z-index: 3;
    }
  `
});
