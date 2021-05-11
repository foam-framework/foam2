/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.comics.v2',
  name: 'DAOBrowseControllerView',
  extends: 'foam.u2.View',

  documentation: `
    The inline DAO controller for a collection of instances of a model that can
    switch between multiple views
  `,

  imports: [
    'auth',
    'currentMenu?',
    'memento',
    'stack'
  ],

  exports: [
    'memento'
  ],

  requires: [
    'foam.comics.v2.DAOBrowserView',
    'foam.u2.borders.CardBorder',
    'foam.u2.layout.Cols',
    'foam.u2.layout.Rows',
    'foam.u2.view.IconChoiceView'
  ],

  css: `
    ^container {
      padding: 32px;
    }

    ^header-container {
      padding-bottom: 32px;
      align-items: center;
    }

    ^browse-subtitle {
      color: #5e6061;
      width: 50%;
    }

    ^altview-container {
      position: absolute;
      right: 0;
      padding: 12px 16px 0 0;
    }

    ^ .foam-u2-borders-CardBorder {
      padding: 0px;
      border-radius: 6px;
      box-shadow: 0px 1px 3px 0px #E7E7E7;
      -webkit-box-shadow: 0px 1px 3px 0px #E7E7E7;
      -moz-box-shadow: 0px 1px 3px 0px #E7E7E7;
    }
  `,

  messages: [
    { name: 'VIEW_ALL', message: 'View all ' }
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'data'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.comics.v2.DAOControllerConfig',
      name: 'config',
      factory: function() {
        return foam.comics.v2.DAOControllerConfig.create({ dao: this.data });
      }
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'browseView',
      expression: function(config$browseViews) {
        return config$browseViews && config$browseViews.length
          ? config$browseViews[0].view
          : this.DAOBrowserView
          ;
      }
    }
  ],

  actions: [
    {
      name: 'create',
      isEnabled: function(config, data) {
        if ( config.CRUDEnabledActionsAuth && config.CRUDEnabledActionsAuth.isEnabled ) {
          try {
            let permissionString = config.CRUDEnabledActionsAuth.enabledActionsAuth.permissionFactory(foam.nanos.dao.Operation.CREATE, data);

            return this.auth.check(null, permissionString);
          } catch(e) {
            return false;
          }
        }
        return true;
      },
      isAvailable: function(config) {
        try {
          return config.createPredicate.f();
        } catch(e) {
          return false;
        }
      },
      code: function() {
        if ( ! this.stack ) return;
        this.stack.push({
          class: 'foam.comics.v2.DAOCreateView',
          data: ((this.config.factory && this.config.factory$cls) ||  this.data.of).create({ mode: 'create'}, this),
          config$: this.config$,
          of: this.data.of
        }, this.__subContext__);
      }
    }
  ],

  methods: [
    function initE() {
    this.SUPER();

    var self = this;
    var menuId = this.currentMenu ? this.currentMenu.id : this.config.of.id;
    this.addClass(this.myClass())
      .add(this.slot(function(data, config, config$of, config$browseBorder, config$browseViews, config$browseTitle, config$browseSubtitle, config$primaryAction) {
        return self.E()
          .start(self.Rows)
            .addClass(self.myClass('container'))
              .start()
                .addClass(self.myClass('header-container'))
                .start(self.Cols)
                  .start('h1')
                    .addClass(self.myClass('browse-title'))
                    .translate(menuId + ".browseTitle", config$browseTitle)
                  .end()
                  .startContext({ data: self }).tag(self.CREATE, { buttonStyle: foam.u2.ButtonStyle.PRIMARY }).endContext()
                  .callIf(config$primaryAction, function() {
                    this.startContext({ data: self }).tag(config$primaryAction, { size: 'LARGE', buttonStyle: 'PRIMARY' }).endContext();
                  })
                .end()
                .callIf(config$browseSubtitle.length > 0, function() {
                  this
                    .start()
                      .addClass(self.myClass('browse-subtitle'))
                      .translate(menuId + ".browseSubtitle", config$browseSubtitle)
                    .end();
                })
                .callIf(! config$browseSubtitle, function() {
                  this
                    .start()
                      .addClass(self.myClass('browse-subtitle'))
                      .translate(self.cls_.id + '.VIEW_ALL', self.VIEW_ALL)
                      .translate(menuId + ".browseTitle", config$browseTitle)
                    .end();
                })
              .end()
            .start(self.CardBorder)
              .style({ position: 'relative' })
              .start(config$browseBorder)
                .callIf(config$browseViews.length > 1 && config.cannedQueries.length > 0, function() {
                  this
                    .start(self.IconChoiceView, {
                      choices:config$browseViews.map(o => [o.view, o.icon]),
                      data$: self.browseView$
                    })
                      .addClass(self.myClass('altview-container'))
                    .end();
                })
                .add(self.slot(function(browseView) {
                  return self.E().tag(browseView, { data: data, config: config });
                }))
              .end()
            .end()
          .end();
      }));
    }
  ]
});
