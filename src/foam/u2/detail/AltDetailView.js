/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.detail',
  name: 'AltDetailView',
  extends: 'foam.u2.View',

  documentation: 'A detail view that lets the user choose which detail view they want to use.',

  css: `
    ^dropdown {
      margin-bottom: 16px;
    }
  `,

  properties: [
    {
      class: 'foam.u2.ViewSpec',
      name: 'detailView',
      value: { class: 'foam.u2.detail.SectionedDetailView' },
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: [
          [{ class: 'foam.u2.detail.SectionedDetailView' }, 'Cards'],
          [{ class: 'foam.u2.detail.TabbedDetailView' }, 'Tabs'],
          [{ class: 'foam.u2.detail.VerticalDetailView' }, 'Basic'],
          [{ class: 'foam.u2.detail.ChoiceSectionDetailView' }, 'Navigable'],
          [{ class: 'foam.u2.detail.WizardSectionsView' }, 'Yer a wizard, \'arry']
        ],
      }
    }
  ],

  methods: [
    function initE() {
      var self = this;
      this.SUPER();

      this
        .startContext({ data: this })
          .start()
            .addClass(this.myClass('dropdown'))
            .tag(this.DETAIL_VIEW)
          .end()
        .endContext()
        .add(this.slot(function(detailView) {
          return this.E().tag(detailView, {
            // class: detailView,
            data$: self.data$
          });
        }));
    }
  ]
});
