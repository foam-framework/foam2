/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.layout',
  name: 'MDDAOCreateController',
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
    'foam.log.LogLevel',
    'foam.u2.ControllerMode'
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
        return this.dao.of.create({}, null);
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
        this.dao.put(this.obj.clone()).then(function() {
          this.ctrl.notify('Successfully Created', '', self.LogLevel.INFO, true);
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
    }
  ],

  methods: [
    function initE() {
      var self = this;
      this.SUPER();
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
          .add(self.slot(function(data, detailView) {
            return self.E()
              .start()
                .start(detailView, { data }).end()
              .end();
          }));
      });
    }
  ],

  css: `
  ^ {
    padding-top: 20%;
    overflow: scroll;
    height: 90%;
  }
  `
});
