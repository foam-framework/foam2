/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch',
  name: 'CapabilityFeatureView',
  extends: 'foam.u2.View',
  
  implements: [
    'foam.mlang.Expressions'
  ],

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
      var style = self.Style.create();
      style.addBinds(self);
      
      self
        .addClass(style.myClass())
        .addClass(style.myClass(), 'mode-card')
        .start()
          .addClass(style.myClass('cardpart'))
          .style({
            'background-image': "url('" + self.data.icon + "')"
          })
        .end()
        .start()
          .addClass(style.myClass('card-title'))
          .add(( self.data.name != '') ? self.data.name : self.data.id)
        .end()
        .start()
          .addClass(style.myClass('card-subtitle'))
          .select(self.data.categories.dao
            .where(this.EQ(foam.nanos.crunch.CapabilityCategory.VISIBLE, true)), function (category) {
              return this.E('span')
                .addClass(style.myClass('category'))
                .add(category.name);
          })
        .end()
        .start()
          .addClass(style.myClass('card-description'))
          .add(self.data.description || 'no description')
        .end();
    }
  ]
});
