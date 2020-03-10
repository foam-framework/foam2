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
    'stack'
  ],

  css: `
    ^ {
      margin: 30px;
    }
  `,

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
      }
    },
    {
      name: 'save',
      code: function(x) {
        console.log('saving');
        this.stack.back();
      }
    }
  ]
});
