foam.CLASS
({
    package: "foam.u2.grid",
    name: "GridHeaderCell",
    extends: "foam.u2.Element",

    imports: [
    ], 
    
    axioms: [
      foam.u2.CSS.create({
          code: function() {/*
                ^grid-header-cell {
                    border: 2px solid black;
                }
                ^cell-header {
                    line-height: 100%;
                    font-size: 120%;
                    font-weight: bold;
                    text-align: center;
                }
                ^row-header-highlight {
                    background-color:rgba(0, 0, 255, 0.3);
                }
                ^col-header-highlight {
                    background-color:rgba(0, 255, 0, 0.3);
                }
          */}
        })
      ],
    
    properties: [
        'of',
        {
            name: "cell",
            factory: function(){
                var b  = foam.u2.Element.create();
                b.setNodeName("div");
                return b; 
            }
        }, 
        'property',
        'data', 
        //rowIndex and colIndex keeps track of if it's row or col header, and which row/col it is. 
        {
            name: 'rowIndex',
            value: -1, 
        },
        {
            name: 'colIndex',
            value: -1, 
        }, 
        {
            name: 'name',
            expression: function(data){
                if (typeof data == "string"){
                    return data; 
                }else if (data && data.name){
                    return data.name; 
                }
                return undefined; 
            }
        },
        {
            name: "M",
            factory: function() { return foam.mlang.Expressions.create();},
        }, 
        
        {
            name: 'isSelected',
            value: false, 
        }, 
        {
            name: 'headerHighlightCSSClass',
            expression: function(isSelected, rowIndex, colIndex){
                if (isSelected){
                    if (rowIndex >-1){
                        return this.myCls("row-header-highlight");
                    }else if (colIndex >-1){
                        return this.myCls("col-header-highlight");
                    }
                }
            }
        },

      ], 
    methods: [
        function initE() {
            this.cell.cssClass(this.myCls("cell-header"));
            this.cssClass(this.headerHighlightCSSClass$);
            this.on("click", this.onClick);
            this.setNodeName("td");
            this.cssClass(this.myCls("grid-header-cell"));
            this.add(this.cell$);
        },
        
        function init(){
            this.refreshCell();
            //this.property.on.sub(this.onPropertyUpdate); 
        }, 
        
        function refreshCell(){
            this.makeCell();
        },
        
        function makeCell(){
            var p = foam.u2.Element.create("span");
            if (this.property && this.property.gridHeaderView){
                p.add(this.property.gridHeaderView(this.data));
            }else if (this.name){
                p.add(this.name);
            } else {
            p.add("N/A");
            } 
            this.cell = p;
            
        },
        
        
    ],
    
    listeners: [
        {
            name: 'onClick',
            isFramed: true,
            code: function(){
                console.log("Gridheadercell clicked");
                this.isSelected = !this.isSelected; 
                this.pub("selected");
                }
                
        },
        
        {
            name: 'onPropertyUpdate',
            isFramed: true,
            code: function(){
                this.refreshCell();
                }
                
        },       
    ]
    
    
    
}); 