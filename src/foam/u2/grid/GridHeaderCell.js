foam.CLASS
({
    package: 'foam.u2.grid',
    name: 'GridHeaderCell',
    extends: 'foam.u2.Element',

    imports: [
        'rowHeaderSelectionProperty',
        'colHeaderSelectionProperty', 
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
        /*
         * ---------------  data and property display-----------------------
         */
        
        'of',
        {
            name: 'data',
            documentaiton: 'the property, e.g., an instance of ORGANIZATION_ID', 
        },
        {
            name: 'property',
            documentation: 'the property object it self or string, i.e., ORGANIZATION_ID', 
        },
        {
            name: 'isRowHeader',
            value: false, 
            class: 'Boolean', 
        },
        {
            name: 'isColHeader',
            value: false, 
            class: 'Boolean', 
        },
        {
            name: 'selected',
            value: false,
            class: 'Boolean', 
        }, 
        
        /*
         * ------------------------ display elements, e.g., view and css  -------------------------
         */
        {
            name: 'cell',
            factory: function(){
                var b  = foam.u2.Element.create();
                b.setNodeName('div');
                return b; 
            }
        }, 
        {
            name: 'name',
            documentation: 'name of the property, e.g., organizationId', 
            expression: function(data){
                if (!data ) return; 
                if (typeof data == 'string'){
                    return data; 
                }else {
                    return data.label?data.label:data.name;
                }
            }
        },

        {
            name: 'headerHighlightCSSClass',
            expression: function(selected, isRowHeader, isColHeader){
                if (selected){
                    if (isRowHeader){
                        return this.myCls('row-header-highlight');
                    }else if (isColHeader >-1){
                        return this.myCls('col-header-highlight');
                    }
                }
            }
        },

      ], 
    methods: [
        function initE() {
            this.cell.cssClass(this.myCls('cell-header'));
            this.cssClass(this.headerHighlightCSSClass$);
            this.on('click', this.onClick);
            this.setNodeName('td');
            this.cssClass(this.myCls('grid-header-cell'));
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
            var p = foam.u2.Element.create('span');
            if (this.property && this.property.gridHeaderView){
                p.add(this.property.gridHeaderView(this.data));
            }else if (this.name){
                p.add(this.name);
            } else {
            p.add('N/A');
            } 
            this.cell = p;
            
        },
        
        
    ],
    
    listeners: [
        {
            name: 'onClick',
            isFramed: true,
            code: function(){
                console.log('Gridheadercell clicked');
                if (this.isRowHeader) this.rowHeaderSelectionProperty = this.property;
                else if (this.isColHeader) this.colHeaderSelectionProperty = this.property;
                
                this.selected = !this.selected;
                this.pub('selected');
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