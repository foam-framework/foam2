/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch',
  name: 'CapabilityCardView',
  extends: 'foam.u2.View',

  implements: [ 'foam.mlang.Expressions' ],

  requires: [
    'foam.u2.Element',
    'foam.u2.crunch.Style',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.crunch.CapabilityJunctionStatus'
  ],

  imports: [
    'user',
    'userCapabilityJunctionDAO',
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
          .style({
            'background-image': "url('" + self.data.icon + "')",
            'background-size': 'cover',
            'background-position': '50% 50%',
          })
        .end()
        .call(function () {
          var badge = self.Element.create();
          this.add(badge);
          badge
            .addClass(self.s.myClass('badge'))
          self.userCapabilityJunctionDAO.find(self.AND(
            self.EQ(self.UserCapabilityJunction.SOURCE_ID, self.user.id),
            self.EQ(self.UserCapabilityJunction.TARGET_ID, self.data.id),
          )).then(ucj => {
            if ( ! ucj ) {
              badge
                .addClass(self.s.myClass('ok'))
                .add("available")
                ;
            }
            else switch ( ucj.status ) {
              case self.CapabilityJunctionStatus.granted:
                badge
                  .addClass(self.s.myClass('ok'))
                  .add("granted")
                  ;
                  break;
              default:
                badge
                  .addClass(self.s.myClass('ok'))
                  .add("unknown state")
                  ;
            }
          });
        })
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
          .add(
            self.data.description ||
              'no description'
          )
        .end()
        .s.addBinds(self)
        ;
    }
  ]
});