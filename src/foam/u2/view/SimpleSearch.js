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
    'dao'
  ],

  exports: [
    'as filterController',
    'as data'
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
        // TODO: Support terms specific to the model.
        var word = totalCount === 1 ? 'item' : 'items';
        var format = (int) => int
          .toString()
          .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return selectedCount !== totalCount ?
          `Showing ${format(selectedCount)} out of ${format(totalCount)} items` :
          `${format(totalCount)} ${word}`;
      }
    }
  ],

  methods: [
    function initE() {
      var self = this;

      this.dao.on.sub(this.updateTotalCount);
      this.updateTotalCount();

      var searchManager = self.SearchManager.create({
        dao$: self.dao$,
        predicate$: self.data$
      });
      searchManager.filteredDAO$.sub(self.updateSelectedCount);
      self.updateSelectedCount(0, 0, 0, searchManager.filteredDAO$);

      var generalQueryView = foam.u2.ViewSpec.createView(
        { class: 'foam.u2.search.TextSearchView' },
        {
          richSearch: true,
          of: this.dao.of.id,
          onKey: true
        },
        this,
        this.__subSubContext__
      );

      searchManager.add(generalQueryView);

      this
        .addClass(this.myClass())
        .start()
          .tag(generalQueryView)
        .end()
        .start('p')
          .add(self.countText$)
        .end();
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
