

/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.ui',
  name: 'ModelBuilderWizard',
  extends: 'foam.u2.detail.MultipleModelAbstractSectionedDetailView',

  requires: [
    'foam.u2.layout.Cols',
    'foam.u2.layout.Rows'
  ],

  css: `
    ^ .foam-u2-layout-Cols {
      align-items: center;
    }
    ^wizard-body {
      height: 100%;
      background-color: white;
    }

    ^footer {
      min-height: 75px;
      border-top: solid 1px /*%GREY5%*/ #edf0f5;
      padding: 0px 128px;
    }

    ^next-button {
      width: 156px;
      height: 48px;
    }
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
          let v = [];
          u.forEach((section) => {
            v.push(this.tag(this.sectionView, {
              section: section,
              data: y
            }));
          });
          return v;
        });
      }))
      .end();
    }
  ]
});
