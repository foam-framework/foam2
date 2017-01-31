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
    'foam.u2.grid.GridView',
    'foam.u2.ViewSpec',
    'foam.u2.search.FilterController',
    
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

    
    'gridView',
     {
            class: 'foam.u2.ViewSpec',
            name: "filterController",

          },
  ],

  methods: [
    
    function initE(){
       this.start(this.STOP, {data: this}).end();
       this.start("h3").add("GridView + FilterController: ").end("h3");
       this.add(this.filterController);
       
       //this.start("h3").add("Using PropertiesArray: ").end("h3");
       //this.add(this.arrGridView$);
       }, 
    
    function init() {
        
        this.searchDateArray= SE.util.getWeekDateArray(new Date(), 1);
        
        this.filterController = this.FilterController.create({
                        of: this.Hero, 
                        data$: this.HeroDAO$,
                        textSearch: false,
                        rowHeight: 64,
                        allowAddingFilters: false,
                        searchFields: [
                          'name',
                          'status',
                          'organization',
                        ]
                });
        
        this.gridView = this.GridView.create({
                of: this.Hero,
                data$: this.filterController.filteredDAO$,
                cellView: 'HeroCellView', 
                rowProperty: this.Hero.ORGANIZATION, //eq(rowProperty, rowProperties[i])
                rowPropertiesDAO: this.TeamDAO, // or pass in rowDAO //make it dao based.
                matchRowId: true,
                colProperty: this.Hero.LAST_SEEN_ALIVE, 
                colPropertiesArray: this.searchDateArray, //or pass in colDAO
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

