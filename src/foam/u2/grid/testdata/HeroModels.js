foam.CLASS({
    refines: 'foam.core.Property',
    properties: [
        {
           name: 'referenceDAOKey',
           documentation: 'get the property object from property Id through DAO', 
        }, 
        {
            class: 'Function',
            name: 'validator',
        },
        {
            class: 'Function',
            name: 'tableFormatter',
            factory: function() { return function(value, obj, t){return value; }; },
        },
        {
            class: 'Function',
            name: 'gridHeaderView',
            factory: function() { return function(value, obj, t){return value; }; },
        },
        {
            name: 'sortable',
            class: 'Boolean',
            value: true, 
        },
        {
            name: 'groupByProperty',
            class: 'String',
            value: 'id',
        },
        {
            name: 'groupByLabel',
            class: 'String',
            value: 'label',
        },
        /*{
            name: 'salesforceType',
            class: 'String'
        },*/
    ],

});



// Relationship Test
foam.CLASS({
  name: 'Team',
  requires: ['Hero'], 
  properties: [ 'name', 'id' ]
});

foam.CLASS({
  name: 'Hero',
  
  requires: ['Team'],
  
  imports: [
    'TeamDAO', 
  ], 
  
  properties: [
    'id',
    {
        name: 'fieldworker',
        referenceProperty: 'fieldworkerId',
        referenceDAO: 'fieldworkerDAO', 
    },
    
    {
        name: 'name',
        gridHeaderView: function(value, obj, t){
            return value; 
        },
    },
    {
        class: 'Date', 
        name: 'birthDate',
    },
    {
        class: 'Date', 
        name: 'lastSeenAlive',
        searchView: 'foam.u2.search.WeekSearchView',
        //searchView: 'foam.u2.DateView',  
        factory: function(){
            return SE.util.startOfToday();
        },
        validator: function(obj) {
                if (  obj.lastSeenAlive && obj.birthDate && (obj.lastSeenAlive < obj.birthDate) ) return 'Must be after birth date, unless you are a time traveller';
        }, 
        gridHeaderView: function(value, obj, t){
            var d = new Date(value);
            var p1 = foam.u2.Element.create('p');
            p1.add(SE.util.getDayName(d));
            var p2 = foam.u2.Element.create('p');
            p2.add(d.getDate() + "" + SE.util.getDayCardinal(d) + " " + SE.util.getShortMonthName(d));
            return foam.u2.Element.create('div').add(p1).add(p2); 
        },
    },
    
    {
        name: 'status',
        searchView: 'foam.u2.search.GroupBySearchView',
        gridHeaderView: function(value, obj, t){
            return value; 
        },
    },
    {
        name: 'organizationId',
        documentation: 'organizationId should always be the one set, instead of organization object.', 
        //hidden: true, 
        postSet: function(old, nu){
            console.log(this.name + " orgainizationId is set. " + nu);
            if (!nu){
                this.clearProperty(this.ORGANIZATION); 
            }
            if (nu && old!=nu){
              this.TeamDAO.find(nu).then(function(organization) {
                if (this.organizationId != organization.id){
                    console.log("error. organization should be set after the organizationId, ids should match."); 
                }
                  this.organization = organization;
                
              }.bind(this));
            }
        }
    },
    
    {
        name: 'organization',
        //class: 'Team', 
        groupById: "id", 
        groupByLabel: "name",
        transient: true, 
        searchView: {
            class: 'com.serviceecho.ui.search.GroupByIdSearchView',
            of: 'Team', 
            showAllChoices: true,
        },
        tableCellView: function(obj, e) {
          return obj && obj.organization && obj.organization.name; 
        },
        tableFormatter: function(value, data, t){
          return value; 
        },
        /*
         * postset should NOT exist. organization should only be changed when organizationid is. 
        postSet: function(old, nu){
            if(! nu || ! nu.id){
                this.clearProperty(this.ORGANIZATION_ID); 
            }else if (! old || !old.id || (old.id != nu.id)){
                this.organizationId = nu.id; 
            }
        },
        */
        gridHeaderView: function(value, obj, t){
            return value?value.name:"N/A"; 
        },
    }
    
    

    ],
  
  methods: [
    /*
    function init(){
        this.name$.sub(this.nameUpdate); 
        this.organizationId$.sub(this.orgUpdate);
        
        if (this.organizationId && this.TeamDAO) {
            this.TeamDAO.find(this.organizationId).then(function(organization) {
                this.organization = organization;
            }.bind(this));
        }
    },
    */
    
    function validate(){
      
    }
  ],
  
  listeners: [
    {
        name: "orgUpdate",
        code: function(){
            console.log("organiztion Updated. ");
        }
    },
    
    {
        name: "nameUpdate",
        code: function(){
            console.log("name Updated. ");
        }
    },

  ]
  
});




foam.RELATIONSHIP({
  sourceModel: 'Team',
  targetModel: 'Hero',
  forwardName: 'members',
  inverseName: 'organizationId'
});

