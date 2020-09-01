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
    'foam.nanos.crunch.AgentCapabilityJunction',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.u2.crunch.Style',
    'foam.u2.Element',
    'foam.u2.view.ReadOnlyEnumView'
  ],

  imports: [
    'subject',
    'userCapabilityJunctionDAO'
  ],

  documentation: `
    A single card in a list of capabilities.
  `,

  properties: [
    {
      name: 'associatedEntity',
      expression: function(data, subject) {
        if ( ! data || ! subject ) return '';
        return data.associatedEntity === foam.nanos.crunch.AssociatedEntity.USER ? subject.user : subject.realUser;
      }
    },
    {
      name: 'cjStatus',
      documentation: `
        Stores the status of the capability feature and is updated when the user
        attempts to fill out or complete the CRUNCH forms.
      `,
      factory: function() {
        return foam.nanos.crunch.CapabilityJunctionStatus.AVAILABLE;
      }
    }
  ],

  methods: [
    function init() {
       this.SUPER();
       this.onDetach(this.userCapabilityJunctionDAO.on.put.sub(this.daoUpdate));
       this.daoUpdate();
    },

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
            'background-position': '50% 50%',
            'float': 'left'
          })
        .end()
        .add(this.slot(function(cjStatus) {
          return this.E().start(self.ReadOnlyEnumView, { data : cjStatus, clsInfo : cjStatus.cls_.LABEL.name, default : cjStatus.label })
            .addClass(style.myClass('badge'))
            .style({ 'background-color': cjStatus.background })
          .end();
        }))
        .start()
          .addClass(style.myClass('card-title'))
          .add(( self.data.name != '') ? { data : self.data, clsInfo : self.data.cls_.NAME.name, default : self.data.name } : self.data.id)
        .end()
        .start()
          .addClass(style.myClass('card-subtitle'))
          .select(self.data.categories.dao
            .where(this.EQ(foam.nanos.crunch.CapabilityCategory.VISIBLE, true)), function (category) {
              return this.E('span')
                .addClass(style.myClass('category'))
                .add({ data : category, clsInfo : category.cls_.NAME.name, default : category.name });
          })
        .end()
        .start()
          .addClass(style.myClass('card-description'))
          .add({ data : self.data, clsInfo : self.data.cls_.DESCRIPTION.name, default : self.data.description })
        .end();
    }
  ],

  listeners: [
    {
      name: 'daoUpdate',
      code: function() {
        this.userCapabilityJunctionDAO.find(
          this.AND(
            this.EQ(this.UserCapabilityJunction.TARGET_ID, this.data.id),
            this.EQ(this.UserCapabilityJunction.SOURCE_ID, this.associatedEntity.id),
            this.OR(
              this.NOT(this.INSTANCE_OF(this.AgentCapabilityJunction)),
              this.AND(
                this.INSTANCE_OF(this.AgentCapabilityJunction),
                this.EQ(this.AgentCapabilityJunction.EFFECTIVE_USER, this.subject.user.id)
              )
            )
          )
        ).then(ucj => {
          if ( ucj ) this.cjStatus = ucj.status;
        });
      }
    }
  ]
});
