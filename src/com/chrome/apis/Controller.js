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
  package: 'foam.u2.md',
  name: 'DAOController',
  extends: 'foam.u2.DAOController',

  requires: [
    'foam.u2.md.Button',
    'foam.u2.md.DAOCreateController',
    'foam.u2.md.DAOUpdateController',
    'foam.u2.md.Toolbar',
    'foam.u2.md.ToolbarContainer'
  ],

  methods: [
    function initE() {
      // TODO(braden): Once toPropertyE is generalized to actions etc., use that
      // here if practical.
      var list = this.listFactory$f({
        rowFactory: this.rowFactory,
        data: this.data
      });

      list.rowClick.sub(this.rowClick);
      this.add(list);

      var fab = this.Button.create({
        action: this.NEW_ITEM,
        data: this,
        icon: 'add',
        type: 'fab'
      }).cssClass(this.myCls('fab'));
      this.add(fab);
    },

    // TODO(braden): Try to avoid the explicit context hackery here, using
    // .startContext() and the like.
    function buildCreateController(X) {
      var toolbar = this.Toolbar.create();
      var Y = X.createSubContext({ toolbar: toolbar });
      return this.ToolbarContainer.create({
        toolbar: toolbar,
        body: this.SUPER(Y)
      }, Y);
    },
    function buildUpdateController(X, obj) {
      var toolbar = this.Toolbar.create();
      var Y = X.createSubContext({ toolbar: toolbar });
      return this.ToolbarContainer.create({
        toolbar: toolbar,
        body: this.SUPER(Y, obj)
      }, Y);
    }
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^fab {
          position: absolute;
          right: 16px;
          bottom: 16px;
        }
      */}
    })
  ]
});

foam.CLASS({
  package: 'foam.u2.md',
  name: 'DAOCreateController',
  extends: 'foam.u2.DAOCreateController',

  requires: [
    'foam.u2.md.Button',
    'foam.u2.md.DetailView'
  ],

  imports: [
    'toolbar'
  ],

  // TODO(braden) : These actions are duplicated. When Actions inherit properly,
  // these just need to set the icon, and not duplicate the code.
  actions: [
    {
      name: 'cancel',
      icon: 'clear',
      code: function() {
        this.stack.popMe(this);
      }
    },
    {
      name: 'save',
      icon: 'check',
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
      this.add(this.buildDetailView());
      //var dv = this.DetailView.create({ of: this.of });
      //dv.data$ = this.data$;
      //this.add(dv);

      this.toolbar.title$ = this.title$;
      this.toolbar.addLeftAction(this.createButton(this.CANCEL));
      this.toolbar.addRightAction(this.createButton(this.SAVE));
    },

    function createButton(action) {
      return this.Button.create({
        action: action,
        type: 'icon',
        data: this
      });
    }
  ]
});


foam.CLASS({
  package: 'foam.u2.md',
  name: 'DAOUpdateController',
  extends: 'foam.u2.DAOUpdateController',

  requires: [
    'foam.u2.md.Button',
    'foam.u2.md.DetailView'
  ],

  imports: [
    'toolbar'
  ],

  // TODO(braden) : These actions are duplicated. When Actions inherit properly,
  // these just need to set the icon, and not duplicate the code.
  actions: [
    {
      name: 'back',
      icon: 'arrow-back',
      isAvailable: function(dirty_) { return ! dirty_; },
      code: function(X) {
        X.stack.popMe(this);
      }
    },
    {
      name: 'delete',
      icon: 'delete',
      isAvailable: function(dirty_) { return ! dirty_; },
      code: function(X) {
        this.dao.remove(this.data);
        this.back();
      }
    },
    {
      name: 'cancel',
      icon: 'clear',
      isAvailable: function(dirty_) { return dirty_; },
      code: function(X) {
        this.clearFocus_();
        this.innerData = this.data.clone();
      }
    },
    {
      name: 'submit',
      icon: 'check',
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
      this.add(this.DetailView.create({ data$: this.innerData$ }));

      this.toolbar.title$ = this.title$;
      this.toolbar.addLeftAction(this.createButton(this.BACK));
      this.toolbar.addLeftAction(this.createButton(this.CANCEL));
      this.toolbar.addRightAction(this.createButton(this.SUBMIT));
      this.toolbar.addRightAction(this.createButton(this.DELETE));
    },

    function createButton(action) {
      return this.Button.create({
        action: action,
        type: 'icon',
        data: this
      });
    }
  ]
});

foam.CLASS({
  package: 'com.chrome.apis',
  name: 'Controller',
  extends: 'foam.u2.Element',
  requires: [
    //'com.chrome.apis.Experiment',
    'com.chrome.apis.Origin',
    //'com.chrome.apis.User',
    'foam.dao.EasyDAO',
    'foam.u2.Stack',
    'foam.u2.md.DAOController',
    'foam.u2.md.StackView',
    'foam.u2.md.Toolbar',
    'foam.u2.md.ToolbarContainer'
  ],

  exports: [
    'originDAO',
    'stack'
  ],

  properties: [
    {
      name: 'originDAO',
      factory: function() {
        return this.EasyDAO.create({
          of: this.Origin,
          guid: true,
          cache: true,
          daoType: this.EasyDAO.IDB
        });
      }
    },
    {
      name: 'stack',
      factory: function() {
        return this.Stack.create();
      }
    }
  ],

  methods: [
    function initE() {
      this.cssClass('flex').cssClass('layout').cssClass('vertical');
      var sv = this.StackView.create();
      this.add(sv);
      var inner = this.ToolbarContainer.create({
        toolbar: this.Toolbar.create({
          title: 'Chrome Experiments'
        }),
        body: this.DAOController.create({ data: this.originDAO })
      });

      //inner.cssClass('layout').cssClass('vertical');

      this.stack.pushOnly(inner);
    }
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        body {
          height: 100vh;
          margin: 0;
          padding: 0;
        }
      */}
    })
  ]
});
