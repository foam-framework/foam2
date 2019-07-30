/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'ArrayView',
  extends: 'foam.u2.View',
  requires: [
    'foam.u2.layout.Cols',
    'foam.u2.layout.Rows'
  ],
  exports: [
    'mode',
    'updateData'
  ],
  properties: [
    {
      class: 'foam.u2.ViewSpec',
      name: 'valueView',
      value: { class: 'foam.u2.view.AnyView' }
    }
  ],
  actions: [
    {
      name: 'addRow',
      label: 'Add',
      isAvailable: function(mode) {
        return mode === foam.u2.DisplayMode.RW;
      },
      code: function() {
        this.data[this.data.length] = '';
        this.updateData();
      }
    }
  ],
  classes: [
    {
      name: 'Row',
      imports: [ 
        'data',
        'mode',
        'updateData'
      ],
      properties: [
        {
          class: 'Int',
          name: 'index',
          visibility: 'RO'
        },
        {
          name: 'value',
          postSet: function(_, n) {
            this.data[this.index] = n;
          }
        }
      ],
      actions: [
        {
          name: 'remove',
          label: 'X',
          isAvailable: function(mode) {
            return mode === foam.u2.DisplayMode.RW;
          },
          code: function() {
            this.data.splice(this.index, 1);
            this.updateData();
          }
        }
      ]
    }
  ],
  listeners: [
    {
      name: 'updateData',
      isFramed: true,
      code: function() {
        var d = this.data;
        this.data = [];
        this.data = d;
      }
    }
  ],
  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      this
        .add(this.slot(function(data, valueView) {
          return self.E()
            .start(self.Rows)
              .forEach(data, function (e, i) {
                var row = self.Row.create({ index: i, value: e });
                this
                  .startContext({ data: row })
                    .start(self.Cols)
                      .style({ 'padding-top': '10px', 'padding-bottom': '10px' })
                      .start(valueView, { data$: row.value$ })
                        .style({ flex: 1 })
                      .end()
                      .tag(self.Row.REMOVE, {
                        isDestructive: true
                      })
                    .end()
                  .endContext();
                row.onDetach(row.sub(self.updateData));
              });
        }))
        .startContext({ data: this }).add(this.ADD_ROW).endContext();
    }
  ]
});
