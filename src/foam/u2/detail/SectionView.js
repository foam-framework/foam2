/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.detail',
  name: 'SectionView',
  extends: 'foam.u2.Element',
  requires: [
    'foam.u2.detail.SectionedDetailPropertyView',
    'foam.u2.layout.Cols',
    'foam.u2.layout.Rows'
  ],
  imports: [
    'data as fobj'
  ],
  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.layout.Section',
      name: 'data'
    },
    {
      class: 'Boolean',
      name: 'showTitle',
      value: true
    }
  ],
  methods: [
    function initE() {
      var self = this;
      self.SUPER();
      self
        .add(self.slot(function(data, showTitle) {
          return self.Rows.create()
            .show(data.createIsAvailableFor(self.fobj$))
            .callIf(showTitle, function () {
              this.start('h2').add(data.title$).end();
            })
            .forEach(data.properties, function (p) {
              this.tag(self.SectionedDetailPropertyView, { prop: p, data$: self.fobj$ });
            })
            .start(self.Cols)
              .forEach(data.actions, function (a) {
                this.add(a);
              })
            .end();
        }));
    }
  ]
}); 