/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.ui',
  name: 'ScrollSectionWizardView',
  extends: 'foam.u2.detail.MultipleModelSectionedDetailView',

  documentation: `Takes in a list of class paths in "ofList" representing the MultipleModels
  and creates a section list in "sections" for editing properties.`,

  css: `
  `,

  properties: [
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
      this.start()
        .add(this.slot((sections) => {
         return this.E().forEach(sections, (dataEntry) => {
          let y = dataEntry.data;
          let u = dataEntry.sections;
          u.fmap((section) => {
            return this.tag(this.sectionView, {
              section: section,
              data: y
            });
          });
          return v;
        });
      }))
      .end();
    }
  ]
});
