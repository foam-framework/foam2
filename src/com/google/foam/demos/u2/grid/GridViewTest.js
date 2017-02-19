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
  extends: 'foam.u2.Element',

  
  requires:
  [
    'Team',
    'Hero', 
    'foam.u2.TableView',
    
    'foam.u2.grid.GridView',
    
    'foam.dao.ReferenceDAO', 
    ],
  
  imports: [
    'TeamDAO',
    'HeroDAO',
    
  ], 

  properties: [
    'gridView', 
  ],

  methods: [
    
    function initE(){
       this.
       start(this.STOP, {data: this}).end();
       this.start(this.TOGGLE_ROWS, {data:this}).end(); 
       this.start('h3').add('Using PropertiesDAO: ').end('h3');
       this.add(this.gridView);
       //this.start('h3').add('Using PropertiesArray: ').end('h3');
       //this.add(this.arrGridView$);
       }, 
    
    function init() {
        this.gridView = this.GridView.create({
                        of: this.Hero,
                        data$: this.HeroDAO$, 
                        rowProperty: this.Hero.ORGANIZATION_ID, //eq(rowProperty, rowProperties[i])
                        cellView: 'HeroCellView',
                        cellWrapperClass: 'NewHeroWrapperView',  
                        colProperty: this.Hero.STATUS, 
                        rowPropertiesDAO: this.TeamDAO, // or pass in rowDAO //make it dao based.
                        colPropertiesArray: ['alive', 'dead', 'MIA', undefined], //or pass in colDAO
                        rowDAOMatchUndefined: true,
                        wrapperDAOClass: 'com.serviceecho.dao.ReferenceDAO', 
                });
        
        /*     
      this.arrGridView = this.GridView.create({
        data$: this.HeroDAO$,
        of: this.Hero, 
        rowProperty: this.Hero.ORGANIZATIONID, //eq(rowProperty, rowProperties[i])
        colProperty: this.Hero.STATUS, 
        rowPropertiesArray: ['TS', 'B'], // or pass in rowDAO //make it dao based.
        colPropertiesArray: ['dead','alive'], //or pass in colDAO
      });
      */
      

    }
  ],
  
      actions:
    [

        {
            name: 'stop',
            code: function(){
                debugger;
                
                /*
                this.TeamDAO.select().then(function(c){
                    console.log('--------------- Team List --------');
                    for (var i=0; i<c.a.length; i++){
                        var d = c.a[i];
                        console.log(d.id + ', ' + d.name);
                    } });
                

                this.daoGridView.data.select().then(function(c){
                    console.log('--------------- Hero List --------');
                    for (var i=0; i<c.a.length; i++){
                        var d = c.a[i];
                        var orgStr = d.organizationId ;
                        if (d.organization && d.organization.name) orgStr = d.organization.name; 
                        console.log(d.name + ', ' + orgStr);
                    } });
                    */
            }
        },
        
          {
            name: 'toggleRows',
            code: function(){
                if (! this.gridView.visibleRowIds || this.gridView.visibleRowIds.length <=0 ){
                    this.gridView.visibleRowIds = ["B", "EI", ""]; 
                }else {
                    this.gridView.visibleRowIds = []; 
                }
            }
        }
        
    ], 
  
  
});


function loadfct (){
    var c = DCWorldMain.create(); 
    //document.getElementById('FOAMContainer').innerHTML = c.controller.outerHTML;
}; 