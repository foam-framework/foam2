/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.detail',
  name: 'VerticalDetailView',
  extends: 'foam.u2.detail.AbstractSectionedDetailView',

  requires: [
    'foam.u2.detail.SectionView',
    'foam.u2.layout.Rows'
  ],

  methods: [
    function initE() {
      var self = this;
      this.SUPER();
      this
        .addClass(this.myClass())
        .add(this.slot(function(sections, data) {
          if ( ! data ) return;
          return self.E()
            .start(self.Rows)
              .forEach(sections, function(s) {
                this
                  .start(self.SectionView, {
                    data$: self.data$,
                    section: s
                  })
                    .show(s.createIsAvailableFor(self.data$))
                  .end();
              })
            .end();
        }));
    }
  ]
});
