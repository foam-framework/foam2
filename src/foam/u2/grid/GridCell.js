foam.CLASS
({
    package: 'foam.u2.grid',
    name: 'GridCell',
    extends: 'foam.u2.Element',

    imports: [
    ],
    
    implements: [
        'foam.mlang.Expressions', 
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
        'of',
        'selectedEntry',
        {
            name: 'entrySelectable',
            class: 'Boolean',
            value: false, 
        }, 
        {
            name: 'cell',
            factory: function(){
                var b  = foam.u2.Element.create();
                b.setNodeName('div');
                return b; 
            }
        },
        {
            name: 'cellBottom',
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
            name: 'order', 
        }, 
    
        'colProperty',
        'rowProperty',
        'colMatch',
        'rowMatch',
        //might not be an id, might be an object, date, etc. 
        {
            name: 'colMatchId',
            expression: function(colMatch, matchColId){
               if (matchColId && colMatch ) return colMatch.id; 
                return colMatch; 
               
            }
        }, 
        {
            name: 'rowMatchId',
            expression: function(rowMatch, matchRowId){
               if (matchRowId && rowMatch ) return rowMatch.id; 
               return rowMatch; 
            }
        }, 
        {
            name: 'selected',
            class: 'Boolean',
            value: false, 
        },
        {
            name: 'matchRowId',
            class: 'Boolean',
            value: false, 
        },
        {
            name: 'matchColId',
            class: 'Boolean',
            value: false, 
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
            name: 'selectedCSSClass',
            expression: function(selected){
                return selected?this.myCls('selected'):'';
            }
        },
        {
            name: 'rowHighlightCSSClass',
            expression: function(inSelectedRow, inSelectedCol){
                if (inSelectedCol) return inSelectedRow?this.myCls('intersection-highlight'):'';
                return inSelectedRow?this.myCls('row-highlight'):'';
            }
        },
        {
            name: 'colHighlightCSSClass',
            expression: function(inSelectedCol, inSelectedRow){
                if (inSelectedRow) return inSelectedCol?this.myCls('intersection-highlight'):'';
                return inSelectedCol?this.myCls('col-highlight'):'';
            }
        },
        
        {
            name: 'rowPredicate',
            expression: function(rowProperty, rowMatchId, matchRowId){
              return this.makePredicate(rowProperty, rowMatchId, matchRowId);
            }
        },
        {
            name: 'colPredicate',
            expression: function(colProperty, colMatchId, matchColId){
              return this.makePredicate(colProperty, colMatchId, matchColId);
            }
        },
        {
            name: 'predicate',
            expression: function(rowPredicate, colPredicate){
                return this.AND(rowPredicate, colPredicate);
            }
        },
        
        {
            name: 'data',
        },
        
        {
            name: 'resultArr',
            factory: function() { return []; }, 
        }, 
        
        {
            name: 'wrapperClass',
            class: 'Class', 
        }, 
        {
            name: 'wrapper',
            factory: function(){
                return foam.u2.Element.create().setNodeName('div');
            }
        },
        'contextSource', 
        
      ], 
    methods: [
        function init(){
            if (this.wrapperClass){
                var c = this.contextSource?this.contextSource:this;
                this.wrapper = this.wrapperClass.create({cell: this}, c); 
            }
            this.refreshCell();
            //the cell will be redrawn on data update anyways. 
            //this.data.on.sub(this.onDataUpdate);
        },
        
        
        function initE() {
            //sets the row/col highlighting behaviour.
            this.setCSSClass();
            this.cssClass(this.myCls('grid-cell'));
            this.on('click', this.onClick);
            this.setNodeName('td');
            this.start(this.wrapper).add(this.cell$).end();
            //this.add(this.cell$);
        },
        
        function setCSSClass(){
            this.cssClass(this.selectedCSSClass$);
            this.cssClass(this.rowHighlightCSSClass$);
            this.cssClass(this.colHighlightCSSClass$); 
        }, 
        

        
        function refreshCell(){
            this.makeCell();
        },
        
        function makePredicate(currProperty, currMatchId, matchCurrId){
                if (currMatchId === null || currMatchId === undefined){
                    return this.NOT(this.HAS(currProperty));
                }else if (currProperty.cls_.name == 'Date'){
                   return Query.util.inDay(currProperty, currMatchId);
                } else {
                    if (matchCurrId){
                        var p = currProperty.clone();
                        var pname = currProperty.name; 
                        p.f = function (o) { //p.f == p['f']
                            var obj = o[pname];
                            return obj?obj['id']:obj; 
                            };
                        return this.EQ(p, currMatchId);
                    }else {
                        return this.EQ(currProperty, currMatchId);
                    }
                }
        }, 
        
        function makeCell(){
            //var pred = this.AND(this.colPredicate, this.rowPredicate);

            if(this.predicate && this.data){
                var d = this.data.where(this.predicate);
                if (this.order){
                    d = d.orderBy(this.order);
                }
                d.select().
                then(function(result){
                    var div = foam.u2.Element.create('div');
                    console.log('CELL: row:' + this.rowMatchId + ' col:' + this.colMatchId + ', ' + result.a.length);
                    if (! result || !result.a || !result.a.length){
                        console.log('no result found');
                    }
                    var a = result.a;
                    for (var i=0; i<a.length; i++){
                        var entry = a[i];
                        var v = this.getEntryView(entry); 
                        v.sub('CELL_ENTRY_SELECTED', this.onEntrySelection)
                        div.add(v); 
                    }
                    div.add(this.cellBottom); 
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
                    self.selectedEntry = e.src.data; 
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
        
        function toggleRowHighlight(){
            this.inSelectedRow = ! this.inSelectedRow;
        },
        
        
        function toggleColHighlight(){
            this.inSelectedCol = ! this.inSelectedCol;
        },
        
        function clearCSS(){
        }, 
        
        
    ],
    
    listeners: [
        {
            name: 'onClick',
            code: function(){
                this.selected = !this.selected;
                this.pub('CELL_CLICK');
            }
                
        },
        
        {
            name: 'onEntrySelection',
            isFramed: true,
            code: function(a, b, c){
                this.pub('ENTRY_SELECTION');
                console.log('entry selected in GridCel.js');
                if (a.src && a.src.data){
                    this.selectedEntry = a.src.data;
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