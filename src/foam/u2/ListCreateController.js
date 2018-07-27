/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
    'memento',
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
    [ 'showActions', true ],
    'memento'
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

      imports: [
        'createLabel',
        'dao',
        'memento',
        'stack',
        'summaryView'
      ],

      exports: [ 'as data' ],

      properties: [
        {
          name: 'selection',
          postSet: function(o, n) {
            this.memento = n ? n.id : '';
          }
        }
      ],

      methods: [
        function initE() {
          // comment out memento since it causes the issue (#1266) for go-back button in detail views
          // this.memento$.sub(this.onMementoChange);
          // this.onMementoChange();

          this
            .start(this.CREATE, this.createLabel && {label: this.createLabel}).style({float: 'right'}).end()
            .tag(this.summaryView, {data: this.dao, selection$: this.selection$});

          var self = this;
          this.selection$.sub(function() {
            if ( self.selection ) {
              var selection = self.selection;
              self.stack.push(function() {
                return foam.u2.ListCreateController.ViewController.create({obj: selection}, self);
              });
            }
          });
        }
      ],

      actions: [
        function create(X) {
          this.stack.push(function() { return foam.u2.ListCreateController.CreateController.create(null, X); });
        }
      ],

      listeners: [
        function onMementoChange() {
          if ( this.memento ) {
            var self = this;
            this.dao.find(this.memento).then(function (obj) {
              self.selection = obj;
            });
          } else {
            this.selection = null;
          }
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
