foam.CLASS({
  package: 'foam.u2.search',
  name: 'CustomFilterController',
  extends: 'foam.u2.search.FilterController',

  requires: [
  
    'foam.u2.ChoiceNone',
    ],
  
  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          display: flex;
          overflow: hidden;
          flex-grow: 1;
          width: 100%;
        }
        ^search-panel {
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          overflow: hidden;
          min-width: 250px;
        }
        ^adding {
          border: none;
          flex-shrink: 0;
          flex-grow: 0;
          padding: 8px;
        }
        ^add-filter {
          align-items: center;
          display: flex;
          justify-content: space-between;
        }
        ^count {
          align-items: center;
          display: flex;
          justify-content: space-between;
        }
        ^results {
          display: flex;
          flex-grow: 1;
          overflow: hidden;
        }

        ^filter-area {
          flex-grow: 1;
          overflow-y: auto;
        }

        ^filter-header {
          align-items: center;
          display: flex;
        }
        ^filter-label {
          flex-grow: 1;
        }
        ^filter-container {
          margin: 6px 8px 0px;
        }
      */}
    })
  ],

  properties: [
    {
        name: 'views',
        expression: function(searchMgr_){
            return searchMgr_.views; 
        }
    }, 
    {
      class: 'foam.u2.ViewSpec',
      name: 'tableView',
      //value: { class: 'foam.u2.TableView' }
      factory: function(){
        var t = this.TableView.create({ data$: this.filteredDAO$ });
        if (this.data) t.of = this.data.of; 
        return t; 
      }, 
      postSet: function(old, nu){
        if (nu.hideRows === true){
          nu.visibleRows$ = this.visibleRowArray$; 
        }
      }
    },
    {
      name: 'rowVisibilityProperty',
    },
    {
      name: 'visibleRowSelection', 
    }, 
    {
      name: 'visibleRowArray',
      expression: function(visibleRowSelection){
        if (visibleRowSelection == this.ChoiceNone.NONE[0]) return []; 
        if (!visibleRowSelection && visibleRowSelection!==""){
          return []; 
        }else {
          var a = new Array();
          a.push(visibleRowSelection);
          return a; 
        }
      }
    },
    
  ],

  methods: [
    function initE() {
      // Assigning to unused variable to keep Closure happy.
      var _ = this.searchMgr_; // Force the factory to run.
      this.filteredDAO$.sub(this.onPredicateChange);
      this.searchMgr_.predicate.sub(this.onPredicateChange);
      this.searchMgr_.propertyChange.sub("predicate", this.onPredicateChange); 
      this.onPredicateChange();

      this.cssClass(this.myCls());
      this.startContext({ data: this });
      var searchPanel = this.start().cssClass(this.myCls('search-panel'));
      var topPanel = searchPanel.start(this.addingSpec)
          .cssClass(this.myCls('adding'));
      if ( this.allowAddingFilters ) {
        topPanel.start()
            .cssClass(this.myCls('add-filter'))
            .start(this.ChoiceView, {
              data$: this.filterChoice$,
              choices: this.filters
            }).end()
            .add(this.NEW_FILTER)
        .end();
      }

      topPanel.start()
          .cssClass(this.myCls('count'))
          .start('span')
              .cssClass(this.myCls('count-text'))
              .add(this.countString$)
          .end()
          .start(this.CLEAR, { raised: true }).end()
      .end();
      this.filtersE_ = searchPanel.start(this.filterAreaSpec)
          .cssClass(this.myCls('filter-area'));
      this.filtersE_.end();
      this.endContext();
      searchPanel.end();

      this.start().cssClass(this.myCls('results'))
          .add(this.tableView$)
      .end();

      var self = this;
      this.onload.sub(function() {
        if ( self.textSearch ) {
          self.filtersE_.add(self.buildFilter({
            label: 'Search',
            showRemove: false,
            view: self.search
          }));
          self.searchMgr_.add(self.search);
        }

        self.loaded_ = true;
      });

      this.data$.sub(this.updateSearchFields);
      this.loaded_$.sub(this.updateSearchFields);
      this.searchFields$.sub(this.updateSearchFields);
    },

  ],

  listeners: [
    {
      name: 'onPredicateChange',
      isFramed: true,
      code: function() {
        this.filteredDAO.select(this.Count.create())
            .then(function(c) {
              this.count = c.value; }.bind(this));
      }
    },
    {
      name: 'updateCount',
      isFramed: true,
      code: function() {
        this.data.select(this.Count.create()).then(function(c) {
          this.totalCount = c.value;
        }.bind(this));
        this.onPredicateChange();
      }
    },
    {
      name: 'updateSearchFields',
      isFramed: true,
      code: function() {
        if ( ! this.loaded_ || ! this.data ) return;
        var fields = this.searchFields;
        var oldFields = this.oldSearchFields_;

        // Check for every filter that has been removed, and every filter that
        // is freshly added.
        // This function is responsible for choosing the view for each property.
        // Eg. drop-downs for Booleans and Enums, before/after for dates, etc.
        if ( oldFields ) {
          for ( var i = 0; i < oldFields.length; i++ ) {
            if ( ! fields || fields.indexOf(oldFields[i]) < 0 ) {
              this.searchMgr_.remove(oldFields[i]);
              this.searchViews_[oldFields[i]].remove();
              delete this.searchViews_[oldFields[i]];
            }
          }
        }

        if ( fields ) {
          for ( var i = 0; i < fields.length; i++ ) {
            if ( ! oldFields || oldFields.indexOf(fields[i]) < 0 ) {
              var split = this.splitName(fields[i]);
              var prop = this.data.of.getAxiomByName(split.name);
              var spec = prop.searchView;
              // TODO(braden): Bring in date support when it's ready.
              var options = {
                name: fields[i]
              };
              if ( prop.tableSeparator ) {
                options.split = prop.tableSeparator;
              }
              this.addGroup(spec, prop, options);
              this.renderFilter(fields[i]);
              if (prop.name == this.rowVisibilityProperty){
                this.visibleRowSelection$ = this.views[prop.name].view.data$; 
              }
            }
          }
        }

        this.oldSearchFields_ = fields;
      }
    }
  ],

  actions: [
    {
      name: 'clear',
      code: function() { this.searchMgr_.clear(); }
    },
    {
      name: 'newFilter',
      code: function() {
        this.addFilter_(this.filterChoice);
      }
    }
  ]
});
