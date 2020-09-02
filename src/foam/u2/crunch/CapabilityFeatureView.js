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

  imports: [
    'subject',
    'userCapabilityJunctionDAO'
  ],

  requires: [
    'foam.nanos.crunch.AgentCapabilityJunction',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.u2.view.ReadOnlyEnumView',
    'foam.u2.crunch.Style'
  ],

  documentation: `
    A single card in a list of capabilities.
  `,

  css: `
    ^ .foam-u2-crunch-Style-cardpart {
      position: relative;
    }

    ^ .foam-u2-crunch-Style-badge {
      position: absolute;
      bottom: 8px;
      right: 8px;
    }
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
      this.addClass(this.myClass());

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
          .add(this.slot(function(cjStatus) {
            return this.E().start(self.ReadOnlyEnumView, { data: cjStatus })
              .addClass(style.myClass('badge'))
              .style({ 'background-color': cjStatus.background })
            .end();
          }))
        .end()
        .start()
          .addClass(style.myClass('card-title'))
          .add(( self.data.name != '') ?  { data : self.data, clsInfo : self.data.cls_.NAME.name, default : self.data.name }  : self.data.id)
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
          .add({ data : self.data, clsInfo : self.data.cls_.DESCRIPTION.name, default : self.data.description } || 'no description')
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
