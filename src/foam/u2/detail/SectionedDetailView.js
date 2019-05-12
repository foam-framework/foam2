/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.detail',
  name: 'SectionedDetailView',
  extends: 'foam.u2.detail.AbstractSectionedDetailView',

  requires: [
    'foam.u2.detail.SectionView',
    'foam.u2.layout.Cols',
    'foam.u2.layout.Rows'
  ],

  methods: [
    function initE() {
      var self = this;

      this.SUPER();
      this
        .add(this.slot(function(sections, data) {
          if ( ! data ) return;

          return self.E()
            .start(self.Rows, { border: 'foam.u2.borders.CardBorder' })
              .forEach(sections, function(s) {
                this.start(self.Rows)
                  .show(s.createIsAvailableFor(self.data$))
                  .start('h2').add(s.title$).end()
                  .tag(self.SectionView, { data: s })
                .end();
              })
            .end();
        }));
    }
  ]
}); 