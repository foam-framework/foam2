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

      imports: [ 'controller', 'dao', 'factory' ],
      exports: [ 'as data' ],

      properties: [
          {
            name: 'obj',
            factory: function() { return this.factory(); }
          }
      ],

      methods: [
        function initE() {
          this.tag(this.controller.detailView, {data: this.obj}).add(this.CANCEL, this.SAVE);
        }
      ],

      actions: [
        function cancel(X) {
          this.controller.back();
        },
        function save(X) {
          this.dao.put(this.obj);
          this.controller.back();
        }
      ]
    }
  ],

  requires: [
    'foam.u2.TableView',
    'foam.u2.DetailView'
  ],

  exports: [ 'as controller', 'dao', 'factory' ],

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
    {
      name: 'factory',
      value: function() { return this.dao.of.create(); }
    },
    [ 'showActions', false ]
  ],

  methods: [
    function initE() {
      this.data.push(this.ListController.create());
    },

    function back() {
      this.data.back();
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
