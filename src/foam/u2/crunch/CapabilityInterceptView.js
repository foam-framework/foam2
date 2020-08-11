/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch',
  name: 'CapabilityInterceptView',
  extends: 'foam.u2.View',

  implements: [ 'foam.mlang.Expressions' ],

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
      name: 'onClose',
      class: 'Function',
      factory: () => (x) => {
        x.closeDialog();
      }
    }
  ],

  messages: [
    { name: 'REJECTED_MSG', message: 'Your choice to bypass this was stored, please refresh page to revert cancel selection.' }
  ],

  css: `
    ^detail-container {
      overflow-y: scroll;
    }
    ^ > *:not(:last-child) {
      margin-bottom: 24px !important;
    }
  `,

  methods: [
    function initE() {
      this.data.capabilityOptions.forEach((c) => {
        if ( this.capabilityCache.has(c) && this.capabilityCache.get(c) ) {
          this.aquire();
        }
      });

      var self = this;
      this
        .addClass(this.myClass())
        .start(this.Rows)
          .addClass(this.myClass('detail-container'))
          .add(this.slot(function (data$capabilityOptions) {
            return this.E().select(this.capabilityDAO.where(
              self.IN(self.Capability.ID, data$capabilityOptions)
            ), (cap) => {
              return this.E().tag(self.CapabilityCardView, {
                data: cap
              })
                .on('click', () => {
                  var p = self.crunchController.launchWizard(cap);
                  p.then(() => {
                    this.checkStatus(cap);
                  })
                })
            })
          }))
        .end()
        .startContext({ data: this })
          .tag(this.CANCEL, { buttonStyle: 'SECONDARY' })
        .endContext();
    },
    function checkStatus(cap) {
      // Query UCJ status
      var associatedEntity = cap.associatedEntity === foam.nanos.crunch.AssociatedEntity.USER ? this.subject.user : this.subject.realUser;
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
      this.data.capabilityOptions.forEach((c) => {
        this.capabilityCache.set(c, true);
      });
      this.onClose(x);
    },
    function reject(x) {
      x = x || this.__subSubContext__;
      this.data.cancelled = true;
      this.data.capabilityOptions.forEach((c) => {
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
