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
    'foam.u2.layout.Grid',
    'foam.u2.layout.GUnit',
    'foam.u2.borders.CardBorder'
  ],

  css: `
    ^ .inner-card {
      padding: 14px 16px
    }

    ^ .foam-u2-view-ScrollTableView table {
      width: 100%;
    }

    ^ ^card-container + ^card-container {
      margin-top: 16px;
    }
  `,

  properties: [
    {
      class: 'foam.u2.ViewSpec',
      name: 'border',
      factory: function() {
        return this.CardBorder;
      }
    }
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
            .start(self.Grid)
              .forEach(sections, function(s) {
                this
                  .start(self.GUnit, { columns: s.gridColumns })
                    .addClass(self.myClass('card-container'))
                    .show(s.createIsAvailableFor(self.data$))
                    .start('h2')
                      .add(s.title$)
                      .show(s.title$)
                    .end()
                    .start(self.border)
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
