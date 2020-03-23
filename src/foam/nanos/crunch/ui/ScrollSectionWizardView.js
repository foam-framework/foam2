/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.ui',
  name: 'ScrollSectionWizardView',
  extends: 'foam.u2.detail.MultipleModelSectionedDetailView',

  documentation: `Simply displays "sections" consecutively.`,

  imports: [
    'notify',
    'stack'
  ],
  
  implements: [
    'foam.mlang.Expressions'
  ],

  css: `
    ^ {
      margin: 30px;
    }
  `,

  requires: [
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.UserCapabilityJunction'
  ],

  properties: [
    {
      class: 'String',
      name: 'title'
    },
    {
      class: 'DateTime',
      name: 'lastUpdate'
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'sectionView',
      value: { class: 'foam.u2.detail.SectionView' }
    }
  ],

  messages: [
    { name: 'SUCCESS_MSG', message: 'Information successfully submitted.' },
    { name: 'ERROR_MSG', message: 'Information was not successfully submitted, please try again later' }
  ],

  listeners: [
    {
      name: 'onDataUpdate',
      isFramed: true,
      code: function() {
        this.lastUpdate = new Date();
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this.addClass(this.myClass());
      this.start('h1').add(this.title).end()
        .start()
        .add(this.slot(
          (sectionsList) => {
            return this.E().forEach(sectionsList,
              (dataEntry) => (dataEntry.sections).map(
                (section) =>
                  this.tag(this.sectionView, {
                    section: section,
                    data: dataEntry.data
                  })
              )
            );
          }
        ))
      .end()
      .startContext({ data: this })
        .tag(this.SUBMIT, { size: 'LARGE' })
        .tag(this.SAVE, { size: 'LARGE' })
      .endContext();
    }
  ],

  actions: [
    {
      name: 'submit',
      code: function(x) {
        console.log('submit');
        this.sectionsList.forEach((model, i) => {
          let dao = this.__subSubContext__[model.dao];
          dao.find(model.daoKey)
          .then((result) => {
            let objToSubmit;
            if ( result ) objToSubmit = result.copyFrom(model.data);
            else objToSubmit = dao.of.create(model.data, this);
            dao.put(objToSubmit).then(
              () => {
                this.notify(this.SUCCESS_MSG);
                this.stack.back();
              }
            ).catch(
              (e) => this.notify(this.ERROR_MSG + `${e && e.message ? ': ' + e.message : (e ? ': ' + e : '')}`, 'error')
            );
          }).catch(
            (e) => this.notify(this.ERROR_MSG + `${e && e.message ? ': ' + e.message : (e ? ': ' + e : '')}`, 'error')
          );
        });
      }
    },
    {
      name: 'save',
      code: function(x) {

        var userCapabilityJunctionDAO = x.userCapabilityJunctionDAO;

        this.sectionsList.forEach((m, i) => {
          var ucj = foam.nanos.crunch.UserCapabilityJunction.create({
            sourceId: x.user.id,
            targetId: this.capsList[i],
            data: m.data
          });
          userCapabilityJunctionDAO.put_(x, ucj)
        });
        
        x.ctrl.notify('Your progress has been saved.');
        x.stack.back();
      }
    }
  ]
});
