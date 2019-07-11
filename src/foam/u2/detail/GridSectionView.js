foam.CLASS({
  package: 'foam.u2.detail',
  name: 'GridSectionView',
  extends: 'foam.u2.View',
  requires: [
    'foam.layout.Section',
    'foam.u2.detail.SectionedDetailPropertyView',
    'foam.u2.layout.Cols',
    'foam.u2.layout.Rows'
  ],

  css: `
    ^card-header {
      font-weight: 600;
      font-size: 12px;
      margin-bottom: 52px;
    }
  `,

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.layout.Section',
      name: 'section',
    },
    {
      class: 'Boolean',
      name: 'showTitle',
      value: true
    },
    {
      class: 'Int',
      name: 'gridUnitWidth',
      value: 4
    }
  ],
  methods: [
    function initE() {
      var self = this;
      this.SUPER();
      this
      .addClass(this.myClass())
        .add(self.slot(function(section, showTitle, section$title) {
          if ( ! section ) return;
          return self.Rows.create()
            .show(section.createIsAvailableFor(self.data$))
            .callIf(showTitle && section$title, function () {
              this.start('h2').add(section$title).end();
            })
            .forEach(section.properties, function (p) {
              this.tag(self.SectionedDetailPropertyView, { prop: p, data$: self.data$ });
            })
        }));
    }
  ]
}); 