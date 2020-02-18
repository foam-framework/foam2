foam.CLASS({
  package: 'foam.u2.crunch',
  name: 'CapabilityCardView',
  extends: 'foam.u2.View',
  
  requires: [
    'foam.u2.crunch.Style'
  ],

  documentation: `
      A single card in a list of capabilities.
  `,

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      // Methods of Style all return the first argument for chaining
      self.s = self.Style.create();
      
      self
        .s.addClassTo(self)
        .s.addClassTo(self, 'mode-circle')
        .start()
          .addClass(self.s.myClass('icon-circle'))
        .end()
        .start()
          .addClass(self.s.myClass('badge'))
          .addClass(self.s.myClass('ok'))
          .add("TODO")
        .end()
        .start()
          .addClass(self.s.myClass('card-title'))
          .add("Label (TODO)")
        .end()
        .start()
          .addClass(self.s.myClass('card-subtitle'))
          .add("Category (TODO)")
        .end()
        .start()
          .addClass(self.s.myClass('card-description'))
          .add(self.data.description)
        .end()
        .s.addBinds(self)
        ;
    }
  ]
});