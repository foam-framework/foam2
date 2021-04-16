/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.borders',
  name: 'LoadingBorder',
  extends: 'foam.u2.Element',

  requires: [
    'foam.u2.LoadingSpinner'
  ],

  css: `
    ^ {
      position: relative;
    }
    ^overlay {
      display: flex;
      justify-content: center;
      align-items: center;
      position: absolute;
      top: 0; left: 0;
      /* extra width covers right-side padding of wizard */
      width: calc(100% + 2*48px);
      height: 100%;
      background-color: rgba(0,0,0,0.7 );

      /* negative margin covers left-side padding of wizard */
      margin: 0 -48px;
      z-index: 1000;
    }
    ^overlay .foam-u2-LoadingSpinner {
      width: 50%;
      height: 50%;
    }
    ^overlay .foam-u2-LoadingSpinner img {
      width: 100%;
      height: 100%;
    }
  `,

  properties: [
    {
      class: 'Boolean',
      name: 'loading',
      value: true
    }
  ],

  methods: [
    function init() {
      this
        .addClass(this.myClass())
        .start()
          .addClass(this.myClass('overlay'))
          .show(this.loading$)
          .tag(this.LoadingSpinner)
        .end()
        .start('div', null, this.content$)
          .on('keypress', this.onKey)
          .on('keydown', this.onKey)
          .addClass(this.myClass('content'))
        .end();
    }
  ],

  listeners: [
    function onKey(e) {
      if ( this.loading ) {
        e.preventDefault();
        e.stopPropagation();
      }
    }
  ]
});
