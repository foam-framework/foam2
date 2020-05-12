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

  messages: [
    { name: 'SaveSuccess', message: 'Your progress has been saved.' },
    { name: 'SaveFail', message: 'An error occured while saving your progress.' },
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
    },
    {
      class: 'Boolean',
      name: 'isErrorFree',
      expression: function(sectionsList) {
        var check = true;
        sectionsList.forEach((wizardSection) => {
          if ( ! wizardSection.of ) return true;
          if ( wizardSection.data.errors_ ) {
            check = false;
          }
        });
        return check;
      }
    }
  ],

  messages: [
    { name: 'SUCCESS_MSG', message: 'Information successfully submitted.' },
    { name: 'ERROR_MSG', message: 'Information was not successfully submitted, please try again later' },
    { name: 'ACTION_LABEL', message: 'Submit' },
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
      var self = this;
      this.SUPER();
      this.addClass(this.myClass());
      this.start('h1').add(this.title).end()
        .start()
        .add(this.slot(
          (sectionsList) => {
            return this.E().forEach(
              sectionsList.filter((section) => section.of),
              (wizardSection) => (wizardSection.ofSections).map(
                (section) =>
                  this.tag(this.sectionView, {
                    section: section,
                    data: wizardSection.data
                  })
              )
            );
          }
        ))
      .end()
      .startContext({ data: this })
        .tag(this.EXIT, { size: 'LARGE' })
        .callIfElse( this.isErrorFree,
          function() {
            self.tag(this.SAVE, { size: 'LARGE', label: this.ACTION_LABEL });
          },
          function() {
            self.tag(this.SAVE, { size: 'LARGE' });
          })
      .endContext();
    }
  ],

  actions: [
    {
      name: 'exit',
      confirmationRequired: true,
      code: function(x) {
        x.stack.back();
      }
    },
    {
      name: 'save',
      code: function(x) {
        Promise.all(
          this.sectionsList.map(wizardSection => wizardSection.save())
        ).then(() => {
          x.ctrl.notify(this.SAVE_SUCCESS);
          x.stack.back();
        }).catch(() => {
          x.ctrl.notify(this.SAVE_ERROR, 'error');
        });
      }
    }
  ]
});
