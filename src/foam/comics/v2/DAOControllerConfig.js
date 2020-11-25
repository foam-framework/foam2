/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.comics.v2',
  name: 'DAOControllerConfig',

  documentation: `
    A customizable model to configure any DAOController
  `,

  requires: [
    'foam.comics.SearchMode',
    'foam.comics.v2.CannedQuery',
    'foam.comics.v2.namedViews.NamedViewCollection'
  ],

  properties: [
    {
      class: 'String',
      name: 'daoKey'
    },
    {
      class: 'Class',
      name: 'factory'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.mlang.predicate.Predicate',
      name: 'predicate',
      view: { class: 'foam.u2.view.JSONTextView' }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao',
      hidden: true,
      expression: function(daoKey, predicate) {
        var dao = this.__context__[daoKey] || foam.dao.NullDAO.create({of: foam.core.FObject});
        if ( this.hasOwnProperty('of') ) {
          dao = foam.dao.ProxyDAO.create({
            of: this.of,
            delegate: dao
          });
        }
        if ( predicate ) {
          dao = dao.where(predicate);
        }
        return dao;
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'unfilteredDAO',
      hidden: true,
      expression: function(dao) {
        var delegate = dao;
        while ( delegate && foam.dao.ProxyDAO.isInstance(delegate) ) {
          if ( foam.dao.FilteredDAO.isInstance(delegate) ) {
            return delegate.delegate;
          }
          delegate = delegate.delegate;
        }
        return dao;
      }
    },
    {
      class: 'Class',
      name: 'of',
      expression: function(dao$of) { return dao$of; }
    },
    {
      class: 'String',
      name: 'browseTitle',
      factory: function() { return this.of.model_.plural; }
    },
    {
      class: 'String',
      name: 'browseSubtitle',
      factory: function() { return 'View all ' + this.browseTitle.toLowerCase() + '.' }
    },
    {
      // TODO: Make ViewSpecWithJava a refinement to ViewSpec and change below to a ViewSpec
      class: 'foam.u2.ViewSpecWithJava',
      name: 'summaryView',
      expression: function(defaultColumns) {
        return {
          class: 'foam.u2.view.ScrollTableView',
          enableDynamicTableHeight: true,
          columns: defaultColumns,
          css: {
            width: '100%',
            'min-height': '424px'
          }
        };
      }
    },
    {
      class: 'String',
      name: 'createTitle',
      expression: function(of) { return 'Create a New ' + of.model_.label; }
    },
    {
      class: 'Array',
      name: 'defaultColumns',
      factory: null,
      expression: function(of) {
        var tableColumns = of.getAxiomByName('tableColumns');

        return tableColumns
          ? tableColumns.columns
          : of.getAxiomsByClass(foam.core.Property).map(p => p.name);
      }
    },
    {
      class: 'Enum',
      of: 'foam.comics.SearchMode',
      name: 'searchMode',
      help: `
        The level of search capabilities that the controller should have.
      `,
      value: 'FULL'
    },
    {
      class: 'foam.u2.ViewSpecWithJava',
      name: 'browseBorder',
      expression: function() {
        // Can't use a value here because java tries to generate a HasMap
        // for it which doesn't jive with the AbstractFObjectPropertyInfo.
        return { class: 'foam.u2.borders.NullBorder' };
      }
    },
    {
      class: 'FObjectArray',
      of: 'foam.comics.v2.namedViews.NamedViewCollection',
      name: 'browseViews',
      factory: null,
      expression: function(of) {
        return of.getAxiomsByClass(this.NamedViewCollection);
      }
    },
    {
      class: 'FObjectArray',
      of: 'foam.comics.v2.CannedQuery',
      name: 'cannedQueries',
      factory: null,
      expression: function(of) {
        return of.getAxiomsByClass(this.CannedQuery);
      }
    },
    {
      class: 'foam.u2.ViewSpecWithJava',
      name: 'viewBorder',
      factory: function() {
        // Can't use a value here because java tries to generate a HasMap
        // for it which doesn't jive with the AbstractFObjectPropertyInfo.
        return { class: 'foam.u2.borders.NullBorder' };
      }
    },
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'createPredicate',
      documentation: 'If set to false, the "Create" button will not be visible.',
      factory: function() {
        return foam.mlang.predicate.True.create();
      },
      javaFactory: `
        return foam.mlang.MLang.TRUE;
      `
    },
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'editPredicate',
      documentation: 'True to enable the edit button.',
      factory: function() {
        return foam.mlang.predicate.True.create();
      },
      javaFactory: `
        return foam.mlang.MLang.TRUE;
      `
    },
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'deletePredicate',
      documentation: 'True to enable the delete button.',
      factory: function() {
        return foam.mlang.predicate.True.create();
      },
      javaFactory: `
        return foam.mlang.MLang.TRUE;
      `
    },
    {
      of: 'foam.mlang.predicate.Predicate',
      name: 'filterExportPredicate',
      documentation: 'Filtering the types of formats user is able to export from TableView'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.comics.v2.CRUDEnabledActionsAuth',
      name: 'CRUDEnabledActionsAuth'
    },
    {
      class: 'Boolean',
      name: 'hideQueryBar'
    }
  ]
});
