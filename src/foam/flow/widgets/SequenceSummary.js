/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.flow.widgets',
  name: 'SequenceSummary',
  extends: 'foam.u2.Element',
  documentation: `
    Brief summary of properties for overview documentation.
  `,

  requires: [
    'foam.core.NullAgent'
  ],

  css: `
    ^nullAgent {
      background-color: %DESTRUCTIVE2% !important;
      color: %WHITE%;
    }
  `,

  properties: [
    {
      name: 'of',
      class: 'Class'
    },
    {
      name: 'method',
      class: 'String'
    }
  ],

  methods: [
    function initE() {
      var instance = this.of.create(null, this.__subContext__);
      var sequence = instance[this.method]();

      var self = this;
      this
        .start('table')
          .start('tr')
            .start('th').add('Name').end()
            .start('th').add('Documentation').end()
          .end()
          .forEach(sequence.contextAgentSpecs, function (step) {
            this.start('tr')
              .start('td')
                .add(step.name)
              .end()
              .start('td')
                .callIfElse(self.NullAgent.isSubClass(step.spec), function () {
                  this.addClass(self.myClass('nullAgent'))
                    .add('This agent was removed from a parent sequence.');
                }, function () {
                  this.add(step.spec.model_.documentation)
                })
                .callIf(step.args, function () {
                  var views = self.viewsFor_(step.args);
                  this.start('table')
                    .start('tr')
                      .start('th').add('Property').end()
                      .start('th').add('Value').end()
                    .end()
                    .forEach(Object.keys(views), function (k) {
                      this.start('tr')
                        .start('td').add(k).end()
                        .start('td')
                          .callIfElse(views[k] == null, function () {
                            this.add(step.args(k));
                          }, function () {
                            this
                              .startContext({ data: step.args[k] })
                                .tag(views[k], { data: step.args[k] })
                              .endContext();
                          })
                        .end()
                    })
                  .end()
                })
              .end()
            .end()
          })
        .end();
    },
    function viewsFor_(args) {
      var views = {};
      for ( let k in args ) {
        if ( args[k] && args[k].cls_ && foam.core.AbstractEnum.isInstance(args[k]) ) {
          views[k] = { class: 'foam.u2.view.ReadOnlyEnumView' };
          continue;
        }
        views[k] = null;
      }
      return views;
    }
  ],
});
