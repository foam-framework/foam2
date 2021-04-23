/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard',
  name: 'ScrollWizardletView',
  extends: 'foam.u2.wizard.WizardletView',

  documentation: `Simply displays wizardlets consecutively.`,

  requires: [
    'foam.log.LogLevel'
  ],

  imports: [
    'notify',
    'stack'
  ],

  implements: [
    'foam.mlang.Expressions'
  ],

  messages: [
    { name: 'ACTION_LABEL', message: 'Submit' },
    { name: 'SAVE_IN_PROGRESS', message: 'Saving...' },
    { name: 'ERROR_MSG', message: 'Information was not successfully submitted, please try again later' },
    { name: 'ERROR_MSG_DRAFT', message: 'An error occured while saving your progress' },
    { name: 'SUCCESS_MSG', message: 'Information successfully submitted' },
    { name: 'SUCCESS_MSG_DRAFT', message: 'Your progress has been saved' },
  ],

  css: `
    ^ {
      margin: 30px;
    }
  `,

  requires: [
    'foam.u2.detail.VerticalDetailView'
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'isErrorFree',
      expression: function(wizardlets) {
        var check = true;
        wizardlets.forEach(wizardlet => {
          if ( ! wizardlet.validate() ) {
            check = false;
          }
        });
        return check;
      }
    }
  ],

  methods: [
    function initE() {
      var self = this;
      this.addClass(this.myClass());
      this.start('h1').add(this.title).end()
        .start()
        .add(this.slot(
          wizardlets => {
            return this.E().forEach(
              wizardlets.filter(section => section.of),
              wizardlet => {
                var subThis = this.startContext({});
                subThis.__subSubContext__.register(
                  this.VerticalDetailView,
                  'foam.u2.detail.SectionedDetailView'
                );
                subThis.tag(this.VerticalDetailView, {
                  data: wizardlet.data
                });
              }
            );
          }
        ))
      .end()
      .startContext({ data: this })
        .tag(this.EXIT, { size: 'LARGE' })
        .callIfElse(this.isErrorFree,
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
      confirmationRequired: function() {
        return true;
      },
      code: function(x) {
        x.stack.back();
      }
    },
    {
      name: 'save',
      code: function(x) {
        var p = Promise.resolve();

        this.wizardlets.reduce(
          (p, wizardlet) => p.then(() => wizardlet.save()), p
        ).then(() => {
          x.ctrl.notify(this.isErrorFree ? this.SUCCESS_MSG : this.SUCCESS_MSG_DRAFT, '', this.LogLevel.INFO, true);
          x.stack.back();
        }).catch(e => {
          x.ctrl.notify(
            (this.isErrorFree ? this.ERROR_MSG : this.ERROR_MSG_DRAFT)
            + ': ' + e, '', this.LogLevel.INFO, true
          );
        });
      }
    }
  ]
});
