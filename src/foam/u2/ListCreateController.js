/** @license Copyright 2017 The FOAM Authors, All Rights Reserved. */

foam.CLASS({
  package: 'foam.u2',
  name: 'ListCreateController',
  extends: 'foam.u2.stack.StackView',

  requires: [
    'foam.u2.TableView',
    'foam.u2.DetailView'
  ],

  exports: [ 'as controller', 'dao', 'factory', 'createLabel' ],

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
    {
      class: 'String',
      name: 'createLabel'
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
  ],

  classes: [
    {
      name: 'ListController',
      extends: 'foam.u2.Element',

      imports: [ 'controller', 'dao', 'createLabel' ],

      properties: [
        {
          name: 'selection'
        }
      ],

      methods: [
        function initE() {
          this
            .tag(this.controller.summaryView, {data: this.dao, selection$: this.selection$})
            .tag(this.CREATE, this.createLabel && {label: this.createLabel});

          var self = this;
          this.selection$.sub(function() {
            self.controller.data.push(self.controller.ViewController.create({obj: self.selection}));
          });
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
    },

    {
      name: 'ViewController',
      extends: 'foam.u2.Element',

      imports: [ 'controller' ],
      exports: [ 'as data' ],

      properties: [
          {
            name: 'obj',
            factory: function() { return this.factory(); }
          }
      ],

      methods: [
        function initE() {
          this.tag(this.controller.detailView, {data: this.obj, controllerMode: foam.u2.ControllerMode.VIEW}).add(this.BACK);
        }
      ],

      actions: [
        function back(X) {
          this.controller.back();
        }
      ]
    }
  ]
});
