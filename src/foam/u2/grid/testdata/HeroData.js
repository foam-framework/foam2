/**
   NOTE: this file must be loaded after the config
 */
foam.CLASS ((function() {
    var c = {
  name: 'LoadDCWorld',
  exports: [],
  
    requires: [
      "foam.dao.EasyDAO",
      "foam.dao.PromisedDAO",
      ],
    
  implements: [
            'foam.box.Context',
    ],
  
  properties: [
    ],
  
  }; 
    var teams, heroes;
    
     var teamTestData = [
          {name: 'Team Spider', id: 'TS'},
          {name: 'Bats', id:'B'},
          {name: 'Minutemen', id: 'MM'},
          {name: 'Echo Island', id: 'EI'}
        ]; 

    var d = new Date();
    var heroTestData = [
            {
                name: 'May Jane Watson',
                id:'MJW',  organizationId: 'TS', status: 'alive',
                birthDate: new Date(1990, 10, 02),
                lastSeenAlive: (new Date()).setDate( d.getDate() + 6), },
            {name: 'Gwen Stacy', id:'GS',  organizationId: 'TS', status: 'dead',
            lastSeenAlive: (new Date()).setDate( d.getDate() - 10)},
            {name: 'Peter Parker', id: 'PP', organizationId: 'TS', status: 'alive'},
            {name: 'Venom', id: 'V', organizationId: 'TS', status: 'alive'},
            {name: 'Bat Man',  id:'BM',  organizationId: 'B', status: 'alive'},
            {name: 'Alfred', id:'A', organizationId: 'B', status: 'alive'},
            {name: 'Red Hood', id:'RH', organizationId: 'B', status: 'dead',
            lastSeenAlive: (new Date()).setDate( d.getDate() - 5)},
            //currently, undefined can not be matched.
            {name: 'Joker', id:'JK', organizationId: 'B', lastSeenAlive: undefined},
            {name: "Dr. Thomas Wayne", id: "DrWayne", status: 'dead',
            lastSeenAlive: (new Date()).setDate( d.getDate() - 7)},
            {name: "Martha Wayne", id: "MamaWayne", status: 'dead',
            lastSeenAlive: (new Date()).setDate( d.getDate() - 7)},
            {name: "Dr. Manhattan", id: "DrM", organizationId: "MM", status: "MIA",
            lastSeenAlive: (new Date()).setDate( d.getDate() +2)},
            {name: "Roshak", id: "R", organizationId: "MM", status: "dead",
            lastSeenAlive: (new Date()).setDate( d.getDate() - 1)},
            {name: "The Comedian", id: "TC", organizationId: "MM", status: "dead"},
            {name: "Elvis Parsley", id: "EP",
            lastSeenAlive: (new Date()).setDate( d.getDate() + 3)}, 
            {name: "Harry Potter", id:"HP", status: "alive", lastSeenAlive: null},
            {name: "Snape", id: "S", status: "dead", lastSeenAlive: null}, 
            
        ];
    
    var daos = {};
    
    var factoryFct = function(of, daoName, dao, testData){
        return function(){
            dao =  foam.dao.EasyDAO.create({
                of: of,
                daoType: 'MDAO',
                cache: true,
                dedup: true,
                logging: true,
                contextualize: true,
                //testData: testData, 
                }, this);
            
            var promise = dao.removeAll().then( function(){
                return Promise.all( testData.map(function(entry) {
                            var d = of.create(entry, this); 
                            return dao.put(d);
                        }.bind(this)));

                }.bind(this));
            

            console.log("PromisedDAO.create promise PENDING on info: ", of.name);
            var promisedDAO = this.PromisedDAO.create({
                of: of,
                promise: promise.then(
                    function() {
                        console.log("PromisedDAO.create promise RESOLVED on info: ", of.name);
                        return dao;
                    }.bind(this),
                    function(errorEvt) {
                        console.error("PromisedDAO.create promise REJECT on info: ", of.name, 'error:', errorEvt);
                    }.bind(this))
            });
            
            daos[daoName] = promisedDAO;
            return promisedDAO;
        }; 
    };
    
     //teamFactory = factoryFct(Team, "TeamDAO", teams, teamTestData);
    var teamFactory = factoryFct.apply(this, [Team, "TeamDAO", teams, teamTestData]);
    c.exports.push('TeamDAO');
    c.properties.push({name: 'TeamDAO', factory: teamFactory});
    
    var heroFactory = factoryFct.apply(this, [Hero, "HeroDAO", heroes, heroTestData]);
    c.exports.push('HeroDAO');
    c.properties.push({name: 'HeroDAO', factory: heroFactory});
    


    
    return c;
})());
