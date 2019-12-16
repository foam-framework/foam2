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
    'foam.core.FObject',
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
    },
    {
      name: 'defaultNewItem',
      value: ''
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
        var newItem = this.defaultNewItem;
        if ( this.FObject.isInstance(newItem) ) {
          newItem = newItem.clone();
        }
        this.data[this.data.length] = newItem;
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
          label: '',
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

  css: `
    ^value-view-container {
      border-top: 1px solid /*%GREY4%*/ #e7eaec;
    }

    ^ .foam-u2-ActionView-addRow {
      margin: 8px 0;
    }

    ^ .foam-u2-ActionView-remove {
      align-self: flex-start;
    }

    ^value-view-container:last-child {
      border-bottom: 1px solid /*%GREY4%*/ #e7eaec;
    }

    ^value-view {
      flex: 1;
    }
  `,

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this.addClass(this.myClass());

      this
        .add(this.slot(function(data, valueView) {
          return self.E()
            .start(self.Rows)
              .forEach(data || [], function(e, i) {
                var row = self.Row.create({ index: i, value: e });
                this
                  .startContext({ data: row })
                    .start(self.Cols)
                      .addClass(self.myClass('value-view-container'))
                      .start(valueView, { data$: row.value$ })
                        .addClass(self.myClass('value-view'))
                      .end()
                      .tag(self.Row.REMOVE, {
                        isDestructive: true,
                        icon: 'images/remove-circle.svg',
                        buttonStyle: 'UNSTYLED'
                      })
                    .end()
                  .endContext();
                row.onDetach(row.sub(self.updateData));
              });
        }))
        .startContext({ data: this })
          .tag(this.ADD_ROW, { buttonStyle: 'SECONDARY' })
        .endContext();
    }
  ]
});
