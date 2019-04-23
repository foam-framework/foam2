/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'StringArrayRowView',
  extends: 'foam.u2.View',

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this.
        add(this.data$.map(function(array) { return array.map(function(p, index) {
          var view = self.RowView.create({data: p, index: index});
          view.focus();
          view.data$.sub(function() {
            self.data[index] = view.data;
          });
          return view;
        })})).
        startContext({data: this}).add(this.ADD_ROW).endContext();
    }
  ],

  actions: [
    {
      name: 'addRow',
      label: 'Add',
      code: function(X) { this.data = this.data.concat(''); }
    }
  ],

  classes: [
    {
      name: 'RowView',
      extends: 'foam.u2.Controller',

      properties: [
        {
          class: 'String',
          name: 'data',
          displayWidth: 50
        },
        'index'
      ],

      methods: [
        function initE() {
          this.SUPER();
          this.
            addClass(this.myClass()).
            add(this.DATA).
            tag(this.REMOVE_ROW, {data: this});
        }
      ],

      actions: [
        {
          name: 'removeRow',
          label: 'X',
          speechLabel: 'delete',
          toolTip: 'delete',
          // iconFontName: 'delete_forever',
          code: function(X) {
            var data = foam.util.clone(X.self.data);
            data.splice(this.index, 1);
            X.self.data = data;
          }
        }
      ]
    }
  ]
});
