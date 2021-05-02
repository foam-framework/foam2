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
      padding: 14px 24px
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
          var grid = self.Grid.create()
            .forEach(sections, function(s) {
              var slot = s.createIsAvailableFor(self.data$).map(function(isAvailable) {

                // NOTE: If we just return undefined here, then Element.slotE_
                // will put a self.E('SPAN') here. That span will be a child of
                // the Grid, which means the grid gap will apply to it, which
                // means that hidden sections will produce undesirable
                // whitespace that ruins the layout. Therefore we explicitly
                // return a dummy element here and set display: none so that the
                // grid doesn't add whitespace around it.
                if ( ! isAvailable ) return self.E().style({ display: 'none' });

                // Support string titles and functions
                var title$ = foam.Function.isInstance(s.title) ?
                foam.core.ExpressionSlot.create({
                  obj$: self.data$,
                  code: s.title
                }) :
                s.title$;

                return self.GUnit.create({ columns: s.gridColumns })
                  .addClass(self.myClass('card-container'))
                  .start('h2')
                    .add(title$)
                    .show(title$)
                  .end()
                  .start(self.border)
                    .addClass('inner-card')
                    .tag(self.SectionView, {
                      data$: self.data$,
                      section: s,
                      showTitle: false
                    })
                  .end();
              });
              this.add(slot);

              // NOTE: We need to trigger `resizeChildren` manually because when
              // the slot changes and the view updates, it doesn't trigger the
              // `onAddChildren` listener on Grid, which is what normally
              // triggers `resizeChildren`, which is what sets the grid-related
              // CSS properties. If resizeChildren doesn't fire, then any
              // sections that updated when the slot changed won't have the grid
              // CSS applied to them, so the layout will be broken.
              this.onDetach(slot.sub(this.framed(function() { grid.resizeChildren(); })));
            });

          return grid;
        }));
    }
  ]
});
