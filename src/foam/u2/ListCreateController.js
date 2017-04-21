/** @license Copyright 2017 The FOAM Authors, All Rights Reserved. */

foam.CLASS({
  package: 'foam.u2',
  name: 'ListCreateController',
  extends: 'foam.u2.stack.StackView',

  classes: [
    {
      name: 'ListController',
      extends: 'foam.u2.Element',

      imports: [ 'controller', 'dao' ],

      methods: [
        function initE() {
          this.tag(this.controller.summaryView, {data: this.dao}).add(this.CREATE);
        }
      ],

      actions: [
        function create(X) {
          X.controller.data.push(X.controller.CreateController.create());
        }
      ]
    },

    {
      name: 'CreateController',
      extends: 'foam.u2.Element',

      imports: [ 'controller', 'dao' ],

      methods: [
        function initE() {
          this.tag(this.controller.detailView, {of: this.dao.of}).add(this.SAVE, this.CANCEL);
        }
      ],

      actions: [
        function save(X) {
          X.controller.data.back();
        },
        function cancel(X) {
          X.controller.data.back();
        }
      ]
    }
  ],

  requires: [
    'foam.u2.TableView',
    'foam.u2.DetailView'
  ],

  exports: [ 'as controller', 'dao' ],

  properties: [
    'dao',
    {
      name: 'summaryView',
      value: { class: 'foam.u2.TableView' }
    },
    {
      name: 'detailView',
      value: { class: 'foam.u2.DetailView' }
    },
    [ 'showActions', false ]
  ],

  methods: [
    function initE() {
      this.data.push(this.ListController.create());
    }
  ],

  actions: [
    {
      name: 'create',
      code: function() {
        this.data.push(this.detailView);
      }
    }
  ]
});
