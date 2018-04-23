/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.demos.net.nap.web',
  name: 'MessageboardList',
  extends: 'foam.u2.Controller',

  documentation: '',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.demos.net.nap.web.model.Messageboard'
  ],

  imports: [
     'stack',
     'messageboardDAO'
  ],

  exports: [
    'dblclick'
  ],

  css: `
    ^ {
      width: 1240px;
      margin: 0 auto;
    }
    ^ .inline-float-right {
      float: right;
      display: inline-block;
    }
    ^ .button-div{
      margin-bottom: 10px;
    }
    ^ .net-nanopay-ui-ActionView-create{
      margin-right: 10px;
    }
    ^ table {
      width: 1240px;
    }
    ^ .foam-u2-view-TableView-row {
      height: 40px;
    }
  `,

  properties: [
    { name: 'data',
      factory: function() { return this.messageboardDAO; },
      view: {
        class: 'foam.u2.view.ScrollTableView',
        columns: [
          'id', 'title', 'creator', 'createdDate',
        ]
      }
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'aaa',
      value: { class: 'foam.demos.net.nap.web.EditMessageboard', data: this.data }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this
        .addClass(this.myClass())
        .start()
          .start().addClass('container')
            .start().addClass('button-div')
              .start(this.CREATE).end()
              .start(this.DELETE).end()
            .end()
          .end()
          .start().addClass('container')
          .end()
          .add(this.DATA)
        .end();
    },
    function dblclick(messageboard) {
      this.onEdit(messageboard);
    }
  ],

  actions: [
    {
      name: 'create',
      label: 'Create',
      code: function(X) {
        var self = this;

        self.stack.push({ class: 'foam.demos.net.nap.web.MessageboardForm' });
      }
    },
    {
      name: 'delete',
      label: 'Delete',
      code: function(X) {
        var self = this;

        self.stack.push({ class: 'foam.demos.net.nap.web.MessageboardForm' });
      }
    }
  ],

  listeners: [
    function onEdit(messageboard) {
      this.stack.push({
        class: 'foam.demos.net.nap.web.EditMessageboard',
        data: messageboard
      }, this);
    }
  ]
});
