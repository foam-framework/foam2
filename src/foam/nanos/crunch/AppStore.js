/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'AppStore',
  extends: 'foam.u2.View',

  requires: [
    'foam.comics.v2.CannedQuery'
  ],

  properties: [
    'config',
    {
      class: 'foam.dao.DAOProperty',
      name: 'data'
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'summaryView',
      factory: function() {
        // TODO
      }
    },
    {
      name: 'model',
      factory: function() {
        return foam.nanos.crunch.AppStoreModel.create({ data: this.data });
      },
      view: { class: 'foam.u2.detail.VerticalDetailView' }
    },
    {
      class: 'FObjectArray',
      of: 'foam.comics.v2.CannedQuery',
      name: 'cannedQueries',
      factory: function() {
        return this.model.cls_.getAxiomsByClass(this.CannedQuery);
      }
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'cannedQueriesView',
      factory: function() {
        return {
          class: 'foam.u2.view.TabChoiceView'
        };
      }
    },
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'cannedPredicate',
      expression: function() {
        return foam.mlang.predicate.True.create();
      }
    },
  ],

  methods: [
    function initE() {
      var self = this;
      this.addClass(this.myClass())
      .startContext({ data: this })
        .start(this.Cols)
          .addClass(this.myClass('top-bar'))
          .start(this.Cols)
            .add(this.slot(function(cannedQueries) {
              return self.E()
                .start(self.cannedQueriesView, {
                  choices: cannedQueries.map((o) => [o.predicate, o.label]),
                  data$: self.cannedPredicate$
                })
                .addClass(this.myClass('canned-queries'))
              .end();
            }))
          .end()
        .end()
        .start().tag(this.MODEL).end()
     .endContext();
    }
  ]

});


 foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'AppStoreModel',

  implements: [
    'foam.mlang.Expressions'
  ],
  axioms: [
    {
      class: 'foam.comics.v2.CannedQuery',
      label: 'All'
    },
    {
      class: 'foam.comics.v2.CannedQuery',
      label: 'Liquid Cap',
      predicateFactory: function(e) {
        return e.AND(
          e.INSTANCE_OF(net.nanopay.liquidity.crunch.LiquidCapability),
        );
      }
    }
  ],

  sections: [
    {
      name: 'featured',
      title: 'FEATURED CAPABILITIES'
    },
    {
      name: 'corridor',
      title: 'CORRIDOR CAPABILITIES'
    },
    {
      name: 'payments',
      title: 'PAYMENT CAPABILITIES'
    }
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'data',
      hidden: true
    },
    {
      name: 'subTextFeatured0',
      class: 'foam.dao.DAOProperty',
      section: 'featured',
      factory: function() {
        return this.data;
      },
      view: 'foam.comics.InlineBrowserView',
      // view: {
      //   class: 'foam.u2.TableView',
      //   columns: [ foam.core.Model.NAME ]
      // },
    },
    {
      name: 'subTextFeatured1',
      class: 'foam.dao.DAOProperty',
      section: 'corridor',
      factory: function() {
        return this.data;
      },
      view: 'foam.comics.InlineBrowserView',
      //view: { class: 'foam.comics.v2.DAOBrowserView' }
    },
    {
      name: 'subTextFeatured2',
      class: 'foam.dao.DAOProperty',
      section: 'payments',
      factory: function() {
        return this.data;
      },
      view: 'foam.comics.InlineBrowserView',
      // view: {
      //   class: 'foam.u2.TableView',
      //   columns: [ foam.core.Model.NAME ]
      // },
    }
  ]

});
