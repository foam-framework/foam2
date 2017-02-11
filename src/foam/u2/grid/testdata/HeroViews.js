foam.CLASS({
  name: 'HeroCellView',
  extends: 'foam.u2.Element', 
  
  requires: [
        'Team',
        'Hero',
        'foam.u2.Element',
        ],
  
  imports: [
  ], 
  
  properties: [
    "of",
    {
        name: 'data',
        postSet: function(old ,nu){
            nu && nu.sub && nu.sub(this.onDataUpdate);
        }, 
    },
    {
        name: 'cellView',
        factory: function(){
            return this.Element.create(null, this);
        }
    }
    
    ],
  
  methods: [
    function initE(){
        this.add(this.cellView$);
        this.attrs({ draggable: 'true' });
        this.on('dragstart', this.onDragStart); 
    },
    
    function init(){
        this.onDataUpdate();
    },
    
    function makeCellView(){
        var div = foam.u2.Element.create("div");
        if (this.data){
            div.add(foam.u2.Element.create("p").add(this.data.name));
            div.start("small").add(this.data.lastSeenAlive && this.data.lastSeenAlive.toLocaleDateString()).end("small"); 
        }
        //return div;
        this.cellView = div; 
    }
    
  ],
  
    
    listeners: [
        {
            name: "onDataUpdate",
            code: function(){
              this.makeCellView();
            }
        },
        {
          name: 'onDragStart',
          code: function(e) {
          e.dataTransfer.setData('application/x-foam-obj-id', this.data.id);
          e.stopPropagation();
          }
        },
      ],
  
});
  
  
foam.CLASS({
  name: 'NewHeroWrapperView',
  extends: 'foam.u2.Element', 
  
  requires: [
    'Team',
    'Hero',
    ],
  
  imports: [
    
    'HeroDAO',
    'TeamDAO',
  ], 
  
  properties: [
    "of",

    {
        name: 'wrapperView',
        factory: function(){
            return foam.u2.Element.create();
        }
    },
    "status",
    "organization",
    "cell", 
    ],
  
  methods: [
    function initE(){
        //this.cssClass(this.myCls()).
        this.
          style({
            'border': '2px solid red', 
            'height':'100%',
            'width':'100%',
            'display':'inline-block',
            }).
          start('div', null, this.content$).
            cssClass(this.myCls('content')).
          end().
          add(this.wrapperView$);
          
        this.on('dragenter', this.onDragOver).
          on('dragover', this.onDragOver).
          on('drop', this.onDrop); 
    },
    
    function makeWrapper(){
        var div = foam.u2.Element.create("div");
        
        div.start(this.NEW, {data: this}).end() ;
          
        this.wrapperView = div; 
    }, 
    
    function init(){
      //this.organizationId$ = this.cell.rowMatchId$;
      this.organization$ = this.cell.rowMatchId$;
      this.status$ = this.cell.colMatch$; 
        this.onDAOUpdate();
    },
    

    
  ],
  
  
  
    listeners: [
        {
            name: "onDAOUpdate",
            code: function(){
              this.makeWrapper();
            }
        },
         {
            name: 'onDragOver',
            code: function(e){
                console.log("something is dragged over this shit. ");
                  e.preventDefault();
                  e.stopPropagation();
                
            }
        },
        
        {
            name: 'onDrop',
            code: function(e){
                console.log('something is dumped here. ');
                
                      if ( ! e.dataTransfer.types.some(function(m) { return m === 'application/x-foam-obj-id'; }) )
                    return;
            
                  var id = e.dataTransfer.getData('application/x-foam-obj-id');
                  if (!id ) return;
                  //if ( foam.util.equals(id, this.id) ) return;
            
                  e.preventDefault();
                  e.stopPropagation();
            
                  var self = this;
                  this.HeroDAO.find(id).then(function(hero){
                      if (! hero){
                        console.log("no valid hero found");
                        return; 
                      }
                      
                      
                      hero.status = self.status;
                      
                      hero.organizationId = self.organization?self.organization.id:null; 
                      
                        self.HeroDAO.put(hero); 
                      }).then(function(){
                        self.HeroDAO.find(id).then(function(h){
                           console.log(h.name + ", " + h.organizationId);  
                        });
                  }); 
            }
        }
    ],
    
    actions: [
      {
        name: 'new',
        label: '+',
        code: function(){
          this.HeroDAO.select().then(function(result){
            if (result && result.a ) {
              console.log("HeroDAO present.");
              console.log(result.a.length + " Hero found.");
              console.log("Code here to add Hero of  " + this.team.name + ", " + this.status); 
            }else {
              console.log("Error while getting HeroDAO"); 
            }
          }.bind(this)); 
        }
      }
      
    ]
});
