/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2',
  name: 'SectionedDetailView',
  extends: 'foam.u2.AbstractSectionedDetailView',

   methods: [
    /**
     * first render the properties row by row using Rows, then at the end
     * render all the actions together in a single row with Cols
     */
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
                  .start('h2').add(s.title$).end()
                  .forEach(s.properties,  function(p) {
                    this.tag(self.SectionedDetailPropertyView, { prop: p, data: data })
                  })
                  .start(self.Cols)
                    .forEach(s.actions, function(a) {
                      this.add(a);
                    })
                  .end()
                .end();
              })
            .end();
        }));
    }
  ]
}); 
