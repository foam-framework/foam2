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
    'enableRemoving',
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
    },
    {
      class: 'Boolean',
      name: 'enableAdding',
      value: true
    },
    {
      class: 'Boolean',
      name: 'enableRemoving',
      value: true
    },
    // The next two properties are used to avoid excess flickering.
    // We only update data to data2_ when we know that our feedback
    // didn't cause the update. This prevents the whole view from
    // being redrawn when we update a single row's value.
    {
      name: 'data2_'
    },
    {
      class: 'Boolean',
      name: 'feedback_'
    }
  ],

  actions: [
    {
      name: 'addRow',
      label: 'Add',
      isAvailable: function(mode, enableAdding) {
        return enableAdding && mode === foam.u2.DisplayMode.RW;
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
        'enableRemoving',
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
            if ( this.data[this.index] === n ) return;
            this.data[this.index] = n;
            this.updateData();
          }
        }
      ],
      actions: [
        {
          name: 'remove',
          label: '',
          isAvailable: function(enableRemoving, mode) {
            return enableRemoving && mode === foam.u2.DisplayMode.RW;
          },
          code: function() {
            this.data.splice(this.index, 1);
            this.updateData();
          }
        }
      ]
    }
  ],

  css: `
    ^ .foam-u2-ActionView-addRow {
      margin: 8px 0;
    }

    ^ .foam-u2-ActionView-remove {
      align-self: flex-start;
      background: transparent;
      margin-left: 4px;
      padding: 0;
    }

    ^ .foam-u2-ActionView-remove:focus {
      border-width: 1px;
      margin-left: 4px;
      padding: 0;
    }

    ^value-view {
      flex: 1;
    }
  `,

  methods: [
    function initE() {
      this.SUPER();
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
                    .start(self.Cols)
                      .addClass(self.myClass('value-view-container'))
                      .start(valueView, { data$: row.value$ })
                        .addClass(self.myClass('value-view'))
                      .end()
                      .tag(self.Row.REMOVE, {
                        isDestructive: true,
                        // icon: '/images/remove-circle.svg',
                        // encode data as an embedded data URL of the SVG
                        // because then the GUI updates without flickering
                        icon: "data:image/svg+xml;utf8,%0A%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath d='M0 0h24v24H0z' fill='none'/%3E%3Cpath fill='%23d9170e' d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z'/%3E%3C/svg%3E",
                        buttonStyle: 'UNSTYLED'
                      })
                    .end()
                  .endContext();
                row.onDetach(row.sub(self.updateDataWithoutFeedback));
              });
        }))
        .startContext({ data: this })
          .tag(this.ADD_ROW, { buttonStyle: 'SECONDARY' })
        .endContext();
    }
  ],

  listeners: [
    {
      name: 'updateData',
      code: function() {
        this.data = foam.Array.shallowClone(this.data);
      }
    },
    {
      name: 'updateDataWithoutFeedback',
      code: function() {
        this.feedback_ = true;
        this.updateData();
        this.feedback_ = false;
      }
    }

  ]
});
