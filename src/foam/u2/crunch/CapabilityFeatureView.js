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
    'foam.u2.crunch.Style',
    'foam.u2.Tooltip',
    'foam.u2.view.ReadOnlyEnumView'
  ],

  documentation: `
    A single card in a list of capabilities.
  `,

  css: `
    ^ .foam-u2-crunch-Style-cardpart {
      position: relative;
    }

    ^badge {
      position: absolute;
      bottom: 12px; 
    }

    ^badge > * {
      border-radius: 0px 11.2px 11.2px 0px !important;
      border-style: none !important;
      height: 24px;
      width: 79px;
    }

    ^ .foam-u2-crunch-Style-renewable-description {
      position: absolute;
      top: 0px;
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
      value: null
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

  messages: [
    { name: 'RENEW_DATA_LABEL', message: 'Please review and update your data' }
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
          .add(this.slot(function(cjStatus) {
            if ( ! cjStatus ) return;
            return this.E()
              .start('', { tooltip: cjStatus.documentation })
                .addClass(this.myClass('badge'))
                .add(foam.u2.view.ReadOnlyEnumView.create({ data: cjStatus }))
              .end();
          }))
          .add(this.slot(function(isRenewable) {
            return isRenewable ? this.E()
              .start()
                .addClass(style.myClass('renewable-description'))
                .add(self.RENEW_DATA_LABEL)
              .end() : null;
          }))
        .end()
        .start()
          .addClass(style.myClass('card-title'))
          .translate(self.data.id + '.' + self.data.cls_.NAME.name, self.data.name)
        .end();
    }
  ],

  listeners: [
    {
      name: 'daoUpdate',
      code: function() {
        // This code looks hardcorded - why aren't the statuses being set and shown using ucj data status?
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
      isMerged: true,
      mergeDelay: 2000,
      code: function() {
        if ( this.cjStatus != this.CapabilityJunctionStatus.PENDING &&
              this.cjStatus != this.CapabilityJunctionStatus.PENDING_REVIEW ) {
          return;
        }
        this.crunchService.getJunction(null, this.data.id).then(ucj => {
          if ( ucj && ucj.status === this.CapabilityJunctionStatus.GRANTED ) {
            this.auth.cache = {};
            this.crunchService.pub('grantedJunction');
            this.cjStatus = this.CapabilityJunctionStatus.GRANTED;
          }
          else if ( ucj && ucj.status === this.CapabilityJunctionStatus.ACTION_REQUIRED ) {
            this.cjStatus = this.CapabilityJunctionStatus.ACTION_REQUIRED;
          } else {
            this.statusUpdate();
          }
        })
      }
    }
  ]
});
