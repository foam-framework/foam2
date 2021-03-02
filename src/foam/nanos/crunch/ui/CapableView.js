/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.ui',
  name: 'CapableView',
  extends: 'foam.u2.View',
  documentation: 'A view for displaying capable objects',

  imports: [
    'crunchController',
    'notify',
    'subject',
    'userCapabilityJunctionDAO',
    'userDAO'
  ],

  requires: [
    'foam.log.LogLevel',
    'foam.nanos.crunch.AgentCapabilityJunction',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.u2.detail.AbstractSectionedDetailView',
    'foam.u2.detail.SectionView'
  ],

  css: `
    ^ .foam-u2-detail-SectionedDetailPropertyView .foam-u2-CheckBox-label {
      top: 0px;
      position: relative;
    }
  `,

  properties: [
    {
      name: 'capableObj',
      documentation: 'a capable object'
    },
    {
      name: 'ucjObj',
      documentation: 'ucj object'
    },
    {
      class: 'FObjectArray',
      of: 'foam.u2.wizard.BaseWizardlet',
      name: 'wizardlets',
      documentation: 'wizardlets for capable payloads',
      postSet: function(_, n) {
        if (this.capableObj) {
          this.listenOnWizardlets();
        }
      }
    },
    {
      class: 'Array',
      name: 'wizardletSectionsList',
      documentation: `
        sections for wizardlets
        wizardletSectionsList[i] stores sections for wizardlets[i]
      `,
      factory: function() {
        return this.wizardlets.map(wizardlet =>
          this.AbstractSectionedDetailView.create({
            of: wizardlet.of
          }).sections);
      }
    },
    {
      class: 'Boolean',
      name: 'showTitle'
    }
  ],

  methods: [
    async function initE() {
      this.SUPER();

      const self = this;

      // a flag for checking if the capable object has payloads
      // const hasPayloads = this.capableObj.capablePayloads &&
      //   Object.keys(this.capableObj.capablePayloads).length > 0;

      // set wizardlets based on the capableObj
      // note: payloads data are also set from getWizardletsFromCapable
      //       this is why we add listeners to payloads data after wizardlets are set

      //this.__subContext__.createSubContext({'controllerMode':foam.u2.ControllerMode.VIEW}
      //export controllerMode 
      //ContextAgent

      var x;
      if (this.ucjObj) {
        var user = await this.userDAO.find(this.data.effectiveUser);
        var realUser = await this.userDAO.find(this.data.sourceId);
        var subject = foam.nanos.auth.Subject.create({user: user, realUser: realUser}, this);
        var x = this.__subContext__.createSubContext({ subject: subject })
        this.wizardlets = this.ucjObj ?
          await this.crunchController.createCapabilityViewSequence(this.data.targetId, x)
            .reconfigure('LoadCapabilitiesAgent', {
              subject: subject })
            .reconfigure('LoadWizardletsAgent', {
              subject: subject })
            .remove('UnlockPaymentsWizardConfig')
            .execute().then(x => x.wizardlets)
          : [];
      }
      if (this.capableObj) {
        this.wizardlets = this.capableObj ?
          await this.crunchController.createCapableViewSequence(this.capableObj)
            .execute().then(x => x.wizardlets)
          : [];
      }

      this.start().addClass(this.myClass())
        .forEach(this.wizardlets, function (w, wi) {
          this.add(foam.core.ExpressionSlot.create({
            args: [w.sections$, w.data$],
            code: (sections, data) => {
              return sections.map(section => section.createView({
                showTitle: self.showTitle,
                wizardlet: w
              }, x));
            }
          }, x));
        })
      .end();
    },

    // add listeners to wizardlet data
    // TODO: after scrolling wizard is merged, remove this method and add
    //   AutoSaveWizardletsAgent to the sequence.
    function listenOnWizardlets() {
      for ( let wizardlet of this.wizardlets ) {
        let s = foam.core.FObject.create();
        let saving = false;
        let bind = () => {
          if ( ! wizardlet.data || ! wizardlet.data.cls_ ) return;
          s.detach();
          if ( ! saving ) {
            saving = true;
            wizardlet.save().then(() => { saving = false; console.log('y') });
          }
          s = foam.core.FObject.create();
          var props = wizardlet.data.cls_.getAxiomsByClass(foam.core.Property);
          for ( let prop of props ) {
            let prop$ = prop.toSlot(wizardlet.data);
            s.onDetach(prop$.sub(() => {
              if ( saving ) return;
              saving = true;
              wizardlet.save().then(() => { saving = false; console.log('c'); });
            }));
          }
        };
        wizardlet.data$.sub(bind);
        bind();
      }
    }
  ]
});
