foam.CLASS({
  package: 'foam.u2.texteditor',
  name: 'Popup',
  extends: 'foam.u2.View',

  properties: [
    {
      name: 'button'
    },
    {
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
          .start('div').addClass('toolbar-menu')
            .style({
              display: self.hidden$.map(h => h ? 'none' : 'block')
            })
            .add(self.view$)
        .end();
    }
  ]
});