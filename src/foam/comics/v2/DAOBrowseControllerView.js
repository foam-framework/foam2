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
    'stack'
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

    ^browse-title {
      font-size: 36px;
      font-weight: 600;
      line-height: 1.33;
      color: #1e1f21;
    }

    ^altview-container {
      position: absolute;
      right: 0;
      padding: 12px 16px 0 0;
    }
  `,

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
      class: 'foam.u2.ViewSpecWithJava',
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
          data: this.data.of.create({ mode: 'create' }, this),
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

      this.addClass(this.myClass())
      .add(this.slot(function(data, config, config$browseBorder, config$browseViews, config$browseTitle) {
        return self.E()
          .start(self.Rows)
            .addClass(self.myClass('container'))
            .start(self.Cols)
              .addClass(self.myClass('header-container'))
              .start()
                .addClass(self.myClass('browse-title'))
                .add(config$browseTitle)
              .end()
              .startContext({ data: self }).tag(self.CREATE).endContext()
            .end()
            .start(self.CardBorder)
              .style({ position: 'relative' })
              .start(config$browseBorder)
                .callIf(config$browseViews.length > 1, function() {
                  this
                    .start(self.IconChoiceView, {
                      choices:config$browseViews.map(o => [o.view, o.icon]),
                      data$: self.browseView$
                    })
                      .addClass(self.myClass('altview-container'))
                    .end();
                })
                .add(self.slot(function(browseView) {
                  return self.E().tag(browseView, {data: data, config: config});
                }))
              .end()
            .end()
          .end();
      }));
    }
  ]
});
