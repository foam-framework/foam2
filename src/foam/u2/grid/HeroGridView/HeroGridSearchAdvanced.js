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
    'com.serviceecho.ui.grid.EditableGridView',
    'foam.u2.ViewSpec',
    'foam.u2.search.FilterController',
    'com.serviceecho.ui.search.CustomFilterController'
    ],
  
  imports: [
    'TeamDAO',
    'HeroDAO', 
  ], 

  properties: [
    'gridView',
     {
            class: 'foam.u2.ViewSpec',
            name: "filterController",
            factory:  function(){
                    return this.CustomFilterController.create({
                        of: this.Hero, 
                        data$: this.HeroDAO$, 
                        textSearch: false,
                        rowHeight: 64,
                        allowAddingFilters: false,
                        searchFields: [
                          'name',
                          'status',
                          'organization',
                        ],
                        rowVisibilityProperty: 'organization', 
                });
            },

          },
  ],

  methods: [
    
    function initE(){
       this.
       start(this.STOP, {data: this}).end().
       start(this.ROWS, {data: this}).end().
       start(this.OTHER_ROWS, {data: this}).end();
       this.start("h3").add("Using PropertiesDAO: ").end("h3");
       this.add(this.filterController);
       //this.start("h3").add("Using PropertiesArray: ").end("h3");
       //this.add(this.arrGridView$);
       }, 
    
    function init() {
        
        this.gridView = this.EditableGridView.create({
                of: this.Hero,
                cellView: 'HeroCellView', 
                data$: this.filterController.filteredDAO$, 
                rowProperty: this.Hero.ORGANIZATION, //eq(rowProperty, rowProperties[i])
                colProperty: this.Hero.STATUS, 
                rowPropertiesDAO: this.TeamDAO, // or pass in rowDAO //make it dao based.
                matchRowId: true, 
                colPropertiesArray: ['alive', 'dead', 'MIA', undefined], //or pass in colDAO
                rowDAOMatchUndefined: true,
                hideRows: true, 
                
        });
        
        this.filterController.tableView$ = this.gridView$;
        
        
        /*
        this.filterController.tableView = this.TableView.create({
            of: this.Hero,
            data$: this.filterController.filteredDAO$, 
        }); */
    }
  ],
  
      actions:
    [
        {
            name: 'rows',
            label: 'No Bats' ,
            code: function(){
                
                this.gridView.visibleRows = ['TS', 'MM', 'EI', '']; 
            }
        },
        {
            name: 'otherRows',
            label: 'Bats + TS', 
            code: function(){
                
                this.gridView.visibleRows = ['B', 'TS']; 
            }
        }, 

        {
            name: "stop",
            code: function(){
                debugger;
                
                /*
                this.TeamDAO.select().then(function(c){
                    console.log("--------------- Team List --------");
                    for (var i=0; i<c.a.length; i++){
                        var d = c.a[i];
                        console.log(d.id + ", " + d.name);
                    } });
                

                this.daoGridView.data.select().then(function(c){
                    console.log("--------------- Hero List --------");
                    for (var i=0; i<c.a.length; i++){
                        var d = c.a[i];
                        var orgStr = d.organizationId ;
                        if (d.organization && d.organization.name) orgStr = d.organization.name; 
                        console.log(d.name + ", " + orgStr);
                    } });*/
            }
        }
    ], 
  
  
});

