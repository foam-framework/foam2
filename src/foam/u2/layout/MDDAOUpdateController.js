/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */


foam.CLASS({
  package: 'foam.u2.layout',
  name: 'MDDAOUpdateController',
  extends: 'foam.u2.View',

  documentation: 'MD-styled update browser',

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
    'foam.u2.layout.MDToolbarView',
    'foam.log.LogLevel'
  ],

  imports: [
    'stack',
    'ctrl'
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
      name: 'detailView',
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
        var self = this;
        this.dao.find(this.data).then(function(obj) {
          self.obj = obj.clone();
        });
        return null;
      }
    }
  ],

  actions: [
    {
      name: 'save',
      iconFontName: 'check',
      label: '',
      code: function() {
        if ( this.data.errors_ ) {
          this.ctrl.notify('Some fields are not valid', '', this.LogLevel.ERROR, true);
          return;
        }
        var self = this;
        this.dao.put(this.data.clone()).then(function() {
          this.ctrl.notify('Successfully Updated', '', self.LogLevel.INFO, true);
          self.stack.back();
        }, function(e) {
          self.exception = e;
          self.throwError.pub();
          this.ctrl.notify(e.message, '', self.LogLevel.ERROR, true);
        });
      }
    },
    {
      name: 'back',
      iconFontName: 'arrow_back',
      label: '',
      code: function(x) {
        x.stack.back();
      }
    },
    {
      name: 'delete',
      code: function() {
        var self = this;
        this.dao.remove(this.data).then(function() {
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
      this.addClass(this.myClass())
          .startContext({data: this})
            .tag({
              class: 'foam.u2.layout.MDToolbarView',
              title: self.title,
              leftAction: self.BACK,
              rightAction: self.SAVE
            })
          .endContext();
        this
          .start().addClass('main-container')
            .tag(this.detailView, { data: this.data })
            .add(this.DELETE)
          .end()
    }
  ],

  css: `
    ^ .foam-u2-ActionView-delete {
      width: -webkit-fill-available;
      height: 6rem;
      color: #2e2379;
      font-weight: 400;
      margin: 2rem 4rem;
      font-size: 2.5rem;
      bottom: 0;
      background-color: unset;
      border: 2px solid red!important;
      border-radius: 73px;
    }
    ^ .main-container {
      overflow: scroll;
      height: 90%;
      margin-top: 15px;
    }
  `,
});
