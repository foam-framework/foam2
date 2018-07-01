/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
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

foam.CLASS({
  package: 'foam.u2',
  name: 'DAOController',
  extends: 'foam.u2.View',

  documentation: 'DAO-backed CRUD controller.',

  // Expects a DAO as its data. Calls listFactory to construct the list, passing
  // it rowFactory.
  // Clicking a row creates a DAOUpdateController to edit the item (lists should
  // publish rowClick, like DAOList does).
  // Also displays a floating action button to create new items, which uses
  // DAOCreateController.

  requires: [
    'foam.u2.DAOCreateController',
    'foam.u2.DAOList',
    'foam.u2.DAOUpdateController'
  ],

  imports: [
    'stack'
  ],

  properties: [
    {
      name: 'of',
      expression: function(data) {
        return data.of;
      }
    },
    {
      name: 'data'
    },
    {
      class: 'foam.u2.ViewFactory',
      name: 'listFactory',
      value: 'foam.u2.DAOList'
    },
    {
      class: 'foam.u2.ViewFactory',
      name: 'rowFactory',
      value: 'foam.u2.CitationView'
    }
  ],

  methods: [
    function initE() {
      // TODO(braden): Add ViewFactory support to Element.start()
      var list = this.listFactory$f({
        rowFactory: this.rowFactory,
        data: this.data
      });
      list.rowClick.sub(this.rowClick);
      this.startContext({ data: this })
          .addClass(this.myClass())
          .add(this.NEW_ITEM)
          .add(list)
          .endContext();
    },

    // These two functions are designed to be overridden by subclasses that
    // need to wrap or replace the DAOUpdateController.
    function buildUpdateController(X, data) {
      return this.DAOUpdateController.create({
        data: data,
        dao: this.data
      }, X);
    },
    function buildCreateController(X) {
      return this.DAOCreateController.create({
        of: this.of,
        dao: this.data
      }, X);
    }
  ],

  listeners: [
    {
      name: 'rowClick',
      code: function(sub, _, obj) {
        this.stack.pushAfter(this,
            this.buildUpdateController(this.__subContext__, obj));
      }
    }
  ],

  actions: [
    {
      name: 'newItem',
      label: 'New',
      code: function() {
        this.stack.pushAfter(this,
            this.buildCreateController(this.__subContext__));
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'CitationView',
  extends: 'foam.u2.DetailView',

  properties: [
    {
      name: 'data'
    },
    {
      name: 'of',
      expression: function(data) {
        return data && data.cls_;
      }
    },
    {
      name: 'prop',
      expression: function(of) {
        var prop = of.getAxiomByName('label') || of.getAxiomByName('name');
        if ( prop ) return prop;

        // Otherwise search for plausible string-valued candidates.
        // Disallow hidden properties and 'id'.
        var props = of.getAxiomsByClass(foam.core.Property);
        var candidates = [];
        for ( var i = 0; i < props.length; i++ ) {
          var p = props[i];
          if ( ! p.hidden && p.name !== 'id' &&
              (foam.core.Property.isInstance(p) ||
               foam.core.String.isInstance(p)) ) {
            candidates.push(p);
          }
        }

        // Look for candidates whose name contains 'name' or 'label'.
        for ( var i = 0; i < candidates.length; i++ ) {
          var p = candidates[i];
          var pname = p.name.toLowerCase();
          if ( pname.indexOf('name') >= 0 || pname.indexOf('label') >= 0 ) {
            prop = p;
            break;
          }
        }

        // If that still didn't work, take the first candidate.
        if ( ! prop && candidates.length ) prop = candidates[0];

        // In desperation, fall back on ID.
        return prop || of.ID;
      }
    },
    {
      name: 'propSlot',
      expression: function(prop, data) {
        return prop.toSlot(data);
      }
    }
  ],

  css: `
    ^ {
      align-items: center;
      border-bottom: 1px solid #eee;
      box-sizing: border-box;
      display: flex;
      min-height: 48px;
      padding: 16px;
    }
  `,

  methods: [
    function initE() {
      this.addClass(this.myClass());

      // TODO(braden): This isn't quite dynamic enough - should handle model
      // changing.
      this.add(this.propSlot$);
    }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'Stack',

  properties: [
    {
      class: 'FObjectArray',
      of: 'foam.u2.Element',
      name: 'views',
      factory: function() { return []; }
    }
  ],

  topics: [
    // Passed (child view, index).
    // NB: stack views are responsible for rendering and loading the child view.
    'viewAdded',
    // Passed (child view, index)
    // NB: stack views are responsible for unloading and removing the child
    // view from the DOM.
    'viewRemoved'
  ],

  methods: [
    // Empties the stack and pushes this single view on top.
    function pushOnly(child) {
      while ( this.views.length > 0 ) {
        this.removeTopmost_();
      }

      this.addChild_(child);
    },

    // Pushes a child after this view on the stack.
    // Pops anything after the host!
    function pushAfter(host, child) {
      // NB: If the host is not found, throws an error.
      if ( this.indexOf(host) < 0 ) {
        throw new Error('StackView: Host not found.');
      }

      this.popChildren(host);
      this.addChild_(child);
    },

    // Replaces the host with the new child.
    // Pops everything after the host first.
    function replaceWith(host, child) {
      this.popMe(host);
      this.addChild_(child);
    },

    // Pops everything up to and including the current view.
    // If the host is not found, this deletes everything.
    function popMe(host) {
      this.popChildren(host);
      this.removeTopmost_();
    },

    // Pops everything below the current view.
    function popChildren(host) {
      var index = this.indexOf(host);
      if ( index < 0 ) {
        this.views.splice(0, this.views.length);
        return;
      }

      while ( index + 1 < this.views.length ) {
        this.removeTopmost_();
      }
    },

    function addChild_(child) {
      var index = this.views.length;
      this.views.push(child);
      this.viewAdded.pub(child, index);
    },

    // Should only be called on the topmost view.
    function removeTopmost_() {
      var e = this.views.pop();
      this.viewRemoved.pub(e, this.views.length);
    },

    function indexOf(host) {
      // Scan through the views looking for the host.
      // If that fails, try again with the parent of host, if defined.
      // This allows children views (eg. action buttons) to pop their parents
      // off the stack.
      while ( host ) {
        var index = this.views.indexOf(host);
        if ( index >= 0 ) return index;
        host = host.parentNode;
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'BasicStackView',
  extends: 'foam.u2.View',

  imports: [
    'stack'
  ],

  properties: [
    {
      name: 'viewStack_',
      factory: function() { return []; }
    }
  ],

  methods: [
    function initE() {
      this.stack.viewAdded.sub(this.onViewAdded);
      this.stack.viewRemoved.sub(this.onViewRemoved);
      if ( this.stack.views.length > 0 ) {
        this.renderView_(this.stack.views[this.stack.views.length - 1]);
      }
    },
    function renderView_(view) {
      if ( this.viewStack_.length > 0 ) {
        this.viewStack_[this.viewStack_.length - 1].hide();
      }
      this.viewStack_.push(view);
      this.add(view);
    },
    function removeTopmost_() {
      var e = this.viewStack_.pop();
      e.remove();
      if ( this.viewStack_.length > 0 ) {
        this.viewStack_[this.viewStack_.length - 1].show(true);
      }
    }
  ],

  listeners: [
    {
      name: 'onViewAdded',
      isFramed: true,
      code: function onViewAdded(sub, _, view) {
        this.renderView_(view);
      }
    },
    {
      name: 'onViewRemoved',
      isFramed: true,
      code: function onViewRemoved() {
        this.removeTopmost_();
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'DAOUpdateController',
  extends: 'foam.u2.View',

  requires: [
    'foam.u2.DetailView'
  ],

  imports: [
    'document',
    'stack'
  ],

  exports: [
    'myControllerMode as controllerMode'
  ],

  properties: [
    {
      // The original, golden data. innerData is a clone of this.
      name: 'data',
      postSet: function(old, nu) {
        // Only overwrite innerData if it's clean relative to old.
        // That prevents overwriting any changes the user might have made.
        if ( old && old.equals(this.innerData) ) {
          this.innerData = nu.clone();
        }
      }
    },
    {
      name: 'innerData',
      factory: function() {
        return this.data.clone();
      },
      postSet: function(old, nu) {
        if ( old === nu ) return;
        if ( this.dataSub_ ) this.dataSub_.detach();
        this.dataSub_ = nu.propertyChange.sub(this.onDataChange);
        this.onDataChange();
      }
    },
    'dataSub_',
    {
      name: 'of',
      expression: function(data) {
        return data.cls_;
      }
    },
    {
      name: 'dao',
      expression: function(of) {
        return this.__context__[foam.String.daoize(of.name)];
      }
    },
    {
      name: 'title',
      expression: function(of) {
        return 'Edit ' + of.name;
      }
    },
    {
      class: 'Boolean',
      name: 'dirty_'
    },
    [ 'myControllerMode', 'update' ]
  ],

  actions: [
    {
      name: 'back',
      isAvailable: function(dirty_) { return ! dirty_; },
      code: function(X) {
        X.stack.popMe(this);
      }
    },
    {
      name: 'delete',
      isAvailable: function(dirty_) { return ! dirty_; },
      code: function(X) {
        this.dao.remove(this.data);
        this.back();
      }
    },
    {
      name: 'cancel',
      isAvailable: function(dirty_) { return dirty_; },
      code: function(X) {
        this.clearFocus_();
        this.innerData = this.data.clone();
      }
    },
    {
      name: 'submit',
      isAvailable: function(dirty_) { return dirty_; },
      code: function(X) {
        // TODO(braden): Handle long-running submits here. Some UI affordance
        // for the fact that work is being done here.
        this.clearFocus_();
        this.dao.put(this.innerData).then(function(nu) {
          this.data = nu;
          this.innerData = nu.clone();
        }.bind(this));
      }
    }
  ],

  methods: [
    function initE() {
      var dv = this.DetailView.create({ data$: this.innerData$ });
      this.startContext({ data: this });
      this.add(this.BACK);
      this.add(this.CANCEL);
      this.add(this.DELETE);
      this.add(this.SUBMIT);
      this.add(dv);
      this.endContext();
      this.enableClass('red-border', this.slot('dirty_'));
    },

    function clearFocus_() {
      var active = this.document.activeElement;
      if ( active ) active.blur();
    }
  ],

  listeners: [
    {
      name: 'onDataChange',
      code: function() {
        this.dirty_ = ! this.data.equals(this.innerData);
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'DAOCreateController',
  extends: 'foam.u2.View',

  requires: [
    'foam.u2.DetailView'
  ],

  imports: [
    'document',
    'stack'
  ],

  exports: [
    'myControllerMode as controllerMode'
  ],

  properties: [
    {
      class: 'Class',
      name: 'of',
      expression: function(dao) {
        return dao.of;
      }
    },
    {
      name: 'dao'
    },
    {
      class: 'String',
      name: 'title',
      expression: function(of) {
        return 'New ' + of.model_.label;
      }
    },
    {
      name: 'data',
      factory: function() {
        return this.of.create();
      }
    },
    [ 'myControllerMode', 'create' ]
  ],

  actions: [
    {
      name: 'cancel',
      code: function() {
        this.stack.popMe(this);
      }
    },
    {
      name: 'save',
      code: function() {
        this.clearFocus_();
        this.dao.put(this.data).then(function() {
          this.stack.popMe(this);
        }.bind(this));
      }
    }
  ],

  methods: [
    function initE() {
      var dv = this.buildDetailView();
      this.startContext({ data: this })
          .addClass(this.myClass())
          .add(this.CANCEL)
          .add(this.SAVE)
          .start()
              .addClass(this.myClass('body'))
              .add(dv)
          .end()
          .endContext();
    },

    function buildDetailView() {
      var dv;
      if ( this.data && this.data.toE ) {
        dv = this.data.toE(this.__subContext__);
      } else {
        dv = this.DetailView.create({ of: this.of });
        dv.data$ = this.data$;
      }
      return dv;
    },

    function clearFocus_() {
      var active = this.document.activeElement;
      if ( active ) active.blur();
    }
  ]
});
