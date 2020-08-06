/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch',
  name: 'CapabilityInterceptView',
  extends: 'foam.u2.View',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.log.LogLevel',
    'foam.nanos.crunch.AgentCapabilityJunction',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.u2.crunch.CapabilityCardView',
    'foam.u2.layout.Rows'
  ],

  imports: [
    'capabilityCache',
    'capabilityDAO',
    'crunchController',
    'notify',
    'stack',
    'subject',
    'userCapabilityJunctionDAO'
  ],

  properties: [
    {
      name: 'capabilityView',
      class: 'foam.u2.ViewSpec',
      factory: function() {
        return 'foam.u2.crunch.CapabilityCardView';
      }
    },
    {
      name: 'onClose',
      class: 'Function',
      factory: function() {
        return x => x.closeDialog();
      }
    }
  ],

  messages: [
    { name: 'REJECTED_MSG', message: 'Your choice to bypass this was stored, please refresh page to revert cancel selection.' },
    { name: 'TITLE', message: 'Welcome to Capability unlock options' },
    { name: 'SUBTITLE', message: 'You do not have access to undertake your previous selected action. Please select one of the following capabilities, to unlock full feature.' }
  ],

  css: `
    ^{  
      width: 47vw;
      text-align: center;
    }
    ^detail-container {
      overflow-y: scroll;
      width: 40%;
    }
    ^ > *:not(:last-child) {
      margin-bottom: 24px !important;
    }
  `,

  methods: [
    function initE() {
      this.data.capabilityOptions.forEach(c => {
        if ( this.capabilityCache.has(c) && this.capabilityCache.get(c) ) {
          this.aquire();
        }
      });

      var self = this;
      this
        .addClass(this.myClass())
        .start('h1').add(this.TITLE).end()
        .start('h3').add(this.SUBTITLE).end()
        .start().style({ 'display': 'flex', 'justify-content': 'space-between' })
          .start(this.Rows)
            .addClass(this.myClass('detail-container'))
            .add(this.slot(function(data$capabilityOptions) {
              return this.E().select(this.capabilityDAO.where(
                self.IN(self.Capability.ID, data$capabilityOptions)
              ), cap => {
                return this.E().tag(self.capabilityView, {
                  data: cap
                })
                  .on('click', () => {
                    var p = self.crunchController.launchWizard(cap.id);
                    p.then(() => {
                      this.checkStatus(cap);
                    });
                  });
              });
            }))
          .end()
          .start().style({ 'width': '47%' }).tag(foam.u2.crunch.CapabilityJunctionStatusLegendView).end()
        .end()
        .startContext({ data: this })
          .tag(this.CANCEL, { buttonStyle: 'SECONDARY' })
        .endContext();
    },

    function checkStatus(cap) {
      // Query UCJ status
      var associatedEntity = cap.associatedEntity === foam.nanos.crunch.AssociatedEntity.USER ?
        this.subject.user : this.subject.realUser;
      this.userCapabilityJunctionDAO.where(
        this.AND(
          this.OR(
            this.AND(
              this.NOT(this.INSTANCE_OF(this.AgentCapabilityJunction)),
              this.EQ(this.UserCapabilityJunction.SOURCE_ID, associatedEntity.id)
            ),
            this.AND(
              this.INSTANCE_OF(this.AgentCapabilityJunction),
              this.EQ(this.UserCapabilityJunction.SOURCE_ID, associatedEntity.id),
              this.EQ(this.AgentCapabilityJunction.EFFECTIVE_USER, this.subject.user.id)
            )
          ),
          this.EQ(this.UserCapabilityJunction.TARGET_ID, cap.id)
        )
      ).limit(1).select(this.PROJECTION(
        this.UserCapabilityJunction.STATUS
      )).then(results => {
        if ( results.array.length < 1 ) {
          this.reject();
          return;
        }
        var entry = results.array[0]; // limit 1
        var status = entry[0]; // first field (status)
        switch ( status ) {
          case this.CapabilityJunctionStatus.GRANTED:
            this.aquire();
            break;
          default:
            this.reject();
            break;
        }
      });
    },

    function aquire(x) {
      x = x || this.__subSubContext__;
      this.data.aquired = true;
      this.data.capabilityOptions.forEach(c => {
        this.capabilityCache.set(c, true);
      });
      this.onClose(x);
    },

    function reject(x) {
      x = x || this.__subSubContext__;
      this.data.cancelled = true;
      this.data.capabilityOptions.forEach(c => {
        this.capabilityCache.set(c, true);
      });
      this.notify(this.REJECTED_MSG, '', this.LogLevel.INFO, true);
      this.onClose(x);
    }
  ],

  actions: [
    {
      name: 'cancel',
      label: 'Not interested in adding this functionality',
      code: function(x) {
        this.reject(x);
      }
    }
  ]
});
// todo scroll
foam.CLASS({
  package: 'foam.u2.crunch',
  name: 'CapabilityJunctionStatusLegendView',
  extends: 'foam.u2.View',

  css: `
  .badgePosition {

  }
  `,
  methods: [
    function initE() {
      this.SUPER();
      var style = foam.u2.crunch.Style.create();

      this.start().style({ 'border-style': 'outset' })
      .start('h3').add('Status Legend').end()
      .add(foam.nanos.crunch.CapabilityJunctionStatus.VALUES.map(
        statusEnum => {
          return this.E().start().style({ 'display': 'inline-flex', 'padding': '12px' })
            
            .start().add(
              foam.u2.view.ReadOnlyEnumView.create({
                data: statusEnum
              }).addClass(style.myClass('badge'))
              .style({ 'background-color': statusEnum.background, 'margin-top': '12px', 'margin-right': '7px', 'width': '71px' })
            ).end()
            .start('span').style({ 'float': 'right', 'text-align': 'justify' }).add(statusEnum.documentation).end()
          .end();
        }
      ))
      .end();
    }
  ]
});
