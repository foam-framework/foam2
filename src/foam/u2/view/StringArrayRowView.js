/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'StringArrayRowView',
  extends: 'foam.u2.View',

  exports: [ 'as self' ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this.
        add(this.data$.map(function(p) { return p.map(function(p, index) {
          var view = self.RowView.create({data: p, index: index}, self);
          view.focus();
          view.data$.sub(function() {
            self.data[index] = view.data;
          });
          return view;
        })})).
        add(this.ADD_ROW);
    }
  ],

  actions: [
    {
      name: 'addRow',
      label: 'Add',
      code: function(X) { X.self.data = this.concat(''); }
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
          this.
            addClass(this.myClass()).
            add(this.DATA).
            start(this.REMOVE_ROW, { data: this }).end();
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
