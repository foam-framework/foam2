/** @license Copyright 2017 The FOAM Authors, All Rights Reserved. */

foam.CLASS({
  package: 'foam.u2',
  name: 'ListCreateController',
  extends: 'foam.u2.stack.StackView',

  requires: [
    'foam.u2.DetailView',
    'foam.u2.TableView'
  ],

  exports: [
    'createLabel',
    'dao',
    'data as stack',
    'data', // TODO: output as 'stack'
    'detailView',
    'createDetailView',
    'factory',
    'summaryView',
    'showActions'
  ],

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
      name: 'createDetailView',
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
    [ 'showActions', true ]
  ],

  methods: [
    function initE() {
      this.push(this.ListController);
    },

    function push(view) {
      this.data.push(view, this);
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

      imports: [ 'stack', 'summaryView', 'dao', 'createLabel' ],
      exports: [ 'as data' ],

      properties: [
        {
          name: 'selection'
        }
      ],

      methods: [
        function initE() {
          this
            .start(this.CREATE, this.createLabel && {label: this.createLabel}).style({float: 'right'}).end()
            .tag(this.summaryView, {data: this.dao, selection$: this.selection$});

          var self = this;
          this.selection$.sub(function() {
            if ( self.selection ) {
              self.stack.push(foam.u2.ListCreateController.ViewController.create({obj: self.selection}, self));
              self.selection = undefined;
            }
          });
        }
      ],

      actions: [
        function create(X) {
          this.stack.push(foam.u2.ListCreateController.CreateController.create(null, X));
        }
      ]
    },

    {
      name: 'CreateController',
      extends: 'foam.u2.Element',

      imports: [ 'createDetailView', 'detailView', 'stack', 'dao', 'factory', 'showActions' ],
      exports: [ 'as data' ],

      properties: [
          {
            name: 'obj',
            factory: function() { return this.factory(); }
          }
      ],

      methods: [
        function initE() {
          var view = this.createDetailView ? this.createDetailView : this.detailView
          this.tag(view, {data: this.obj})
          if ( this.showActions ) this.add(this.CANCEL, this.SAVE);
        }
      ],

      actions: [
        function cancel(X) {
          this.stack.back();
        },

        function save(X) {
          this.dao.put(this.obj);
          this.stack.back();
        }
      ]
    },

    {
      name: 'ViewController',
      extends: 'foam.u2.Element',

      imports: [ 'stack', 'detailView', 'showActions' ],
      exports: [ 'as data' ],

      properties: [
          {
            name: 'obj',
            factory: function() { return this.factory(); }
          }
      ],

      methods: [
        function initE() {
          this.tag(this.detailView, {data: this.obj, controllerMode: foam.u2.ControllerMode.VIEW})
          if ( this.showActions ) this.add(this.BACK);          
        }
      ],

      actions: [
        function back(X) {
          this.stack.back();
        }
      ]
    }
  ]
});
