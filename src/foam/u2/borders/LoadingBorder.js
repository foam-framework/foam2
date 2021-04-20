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
      background-color: hsla(216,33%,97%,0.9);

      /* negative margin covers left-side padding of wizard */
      margin: 0 -48px;
      z-index: 1000;

      /* ease-out animation makes things feel stable */
      transition: all 200ms ease-out;

      overflow: hidden;
    }
    ^overlay .foam-u2-LoadingSpinner {
      width: 50%;
      height: 50%;

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
      opacity: 0.5;
      pointer-events: none;
    }
    ^overlay^pending .foam-u2-LoadingSpinner {
      width: 20%;
      height: 20%;
    }
  `,

  properties: [
    // {
    //   class: 'Boolean',
    //   name: 'loading',
    //   value: true
    // }
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
          .tag(this.LoadingSpinner, {
            imagePath: this.theme.glyphs.spinner.getDataUrl({
              fill: this.theme.primary3
            })
          })
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
