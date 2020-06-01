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
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.u2.view.ReadOnlyEnumView'
  ],

  imports: [
    'user',
    'userCapabilityJunctionDAO'
  ],

  documentation: `
    A single card in a list of capabilities.
  `,

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      var style = self.Style.create();
      style.addBinds(self);
      
      self
        .addClass(style.myClass())
        .addClass(style.myClass('mode-circle'))
        .start()
          .addClass(style.myClass('icon-circle'))
          .style({
            'background-image': "url('" + self.data.icon + "')",
            'background-size': 'cover',
            'background-position': '50% 50%'
          })
        .end()
        .start('span')
        .call(function () {
          var badgeWrapper = self.Element.create({ nodeName: 'SPAN' });
          this.add(badgeWrapper);
          self.userCapabilityJunctionDAO.find(self.AND(
            self.EQ(self.UserCapabilityJunction.SOURCE_ID, self.user.id),
            self.EQ(self.UserCapabilityJunction.TARGET_ID, self.data.id),
          )).then(ucj => {
            var statusEnum =  foam.nanos.crunch.CapabilityJunctionStatus.AVAILABLE;
            if ( ucj ) {
              statusEnum = ucj.status;
            }
            var badge = self.ReadOnlyEnumView.create({
                data: statusEnum
              }).addClass(style.myClass('badge'))
              .style({ 'background-color': statusEnum.background });
            badgeWrapper.add(badge);
          });
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
          .add(self.data.description)
        .end();
    }
  ]
});
