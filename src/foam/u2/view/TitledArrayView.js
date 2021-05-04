/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'TitledArrayView',
  extends: 'foam.u2.view.FObjectArrayView',

  documentation: 'View for FObjectArrays that includes a header row with a title and a delete button',

  imports: ['theme'],

  css: `
    ^ .foam-u2-DetailView {
      border: 1px solid #ddd;
      margin-bottom: 8px;
    }
    ^header-row {
      align-items: center;
    }
  `,

  properties: [
    {
      name: 'title',
      documentation: 'This property is used to populate the header for each individual array element'
    }
  ],

  methods: [
    function initE() {
      var self = this;

      this.onDetach(this.data$.sub(() => { if ( ! this.feedback_ ) this.data2_ = this.data; }));
      this.data2_ = this.data;
      this.addClass(this.myClass());

      this
        .add(this.slot(function(data2_, valueView) {
          var data = data2_;
          return self.E()
            .start(self.Rows)
              .forEach(data || [], function(e, i) {
                var row = self.Row.create({ index: i, value: e });
                this
                  .startContext({ data: row })
                    .addClass(self.myClass('value-view-container'))
                    .start(self.Cols)
                      .addClass(self.myClass('header-row'))
                      .start('h5').add((self.name || foam.String.labelize(e.cls_.name)) + ' #' + (i+1) ).end()
                      .tag(self.Row.REMOVE, {
                        isDestructive: true,
                        // icon: '/images/remove-circle.svg',
                        // encode data as an embedded data URL of the SVG
                        // because then the GUI updates without flickering
                        buttonStyle: 'TERTIARY',
                        icon: self.theme ? self.theme.glyphs.trash.getDataUrl() : "data:image/svg+xml;utf8,%0A%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath d='M0 0h24v24H0z' fill='none'/%3E%3Cpath fill='%23d9170e' d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z'/%3E%3C/svg%3E"
                      })
                    .end()
                    .start(valueView, { data$: row.value$ })
                      .addClass(self.myClass('value-view'))
                    .end()
                    .start().style({ margin: '10px 0px', width: '100%', border: '1px solid', 'border-color': this.theme? this.theme.grey4 : 'grey' }).end()
                  .endContext();
                row.onDetach(row.sub(self.updateDataWithoutFeedback));
              });
        }))
        .startContext({ data: this })
          .tag(this.ADD_ROW, {
            size: 'SMALL',
            buttonStyle: 'SECONDARY',
            icon: this.theme ? this.theme.glyphs.plus.getDataUrl({ fill: this.theme.grey1 }) : "data:image/svg+xml;utf8,%0A%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath d='M0 0h24v24H0z' fill='none'/%3E%3Cpath fill='%2317d90e' d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z'/%3E%3C/svg%3E"
          })
        .endContext();
    }
  ]
});
