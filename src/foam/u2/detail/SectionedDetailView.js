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
    'foam.u2.detail.SectionedDetailPropertyView',
    'foam.u2.layout.Cols',
    'foam.u2.layout.Rows',
    'foam.u2.borders.CardBorder',
  ],

  css: `
    .section-header {
      font-weight: bold;
      font-size: 1.5em;
    }

    .inner-card {
      padding: 32px 16px
    }
  `,

  methods: [
    /**
     * first render the properties row by row using Rows, then at the end
     * render all the actions together in a single row with Cols
     */
    function initE() {
      var self = this;
      this.SUPER();
      this
        .addClass(this.myClass())
        .add(this.slot(function(sections, data) {
          if ( ! data ) return;
          return self.E()
            .start(self.Rows, { defaultChildConfig: { padding: '16px 0' } })
              .forEach(sections, function(s) {
                this.start(self.Row).add(s.title$).addClass('section-header').end()
                .start(self.CardBorder).addClass('inner-card')
                  .start(self.Rows)
                    .forEach(s.properties,  function(p) {
                      this.tag(self.SectionedDetailPropertyView, { prop: p, data: data })
                    })
                    .start(self.Cols)
                      .forEach(s.actions, function(a) {
                        this.add(a);
                      })
                    .end()
                  .end()
                .end();
              })
            .end();
        }));
    }
  ]
}); 