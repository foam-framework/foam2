foam.CLASS({
  package: 'foam.u2.texteditor',
  name: 'Popup',
  extends: 'foam.u2.View',

  css: `
  ^menu {
    position: absolute;
    background-color: #f0f0f0;
    min-width: 50px;
    min-height: 50px;
    box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
    z-index: 1;
  }

  ^menu  button {
    display: block !important;
    width: 100px !important;
    height: 40px;
    text-align: left !important;
    padding: 16px;
    border-radius: 0px;
  }

  .foam-u2-DetailView-toolbar {
    display: block;
    padding-top: 8px;
  }
  `,

  properties: [
    {
      name: 'button'
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'view'
    },
    {
      class: 'Boolean',
      name: 'hidden',
      value: true
    }
  ],
  
  methods: [
    function initE() {
      var self = this;
      self.SUPER();
      self
          .start()
            .add(self.button$)
            .on('click', function(e1) {
              self.hidden = ! self.hidden;
              if ( ! self.hidden ) {
                self.document.addEventListener('click', function(e2) {
                  if ( e1.target === e2.target ) return;
                  if ( ! self.hidden ) self.hidden = true;
                  self.document.removeEventListener('click', arguments.callee);
                });
              }
            })
          .end()
          .start('div').addClass(this.myClass('menu')).hide(self.hidden$)
            .tag(self.view)
          .end();
    }
  ]
});