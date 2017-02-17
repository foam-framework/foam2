foam.CLASS
({
    package: 'foam.u2.grid',
    name: 'GridHeaderCell',
    extends: 'foam.u2.Element',

    imports: [
        'rowHeaderSelectionProperty',
        'colHeaderSelectionProperty',
        'colHeaderUndefinedMatch',
        'rowHeaderUndefinedMatch', 
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
            /*
            postSet: function(old, nu){
                if (nu === undefined){
                    if (this.isRowHeader)return this.rowHeaderUndefinedMatch;
                    if (this.isColHeader) return this.colHeaderUndefinedMatch; 
                }
            }*/
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

      ], 
    methods: [
        function initE() {
            this.cell.cssClass(this.myCls('cell-header'));
            this.on('click', this.onClick);
            this.setNodeName('td');
            this.cssClass(this.myCls('grid-header-cell'));
            this.add(this.cell$);
        },
        
        function init(){
            this.selected$.sub(this.refreshSelection);
            this.rowHeaderSelectionProperty$.sub(this.refreshSelection);
            this.colHeaderSelectionProperty$.sub(this.refreshSelection);
            
            this.refreshCell();
            //this.property.on.sub(this.onPropertyUpdate); 
        }, 
        
        function refreshCell(){
            var p = foam.u2.Element.create('span');
            if (this.property && this.property.gridHeaderView){
                if (this.isRowHeader )
                    if (foam.util.compare(this.rowHeaderUndefinedMatch, this.data) === 0)
                        p.add(this.property.gridHeaderView(undefined));
                    else p.add(this.property.gridHeaderView(this.data));
                if (this.isColHeader )
                    if (foam.util.compare(this.colHeaderUndefinedMatch, this.data) === 0)
                        p.add(this.property.gridHeaderView(undefined));
                    else p.add(this.property.gridHeaderView(this.data));
                
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
                if (! this.selected){
                    this.selected = true;
                    if (this.isRowHeader) this.rowHeaderSelectionProperty = this.data;
                    else if (this.isColHeader) this.colHeaderSelectionProperty = this.data;
                } else {
                    this.selected = false; 
                    if (this.isRowHeader) this.rowHeaderSelectionProperty = undefined;
                    else if (this.isColHeader) this.colHeaderSelectionProperty = undefined;
                }
                
                
            }
                
        },
        
        {
            name: 'refreshSelection',
            isFramed: true, 
            code: function (){
                if ( this.isRowHeader){
                    if( foam.util.compare(this.rowHeaderSelectionProperty, this.data) === 0)
                        this.selected = true;
                    else this.selected = false;
                }
                if ( this.isColHeader){
                    if( foam.util.compare(this.colHeaderSelectionProperty, this.data) === 0)
                        this.selected = true;
                    else this.selected = false;
                }
                
                if (this.selected){
                    if (this.isRowHeader) this.enableCls(this.myCls('row-header-highlight'), true);
                    if (this.isColHeader) this.enableCls(this.myCls('col-header-highlight'), true);
                    
                }else {
                    this.enableCls(this.myCls('row-header-highlight'), false); 
                    this.enableCls(this.myCls('col-header-highlight'), false);
                }
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