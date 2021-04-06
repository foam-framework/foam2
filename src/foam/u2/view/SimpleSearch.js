/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'SimpleSearch',
  extends: 'foam.u2.View',

  requires: [
    'foam.u2.search.SearchManager'
  ],

  imports: [
    'dao',
    'memento'
  ],

  exports: [
    'as filterController',
    'as data',
    'currentMemento_ as memento'
  ],

  properties: [
    {
      class: 'Class',
      name: 'of'
    },
    {
      name: 'data'
    },
    {
      class: 'Int',
      name: 'selectedCount'
    },
    {
      class: 'Int',
      name: 'totalCount'
    },
    {
      class: 'String',
      name: 'countText',
      expression: function(selectedCount, totalCount) {
        var singular = this.dao.of.name.toLowerCase();
        var plural = this.dao.of.model_.plural.toLowerCase();
        var word = totalCount === 1 ? singular : plural;
        var format = (int) => int
          .toString()
          .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return selectedCount !== totalCount ?
          `Showing ${format(selectedCount)} out of ${format(totalCount)} ${plural}` :
          `${format(totalCount)} ${word}`;
      }
    },
    {
      name: 'searchManager'
    },
    {
      class: 'Boolean',
      name: 'showCount',
      value: true
    },
    'currentMemento_'
  ],

  methods: [
    function initE() {
      var self = this;

      if ( this.memento ) {
        if ( ! this.memento.tail ) {
          this.memento.tail = foam.nanos.controller.Memento.create();
        }
        this.currentMemento_$ = this.memento.tail$;
      }

      this.dao.on.sub(this.updateTotalCount);
      this.updateTotalCount();

      this.searchManager = self.SearchManager.create({
        dao: this.dao,
        predicate$: this.data$
      });
      this.searchManager.filteredDAO$.sub(self.updateSelectedCount);
      self.updateSelectedCount(0, 0, 0, this.searchManager.filteredDAO$);

      var generalQueryView = foam.u2.ViewSpec.createView(
        { 
          class: 'foam.u2.search.TextSearchView',
        },
        {
          richSearch: true,
          of: this.dao.of.id,
          onKey: true,
          viewSpec: {
            class: 'foam.u2.tag.Input',
            focused: true
          }
        },
        this,
        this.__subSubContext__
      );

      this.searchManager.add(generalQueryView);

      this
        .addClass(this.myClass())
        .start()
          .tag(generalQueryView)
        .end()
        .callIf(this.showCount, function() {
          this.start('p')
            .add(self.countText$)
          .end();
        });

    }
  ],

  listeners: [
    {
      name: 'updateTotalCount',
      isFramed: true,
      code: function() {
        this.dao.select(foam.mlang.sink.Count.create()).then(function(c) {
          this.totalCount = c.value;
        }.bind(this));
        this.updateSelectedCount(0, 0, 0, this.searchManager.filteredDAO$);
      }
    },
    {
      name: 'updateSelectedCount',
      isFramed: true,
      code: function(_, __, ___, dao) {
        dao.get().select(foam.mlang.sink.Count.create()).then(function(c) {
          this.selectedCount = c.value;
        }.bind(this));
      }
    }
  ]
});
