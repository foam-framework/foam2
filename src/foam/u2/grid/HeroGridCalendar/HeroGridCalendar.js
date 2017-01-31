foam.CLASS({
    name: 'DCWorldMain',
    extends: 'foam.u2.Element',

    implements: [ 'LoadDCWorld' ],

    requires: [ 'DCWorldController' ],

    properties: [
        {
            name: 'controller',
            factory: function(){
                return this.DCWorldController.create();
            }
        }
    ],

    methods: [

        function initE(){
            this.add(this.controller);
        },

        function init() {
            this.controller.write();
        }
    ]
});


foam.CLASS({
  name: 'DCWorldController',
  extends: "foam.u2.Element",

  
  requires:
  [
    'Team',
    'Hero', 
    'foam.u2.TableView',
    'com.serviceecho.ui.grid.GridView',
    'foam.u2.ViewSpec',
    'foam.u2.search.FilterController',
    
    'foam.u2.search.WeekSearchView', 
    ],
  
  imports: [
    'TeamDAO',
    'HeroDAO',
  ], 

  properties: [
    {
        name: 'searchDateArray',
        value: [],
    },
    {
        name: 'dateSearchView',
        factory: function() {
        return this.WeekSearchView.create({
            dao$: this.HeroDAO$,
            of: this.Hero.lastSeenAlive});
        }
    },
    {
        name: 'dateSearchViewPred',
        expression: function(dateSearchView){
        return dateSearchView.predicate;
        },
        postSet: function(old, nu){
            this.dateFilteredDAO = this.HeroDAO.where(nu);
        }, 
    },
    
    {
      name: 'dateFilteredDAO',
      factory: function(){
        return this.HeroDAO; 
      }
    },
    
    'gridView',
     {
            class: 'foam.u2.ViewSpec',
            name: "filterController",
            factory:  function(){
                    return this.FilterController.create({
                        of: this.Hero, 
                        data$: this.dateFilteredDAO$, 
                        textSearch: true,
                        rowHeight: 64,
                        allowAddingFilters: false,
                        searchFields: [
                          'name',
                          'status',
                          'organization',
                        ]
                });
            }
          },
  ],

  methods: [
    
    function initE(){
       this.start(this.STOP, {data: this}).end();
       this.start("h3").add("Using PropertiesDAO: ").end("h3");
        this.start(this.CLEAR, {data: this}).end();
        this.add(this.dateSearchView); 
       this.add(this.filterController);
       
       //this.start("h3").add("Using PropertiesArray: ").end("h3");
       //this.add(this.arrGridView$);
       }, 
    
    function init() {
        
        //var weekDateArray = SE.util.getWeekDateArray(new Date(), 1);
        this.searchDateArray$ = this.dateSearchView.dateArray$; 
        
        this.gridView = this.GridView.create({
                of: this.Hero,
                data$: this.filterController.filteredDAO$,
                cellView: 'HeroCellView', 
                rowProperty: this.Hero.ORGANIZATION, //eq(rowProperty, rowProperties[i])
                rowPropertiesDAO: this.TeamDAO, // or pass in rowDAO //make it dao based.
                matchRowId: true,
                colProperty: this.Hero.LAST_SEEN_ALIVE, 
                colPropertiesArray$: this.searchDateArray$, //or pass in colDAO
                rowDAOMatchUndefined: true,
        });
        
        
        this.filterController.tableView$ = this.gridView$;
        

    }
  ],
  
      actions:
    [

        {
            name: "stop",
            code: function(){
                debugger;
            }
        }, 
        {
            name: "clear",
            code: function(){
                this.filterController.clear();
                this.dateSearchView.clear();
            }
        }
    ],
    
    listeners: [
        {
            name: 'fcUpdate',
            code: function(){
                console.log("hi"); 
            }
        }
    ], 
  
  
});

