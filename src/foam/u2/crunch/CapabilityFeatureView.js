/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch',
  name: 'CapabilityFeatureView',
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
        .s.addClassTo(self, 'mode-card')
        .start()
          .addClass(self.s.myClass('cardpart'))
          .style({
            'background-image': "url('" + self.data.icon + "')"
          })
        .end()
        // TODO: how to represent badges?
        .start()
          .addClass(self.s.myClass('card-title'))
          .add(( self.data.name != '') ? self.data.name : self.data.id)
        .end()
        .start()
          .addClass(self.s.myClass('card-subtitle'))
          .select(self.data.categories.dao, function (category) {
            return this.E('span')
              .addClass(self.s.myClass('category'))
              .add(category.name)
              ;
          })
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
