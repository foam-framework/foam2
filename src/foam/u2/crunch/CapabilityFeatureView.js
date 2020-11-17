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
    'auth',
    'crunchService',
    'ctrl',
    'subject',
    'userCapabilityJunctionDAO',
    'window'
  ],

  requires: [
    'foam.nanos.crunch.AgentCapabilityJunction',
    'foam.nanos.crunch.CapabilityJunctionStatus',
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

    ^ .foam-u2-crunch-Style-renewable-description {
      position: absolute;
      bottom: 32px;
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
    },
    {
      class: 'Boolean',
      name: 'isRenewable'
    },
    {
      class: 'Boolean',
      name: 'tooltipEnabled',
      value: true
    }
  ],

  methods: [
    function init() {
       this.SUPER();
       this.onDetach(this.crunchService.sub('updateJunction', this.daoUpdate));
       this.daoUpdate();
       this.onDetach(this.cjStatus$.sub(this.statusUpdate));
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
          .add(this.slot(function(cjStatus, isRenewable) {
            return this.E().addClass(style.myClass('tooltip'))
              .start('span')
                .addClass(style.myClass('tooltiptext'))
                .addClass(style.myClass('tooltip-bottom'))
                .enableClass(style.myClass('tooltipDisabled'), self.tooltipEnabled, true)
                .add(cjStatus.documentation)
              .end()
              .start()
                .addClass(style.myClass('renewable-description'))
                .add(isRenewable ? "Capability is renewable" : "")
              .end()
              .add(cjStatus.label).addClass(style.myClass('badge'))
              .style({ 'background-color': cjStatus.background });
          }))
        .end()
        .start()
          .addClass(style.myClass('card-title'))
          .add(( self.data.name != '') ?  { data : self.data, clsInfo : self.data.cls_.NAME.name, default : self.data.name }  : self.data.id)
        .end();
    }
  ],

  listeners: [
    {
      name: 'daoUpdate',
      code: function() {
        this.crunchService.getJunction(null, this.data.id).then(ucj => {
          if ( ucj ) {
            this.cjStatus = ucj.status === this.CapabilityJunctionStatus.APPROVED ?
              this.CapabilityJunctionStatus.PENDING : ucj.status;
          }
          if ( this.cjStatus === this.CapabilityJunctionStatus.GRANTED ) {
            this.crunchService.isRenewable(this.ctrl.__subContext__, ucj.targetId).then(
              isRenewable => this.isRenewable = isRenewable
            );
          }
          if ( this.cjStatus === this.CapabilityJunctionStatus.ACTION_REQUIRED ) {
            this.auth.check(this.ctrl.__subContext__, 'certifydatareviewed.rw.reviewed').then(result => {
              if ( ! result &&
                ( ucj.targetId == '554af38a-8225-87c8-dfdf-eeb15f71215f-49' ||
                  ucj.targetId == '554af38a-8225-87c8-dfdf-eeb15f71215f-13' ||
                  ucj.targetId == '554af38a-8225-87c8-dfdf-eeb15f71215f-12' ||
                  ucj.targetId == '554af38a-8225-87c8-dfdf-eeb15f71215f-11'
                ) ) {
                this.cjStatus = this.CapabilityJunctionStatus.PENDING_REVIEW;
              }
            }).catch(err => {
              if ( err.data && err.data.id === 'foam.nanos.crunch.CapabilityIntercept' &&
                ( ucj.targetId == '554af38a-8225-87c8-dfdf-eeb15f71215f-49' ||
                  ucj.targetId == '554af38a-8225-87c8-dfdf-eeb15f71215f-13' ||
                  ucj.targetId == '554af38a-8225-87c8-dfdf-eeb15f71215f-12' ||
                  ucj.targetId == '554af38a-8225-87c8-dfdf-eeb15f71215f-11'
                ) ) {
                this.cjStatus = this.CapabilityJunctionStatus.PENDING_REVIEW;
              } else throw err;
            });

            if ( ucj.targetId == '554af38a-8225-87c8-dfdf-eeb15f71215f-20' ) {
              this.cjStatus = this.CapabilityJunctionStatus.PENDING_REVIEW;
            }
          }
        });
      }
    },
    {
      name: 'statusUpdate',
      code: function() {
        if ( this.cjStatus != this.CapabilityJunctionStatus.PENDING ) {
          return;
        }
        this.crunchService.getJunction(null, this.data.id).then(ucj => {
          if ( ucj && ucj.status === this.CapabilityJunctionStatus.GRANTED ) {
            this.cjStatus = this.CapabilityJunctionStatus.GRANTED;
          } else {
            this.window.setTimeout(this.statusUpdate, 2000);
          }
        })
      }
    }
  ]
});
