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

  imports: [
    'theme'
  ],

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
      background-color: hsla(216,33%,97%,0.9);

      /* negative margin covers left-side padding of wizard */
      margin: 0 -48px;
      z-index: 1000;

      /* ease-out animation makes things feel stable */
      transition: all 200ms ease-out;
    }
    ^container {
      position: sticky;
      top: 15pt;
      height: 32pt;
      padding: 15pt;
      background-color: /*%WHITE%*/ #fff;
      border: 1pt solid %GREY3%;
      border-right: none;
      transition: all 200ms ease-out;
      margin-left: calc(100% - 62pt);
      border-radius: 8pt 0 0 8pt;
    }
    ^overlay^loading ^container {
      margin-left: 0;
      border-radius: 0;
      border-left: 0;
      overflow: hidden;
    }
    ^overlay .foam-u2-LoadingSpinner {
      display: inline-block;
      width: 32pt;
      height: 32pt

      /* ease-out animation makes things feel stable */
      transition: all 200ms ease-out;
    }
    ^overlay .foam-u2-LoadingSpinner img {
      width: 100%;
      height: 100%;
    }
    ^overlay^loading .foam-u2-LoadingSpinner {
      margin-left: 15pt;
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
    ^overlay^loading ^message {
      display: inline-block;
      vertical-align: top;
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
      this
        .addClass(this.myClass())
        .start()
          .addClass(this.myClass('overlay'))
          .addClass(this.loadingLevel$.map(v => this.myClass(v.name.toLowerCase())))
          .start()
            .addClass(this.myClass('container'))
            .tag(this.LoadingSpinner, {
              imagePath: this.theme.glyphs.spinner.getDataUrl({
                fill: this.theme.primary3
              })
            })
            .start()
              .addClass(this.myClass('message'))
              .add(this.MESSAGE)
            .end()
          .end()
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
