/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.layout',
  name: 'MDCreateBrowserView',
  extends: 'foam.u2.View',

  documentation: 'MD-styled Create Browser',

  topics: [
    'finished',
    'throwError'
  ],

  axioms: [
    foam.pattern.Faceted.create()
  ],

  requires: [
    'foam.u2.ControllerMode',
    'foam.u2.ToolbarAction',
    'foam.u2.layout.MDToolbarView'
  ],

  imports: [
    'auth',
    'stack'
  ],

  exports: [
    'controllerMode',
    'as objectSummaryView'
  ],

  properties: [
    {
      class: 'FObjectProperty',
      name: 'data'
    },
    {
      name: 'controllerMode',
      factory: function() {
        return this.ControllerMode.CREATE;
      }
    },
    {
      class: 'foam.u2.ViewSpecWithJava',
      name: 'viewView',
      expression: function() {
        return foam.u2.detail.MDDetailView;
      }
    },
    {
      name: 'title',
      expression: function(data) {
        return data.model_.label;
      }
    },
    {
      name: 'dao'
    },
    {
      name: 'obj',
      factory: function() {
        return this.dao.of.create({}, null);
      }
    }
  ],

  actions: [
    {
      name: 'save',
      iconFontName: 'check',
      displayLabel: false,
      code: function() {
        var self = this;
        this.dao.put(this.obj.clone()).then(function() {
          self.stack.back();
        }, function(e) {
          self.exception = e;
          self.throwError.pub();
        });
      }
    },
    {
      name: 'back',
      iconFontName: 'arrow_back',
      displayLabel: false,
      code: function(x) {
        x.stack.back();
      }
    },
    {
      name: 'delete',
      code: function() {
        var self = this;
        this.dao.remove(this.obj).then(function() {
          self.finished.pub();
        }, function(e) {
          self.exception = e;
          self.throwError.pub();
        });
      }
    }
  ],

  methods: [
    function initE() {
      var self = this;
      this.SUPER();
      var toolbar = this.MDToolbarView.create({ title: this.title, rightAction: this.SAVE, leftAction: this.BACK });
      this
        .startContext({data: this})
          .tag({
            class: 'foam.u2.layout.MDToolbarView',
            title: self.title,
            leftAction: self.BACK,
            rightAction: self.SAVE
          })
        .endContext();

      this.dao.inX(this.__subContext__).find(this.data).then(d => {
        if ( d ) self.data = d;

        this
          .addClass(this.myClass())
          .add(self.slot(function(data, viewView) {
            return self.E()
              .start()
                .start(viewView, { data }).end()
              .end();
          }));
      });
    }
  ]
});
