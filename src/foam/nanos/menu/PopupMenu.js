foam.CLASS({
  package: 'foam.nanos.menu',
  name: 'PopupMenu',
  extends: 'foam.u2.Element',

  axioms: [
    foam.u2.CSS.create({
      code: function() {/*
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
      */}
    })
  ],

  methods: [
    function init() {
      this.SUPER();
      var content;

      this.addClass(this.myClass())
          .start()
          .addClass(this.myClass('container'))
          .start()
              .addClass(this.myClass('background'))
              .on('click', this.close)
          .end()
          .start()
              .call(function() { content = this; })
              .addClass(this.myClass('inner'))
          .end()
      .end();

      this.content = content;
    },

    function open() {
      this.document.body.insertAdjacentHTML('beforeend', this.outerHTML);
      this.load();
    }
  ],

  listeners: [
    function close() {
      this.remove();
    }
  ]
});