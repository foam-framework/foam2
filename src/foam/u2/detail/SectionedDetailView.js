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
    'foam.u2.layout.Rows',
    'foam.u2.layout.Item',
    'foam.u2.borders.CardBorder'
  ],

  css: `
    .inner-card {
      padding: 24px 16px
    }
  `,

  methods: [
    function initE() {
      var self = this;

      this.SUPER();
      this
        .addClass(this.myClass())
        .add(this.slot(function(sections, data) {
          if ( ! data ) return;

          return self.E()
            .start(self.Rows, { defaultChildStyle: { padding: '16px 0' } })
              .forEach(sections, function(s) {
                this
                  .start(self.Item)
                    .show(s.createIsAvailableFor(self.data$))
                    .start('h2').add(s.title$).end()
                    .start(self.CardBorder)
                      .addClass('inner-card')
                      .tag(self.SectionView, {
                        data$: self.data$,
                        section: s,
                        showTitle: false
                      })
                    .end()
                  .end();
              })
            .end();
        }));
    }
  ]
}); 