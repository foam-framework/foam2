foam.CLASS({
  package: 'foam.u2.borders',
  name: 'SplitScreenBorder',
  extends: 'foam.u2.Element',

  css: `
    ^ {
      height: 100vh;
      width: 100vw;
      background: #fff;
    }
    ^ .left-block {
      width: 55vw;
      display: inline-block;
      background: transparent;
      text-align: center;
    }
    ^ .right-block {
      width: 43vw;
      display: inline-block;
      background: transparent;
      height: auto;
      float: right;
    }
    ^content {
      width: -moz-available;
      width: -webkit-fill-available;
      width: fill-available;
      position: relative;
      padding-bottom: 4vh;
    }
    ^ .wrapper-outer {
      overflow: auto;
      height: calc(100% - 15vh);
    }
`,

properties: [
  'leftPanel',
  'rightPanel'
],

methods: [
  function init() {
    this.addClass(this.myClass())
    .start().addClass('wrapper-outer')
        .start().addClass('left-block')
          .start('div', null, this.leftPanel$)
              .addClass(this.myClass('content'))
          .end()
        .end()
        .start().addClass('right-block')
          .start('div', null, this.rightPanel$)
            .addClass(this.myClass('content'))
          .end()
        .end()
    .end();
  }
]
});
