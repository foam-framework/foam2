/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.ENUM({
  package: 'foam.u2.borders',
  name: 'LoadingLevel',
  values: [
    {
      name: 'idle',
    },
    {
      name: 'pending',
    },
    {
      name: 'loading',
    }
  ]
});

foam.CLASS({
  package: 'foam.u2.borders',
  name: 'LoadingBorder',
  extends: 'foam.u2.Element',

  requires: [
    'foam.u2.LoadingSpinner',
    'foam.u2.borders.LoadingLevel'
  ],

  messages: [
    {
      name: 'MESSAGE',
      message: 'Please wait...'
    }
  ],

  css: `
    ^ {
      position: relative;
    }
    ^overlay {
      position: absolute;
      top: 0; left: 0;
      /* extra width covers right-side padding of wizard */
      width: calc(100% + 2*48px);
      height: 100%;
      background-color: hsla(216,33%,97%,0.7);

      /* negative margin covers left-side padding of wizard */
      margin: 0 -48px;
      z-index: 1000;

      /* ease-out animation makes things feel stable */
      transition: all 200ms ease-out;
    }
    ^container {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      padding: 15pt;
      transition: all 200ms ease-out;
    }
    ^overlay .foam-u2-LoadingSpinner {
      /* ease-out animation makes things feel stable */
      transition: all 200ms ease-out;
    }
    ^overlay .foam-u2-LoadingSpinner img {
      width: 100%;
      height: 100%;
    }

    ^overlay^idle {
      opacity: 0;
      pointer-events: none;
    }
    ^overlay^pending {
      opacity: 1;
      background-color: hsla(216,33%,97%,0);
      pointer-events: none;
    }
    ^message {
      display: none;
      line-height: 32pt;
      font-size: 24pt;
      margin-left: 15pt;
      color: /*%PRIMARY3*/ #604aff;
    }
  `,

  properties: [
    {
      name: 'loadingLevel',
      class: 'Enum',
      of: 'foam.u2.borders.LoadingLevel'
    }
  ],

  methods: [
    function init() {
      var self = this;
      this
        .addClass(this.myClass())
        .start()
          .addClass(this.myClass('overlay'))
          .addClass(this.loadingLevel$.map(v => this.myClass(v.name.toLowerCase())))
          .add(this.slot(loadingLevel=> {
            return loadingLevel != this.LoadingLevel.IDLE ? this.E().start()
              .addClass(this.myClass('container'))
              .tag(this.LoadingSpinner, { size: 32 })
              .start()
                .addClass(this.myClass('message'))
                .add(this.MESSAGE)
              .end()
            .end() : this.E();
          }))
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
      if ( this.loadingLevel == this.LoadingLevel.LOADING ) {
        e.preventDefault();
        e.stopPropagation();
      }
    }
  ]
});
