foam.CLASS
({
    package: 'foam.u2.grid',
    name: 'GridCell',
    extends: 'foam.u2.Element',

    imports: [
        "entrySelection",
        "rowSelectionProperty",
        "colSelectionProperty",
        "rowHeaderSelectionProperty",
        "colHeaderSelectionProperty", 
    ],
    
    implements: [
        'foam.mlang.Expressions', 
    ], 
    
    requires: [  
    ],
    
    axioms: [
      foam.u2.CSS.create({
          code: function() {/*
                ^grid-cell {
                    border: 1px solid black; 
                    align: center; 
                }
                ^row-highlight {
                    background-color:rgba(0, 0, 255, 0.1);
                }
                ^col-highlight {
                    background-color:rgba(0, 255, 0, 0.1);
                }
                ^intersection-highlight {
                    background-color:rgba(255, 255, 0, 0.4);
                }
                ^selected{
                   border: 2px solid #f00;
                    padding: 2px;
                }
          */}
        })
      ],
    
    properties: [
        /*
         * ---------------------------- data -----------------------
         */
        {
          class: 'Class',
          name: 'of', 
        },
        {
            name: 'data',
            documentation: 'data is not the dao, but the modeled entry it self.',
        },
        
        /*
         * ----------------------- properties to match for cells ----------------------------
         */
        {
            class: 'Class',
            name: 'colProperty',
        },
        {
            class: 'Class',
            name: 'rowProperty',
        }, 
        {
            name: 'colMatch',
            documentation: 'can be an object', 
        }, 
        {
            name: 'rowMatch',
            documentation: 'can be an object', 
        },

        /*
         *----------------- predicate generation for search -------------------
         */
        
        
        {
            name: 'rowPredicate',
            expression: function(rowProperty, rowMatch, makeRowPredicate){
                if (makeRowPredicate) return makeRowPredicate();
                return this.makePredicate(rowProperty, rowMatch);
            }
        },
        {
            name: 'colPredicate',
            expression: function(colProperty, colMatch, makeColPredicate){
                if (makeColPredicate) return makeColPredicate();
                return this.makePredicate(colProperty, colMatch);
            }
        },
        {
            name: 'predicate',
            expression: function(rowPredicate, colPredicate){
                if (!rowPredicate && colPredicate) return;
                else if (rowPredicate && colPredicate) return this.AND(rowPredicate, colPredicate);
                else if (rowPredicate) return rowPredicate;
                else if (colPredicate) return colPredicate;
            }
        },
        {
            name: 'makeRowPredicate',
            documentation: 'custom functions for generating predicates',
            //easier to test for funciton not set.
            //class: 'Function',
        },
        {
            name: 'makeColPredicate',
            documentation: 'custom functions for generating predicates',
            //class: 'Function',
        }, 
        

        
        /*
         *------------------- display properties: order, selection, etc. ------------
         */
        {
            name: 'order', 
        },
        {
            name: 'selected',
            class: 'Boolean',
            value: false, 
        },
            
         /*
         *----------------------------------- Display Elements and Wrappers -----------------------------------
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
            class: 'Class', //e.g.WorkorderCellView
            name: 'cellView',  
        },

        {
            name: 'inSelectedRow',
            class: 'Boolean',
            value: false,
        },
        {
            name: 'inSelectedCol',
            class: 'Boolean',
            value: false,
        },

        
        
        {
            name: 'wrapperClass',
            class: 'Class', 
        },
        {
            name: 'wrapperDAOClass',
            class: 'Class', 
        }, 
        {
            name: 'wrapper',
            expression: function(wrapperClass){
                if (wrapperClass){
                   return wrapperClass.create({cell: this}, this); 
               }
               return foam.u2.Element.create().setNodeName('div');
            }, 
            
        },
        
      ], 
    methods: [
        function init(){
            this.propertyChange.sub("rowHeaderSelectionProperty", this.refreshSelection);
            this.propertyChange.sub("colHeaderSelectionProperty", this.refreshSelection);
            //the cell will be redrawn on data update anyways. 
            //this.data.on.sub(this.onDataUpdate);
        },
        
        
        function initE() {
            this.refreshCell();
            this.cssClass(this.myCls('grid-cell'));
            this.on('click', this.onClick);
            this.setNodeName('td');
            this.start(this.wrapper).add(this.cell$).end(); 
            //this.add(this.cell$);
        },        

        
        function makePredicate(prop, match){
                if (match === null || match === undefined){
                    return this.NOT(this.HAS(prop));
                }else if (prop.cls_.name == 'Date'){
                   return Query.util.inDay(prop, currMatchId);
                } else {
                    if (typeof(match) === typeof(prop) && typeof(prop)!== "object"){
                        // if both are say, object, string or numbers
                        return this.EQ(prop, match); 
                    }else {
                        // easy match configuration, if match is an object.
                        //for anything complicated, please override makeRowPredicate and makeColPredicate. 
                        /*
                        var p = currProperty.clone();
                        var pname = currProperty.name; 
                        p.f = function (o) { //p.f == p['f']
                            var obj = o[pname];
                            return obj?obj['id']:obj; 
                            };
                        */
                        return this.EQ(prop, match.id?match.id:match);
                    
                    }
                }
        }, 
        
        
        function refreshCell(){

            var d; 
            if(this.predicate && this.data){
                    d = this.data.where(this.predicate);
                if (this.order){
                    d = d.orderBy(this.order);
                }
                
                if (this.wrapperDAOClass) d = this.wrapperDAOClass.create({delegate: d}, this);

                d.select().then(function(result){
                    
                    var div = foam.u2.Element.create('div');
                    console.log('CELL: row:' + this.rowProperty + ' col:' + this.colProperty + ', ' + result.a.length);
                    if (! result || !result.a || !result.a.length){
                        console.log('no result found');
                    }
                    result.a.forEach(function(entry){
                        var v = this.getEntryView(entry); 
                            v.on('click',  function(){
                            console.log('entry selected in GridCel.js');
                            this.entrySelection = entry; 
                        }.bind(this)); 
                        div.add(v); 
                    }.bind(this)); 
                    this.cell = div;
                }.bind(this));
            }else {
                var p = foam.u2.Element.create('div');
                p.add('---');
                this.cell = p;
            }
        },
        
        function getEntryView(entry){
            console.log(entry);
            var v = this.getCellView(entry);
            if (self.entrySelectable){
                v.sub('SELECTED', function(e){
                    self.entrySelection = e.src.data; 
                    self.pub('ENTRY_SELECTION');
                    }.bind(this));
            }
            return v; 
        }, 
        
        function getCellView(a){
            if (this.cellView){
                var v = this.cellView$cls.create({of: this.of, data: a});
                return v; 
            }
            var d = foam.u2.Element.create('div');
            d.add(foam.u2.Element.create('p').add(a.name));
            d.add(foam.u2.Element.create('p').add(a.lastSeenAlive));
            return d; 
        },
        
        function refreshSelection(){
            var rowSelected = this.isRowSelected();
            var colSelected = this.isColSelected();
            if (rowSelected && colSelected){
                this.enableCls(this.myCls('intersection-highlight'), true);
            }else {
                this.enableCls(this.myCls('intersection-highlight'), false);
            if (rowSelected){
                this.enableCls(this.myCls('row-highlight'), true);
                }else {
                    this.enableCls(this.myCls('row-highlight'), false);
                }
                
                if (colSelected){
                    this.enableCls(this.myCls('col-highlight'), true);
                }else {
                    this.enableCls(this.myCls('col-highlight'), false);
                }                
            }
            
            if (this.isCellSelected()){
                this.enableCls(this.myCls('selected'), true);
            }else {
                this.enableCls(this.myCls('selected'), false);
            }
            
        },
        
        function isRowSelected(){
            
        },
        
        function isColSelected(){
            
        },
        
        function isCellSelected(){
        }
        
    ],
    
    listeners: [
        {
            name: 'onClick',
            code: function(){
                this.selected = !this.selected;
                if (this.selected){
                    this.colSelectionProperty = this.colProperty;
                    this.rowSelectionProperty = this.rowProperty; 
                }else {
                    this.colSelectionProperty = null; 
                    this.rowSelectionProperty = null; 
                }
                
            }
                
        },
        
        {
            name: 'onEntrySelection',
            isFramed: true,
            code: function(a, b, c){
                this.pub('ENTRY_SELECTION');
                console.log('entry selected in GridCel.js');
                if (a.src && a.src.data){
                    this.entrySelection = a.src.data;
                    this.pub('ENTRY_SELECTION'); 
                }
            }
                
        },
        
        {
            name: 'onDataUpdate',
            isFramed: true,
            mergeDelay: 1000, 
            code: function(){
                console.log('GridCell refreshed');
                this.refreshCell();
                }
                
        },       
    ]
    
    
    
}); 