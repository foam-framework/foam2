// TODO: Migrate this to SectionView and then delete this file

foam.CLASS({
  package: 'foam.u2.detail',
  name: 'GridSectionView',
  extends: 'foam.u2.View',
  requires: [
    'foam.layout.Section',
    'foam.u2.detail.SectionedDetailPropertyView',
    'foam.u2.layout.Grid',
    'foam.u2.layout.GUnit',
    'foam.u2.layout.Rows',
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
      name: 'unitWidth',
      value: 4
    }
  ],
  methods: [
    function initE() {
      var self = this;
      this.SUPER();
      this
      .addClass(this.myClass())
        .add(self.slot(function(section, showTitle, section$title, unitWidth) {
          if ( ! section ) return;
          return self.Rows.create()
            .show(section.createIsAvailableFor(self.data$))
            .callIf(showTitle && section$title, function () {
              this.start(this.myClass('card-header')).add(section$title).end();
            })
            .start(self.Grid)
              .forEach(section.properties, function (p) {
                this.start(self.GUnit, { columns: unitWidth })
                  .tag(self.SectionedDetailPropertyView, { prop: p, data$: self.data$ })
                .end()
              })
            .end();
        }));
    }
  ]
}); 