foam.CLASS({
    refines: 'foam.core.Property',
    properties: [
        {
            class: 'String', 
            name: 'referenceDAOKey',
            documentation: 'get the property object from property Id through DAO' 
        },
        {
            class: 'String', 
            name: 'referenceProperty',
            documentation: 'the property object gotten from DAO specifed by referenceDAOKey'
        }, 
        {
            class: 'Function',
            name: 'validator'
        },
        {
            class: 'Function',
            name: 'tableFormatter',
            factory: function() { return function(value, obj, t){return value; }; }
        },
        {
            class: 'Function',
            name: 'gridHeaderView',
            factory: function() { return function(value, obj, t){return value; }; }
        },
        {
            name: 'sortable',
            class: 'Boolean',
            value: true
        },
        {
            name: 'groupByProperty',
            class: 'String',
            value: 'id'
        },
        {
            name: 'groupByLabel',
            class: 'String',
            value: 'label'
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
        referenceDAO: 'fieldworkerDAO'
    },
    
    {
        name: 'name',
        gridHeaderView: function(value, obj, t){
            return value; 
        },
    },
    {
        class: 'Date', 
        name: 'birthDate'
    },
    {
        class: 'Date', 
        name: 'lastSeenAlive',
        searchView: 'foam.u2.search.WeekSearchView',
        //searchView: 'foam.u2.DateView',  
        factory: function(){
            return foam.DateTime.startOfToday();
        },
        validator: function(obj) {
                if (  obj.lastSeenAlive && obj.birthDate && (obj.lastSeenAlive < obj.birthDate) ) return 'Must be after birth date, unless you are a time traveller';
        }, 
        gridHeaderView: function(value, obj, t){
            var d = new Date(value);
            var p1 = foam.u2.Element.create('p');
            p1.add(foam.DateTime.getDayName(d));
            var p2 = foam.u2.Element.create('p');
            p2.add(d.getDate() + "" + foam.DateTime.getDayCardinal(d) + " " + foam.DateTime.getShortMonthName(d));
            return foam.u2.Element.create('div').add(p1).add(p2); 
        }
    },
    
    {
        name: 'status',
        searchView: 'foam.u2.search.GroupBySearchView',
        gridHeaderView: function(value, obj, t){
            return value; 
        }
    },
    {
        class: 'String', 
        name: 'organizationId',
        documentation: 'organizationId should always be the one set, instead of organization object.',
        transient: true, 
        referenceDAOKey: 'TeamDAO',
        referenceProperty: 'organization',
        gridHeaderView: function(value, obj, t){
            if (! value) return '--'; 
            return value.name || value.id || value; 
        },
        compare: function(o1, o2){
            var id1, id2; 
            if (typeof(o1) === "string" )id1 = o1;
            else if (o1.id) id1 = o1.id;
            else id1 = o1; 
            if (typeof(o2) === "string" )id2 = o2;
            else if (o2.id) id1 = o2.id;
            else id2 = o2;
            
            return foam.util.compare(id1, id2); 
        },
    },
    
    {
        name: 'organization',
        //class: 'Team', 
        groupById: "id", 
        groupByLabel: "name",
        transient: true, 
        searchView: {
            class: 'foam.u2.search.GroupByIdSearchView',
            of: 'Team', 
            showAllChoices: true,
        },
        tableCellView: function(obj, e) {
          return obj && obj.organization && obj.organization.name; 
        },
        tableFormatter: function(value, data, t){
          return value; 
        },
        gridHeaderView: function(value, obj, t){
            return value?value.name:"N/A"; 
        }
    }
    ],
  
  methods: [
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
    }

  ]
  
});




foam.RELATIONSHIP({
  sourceModel: 'Team',
  targetModel: 'Hero',
  forwardName: 'members',
  inverseName: 'organizationId'
});

