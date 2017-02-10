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
    
    'foam.u2.grid.NewGridView',
    'com.serviceecho.dao.ReferenceDAO', 
    ],
  
  imports: [
    'TeamDAO',
    'HeroDAO', 
  ], 

  properties: [
    'redHood',
    'echoIsland',
    {
        name: 'redHoodId',
        value: 'RH', 
    },
    {
        name: 'echoIslandId',
        value: 'EI',
    }, 
  ],

  methods: [
    
    function initE(){
       this.
       start(this.STOP, {data: this}).end().
       start(this.FIND_BUTTON, {data: this}).end().
       start(this.PRINT_ALL_INFO, {data: this}).end().
       start(this.SET_ID, {data: this}).end();
       this.start('h3').add('see dev console : ').end('h3');
       }, 
    
    function init() {
        var self = this; 
         this.TeamDAO.find(this.echoIslandId).then(function(team){
            self.echoIsland = team;
         });
    
    },
    
    function printHeroInfo(hero){
        console.log("Name: " + hero.name + ", Org:" + hero.organization, + " -- " +
                    hero.organization && hero.organization.name); 
    }
  ],
  
      actions:
    [

        {
            name: 'stop',
            code: function(){
                debugger;
                
                
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
            }
        },
    
           {
            label: 'find RH',
            name: 'findButton',
            code: function(){
                var self = this;
                var d = this.ReferenceDAO.create({delegate: this.HeroDAO}, this);
                d.find(this.redHoodId).then(function(hero){
                    if (hero) self.printHeroInfo(hero); 
                });
                
                
             }
            }, 
            
            
        
        {
            label: 'set organization Id to null',
            name: 'setId',
            code: function(){
                var self = this; 
                this.HeroDAO.find(this.redHoodId).then(function(hero){
                 if (! hero){
                   console.log("no valid hero found");
                   return; 
                 }
                 
                 //hero.organizationId = self.echoIslandId;
                 hero.organizationId = null; 
                      self.HeroDAO.put(hero).then(function(newHero){
                        self.printHeroInfo(newhero);                        
                      });
                
                
             });
            }
        },
        
         {
            label: 'printAllInfo',
            name: 'printAllInfo',
            code: function(){
                var self = this; 
                var d = this.ReferenceDAO.create({delegate: this.HeroDAO}, this);
                d.select().then(function(result){
                    let arr = result.a;
                    for (var i=0; i<arr.length; i++){
                        var hero = arr[i];
                        if (hero) self.printHeroInfo(hero); 
                    }
                    
                });
            }
        }, 
        
    ], 
  
  
});


function loadfct (){
    var c = DCWorldMain.create(); 
    //document.getElementById('FOAMContainer').innerHTML = c.controller.outerHTML;
}; 