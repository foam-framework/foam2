foam.CLASS
({
    package: 'foam.u2.grid',
    name: 'GridView',
    extends: 'foam.u2.Element',

    implements: [
    ],

    requires:
    [
        'foam.u2.grid.GridCell',
        'foam.u2.grid.GridHeaderCell', 
    ],

    imports: [
    ],
    
    axioms: [
      foam.u2.CSS.create({
          code: function() {/*
            ^grid-table {
                border-collapse: collapse;
                border: 1px solid black;
                border-collapse: collapse;
            }
            
            ^grid-table tr td{
                border: 1px solid black;
            }
            
            ^hidden {
              display: none !important;
            }
                
          */}
        })
      ],

    properties: [
    {
        name: 'body',
        factory: function(){
            var b  = foam.u2.Element.create(null, this);
            b.setNodeName('tbody');
            return b; 
        }
    },
    {
        name: 'headerRow', 
    }, 
    {
        name: 'cellArray',
        factory: function(){return []; },
    }, 
    {
        name: 'rowArray',
        factory: function(){return []; },  
    }, 
    {
        name: 'data',
        postSet: function(old, nu){
            old && old.on && old.on.unsub && old.on.unsub(this.onDataUpdate);
            nu && nu.on && nu.on.sub(this.onDataUpdate);
            this.onDataUpdate();
        }
    },
    
    {
      class: 'Class',
      name: 'of'
    },
    
    
    {
        class: 'Class',
        name: 'cellView', 
    }, 
    
    //group by row first, then columns.
    {
        //a PROPERTY object from foam2
        //e.g. myFieldworker.STATUS
        name: 'colProperty', 
    },
    {
        name: 'rowProperty', 
    },
    
    'currColProperty',
    'currRowProperty', 
    {
        name: 'order', 
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
        //used to generate colPropertiesArray
        name: 'colPropertiesDAO',
    },
    {
        name: 'rowPropertiesDAO',
        postSet: function(old, nu){
            nu.on.sub(this.onRowPropertiesDAOUpdate);
        }
    },
    {
        name: 'rowDAOMatchUndefined',
        class: 'Boolean', 
        value: false, 
    }, 
    {
        name: 'colDAOMatchUndefined',
        class: 'Boolean', 
        value: false, 
    }, 
    {
        //Possible Row PropertiesArray.
        //can be supplied by user, or extrated from data using colProperty. 
        name: 'colPropertiesArray',
        value: [], 
        postSet: function(){
            this.onDataUpdate();
        }
    },
    {
        //Possible Row PropertiesArray.
        //can be supplied by user, or extrated from data using colProperty. 
        name: 'rowPropertiesArray',
        value: [],
        postSet: function(){
            this.onDataUpdate();
        }
    },
    
    {
        name: 'gridPropertiesArray',
        expression: function(of) {
            return of.create({}, this.__context__).getDefaultPropertiesArray(); }
    },
    {
        name: 'cellWrapperClass',
        class: 'Class', 
    }, 
    {
        name: 'hideRows',
        class: 'Boolean', 
        value: false, 
    },
    {
        name: 'visibleRows',
        value: [], //array of ids of rows, or object of rows to show.
        postSet: function(old,nu){
            this.redrawRows();
        }
    }, 
    {
        name: 'rowVisibilityFunction', 
        class: 'Function',
        // returns rue for showing, flase for hidden
        value: function(match){
            //if undefined is selected, show all. 
            if (!match && match!=='') return true;
            // can match string or obj.id. input must be a string. 
            // if visible rows not specified, then show everything. 
            if (!this.visibleRows || this.visibleRows.length  === 0) return true;

            if (this.visibleRows.indexOf(match) >-1) return true;
            return false; 
        }
    }, 
    
    'selectedEntry',
    'contextSource', 

    ],

    methods:
    [
        function initE() {
            this.setNodeName('table');
            
            this.cssClass(this.myCls('grid-table'));
            this.add(this.body$);

        },

        function init(){
            this.onRowPropertiesDAOUpdate();
            this.onDataUpdate();

        },
        

        function makeGrid(){

            this.makeBody();
        },

        function refreshGrid(){

            this.makeGrid();
            this.redrawRows(); 
        },

        function makeBody(){
            var b  = foam.u2.Element.create(null, this);
            b.setNodeName('tbody');
            this.cellArray = [];
            this.rowArray = []; 
            
            
            for (var i=-1; i< this.rowPropertiesArray.length; i++){
                var r = foam.u2.Element.create(null, this);
                var currCellRow = []; 
                r.setNodeName('tr');
                for (var j=-1; j< this.colPropertiesArray.length; j++){
                    if (i == -1 && j ==-1){
                        r.start(this.GridHeaderCell, {name: '--'}).end(); 
                    }else if (j==-1){ //head row or head column
                        var rowHeaderCell = this.GridHeaderCell.create({
                            data: this.rowPropertiesArray[i],
                            property: this.rowProperty,
                            rowIndex : i, 
                            });
                        rowHeaderCell.sub('selected', this.onRowSelect);
                        r.add(rowHeaderCell);
                    }else if (i==-1){ //head row or head column
                        var colHeaderCell = this.GridHeaderCell.create({
                            data: this.colPropertiesArray[j],
                            property: this.colProperty,
                            colIndex: j,
                            });
                        colHeaderCell.sub('selected', this.onColSelect);
                        r.add(colHeaderCell);

                    }else {
                        /*
                        var bcell  = foam.u2.Element.create();
                        bcell.setNodeName('td');
                        bcell.add('body');
                        r.add(bcell);
                        */
                        var currCell = this.GridCell.create({
                            data$: this.data$,
                            cellView$: this.cellView$, 
                            rowMatch: this.rowPropertiesArray[i],
                            colMatch: this.colPropertiesArray[j],
                            matchRowId: this.matchRowId,
                            matchColId: this.matchColId, 
                            rowProperty: this.rowProperty, 
                            colProperty: this.colProperty,
                            order: this.order,
                            wrapperClass: this.cellWrapperClass,
                            contextSource: this.contextSource,
                        });
                        currCell.sub('CELL_CLICK', this.onCellClick);
                        currCell.sub('ENTRY_SELECTION', this.onEntrySelection); 
                        r.add(currCell);
                        currCellRow.push(currCell); 
                    }
                }
                //all cells added to the row. 
                b.add(r);

                if (i == -1) {
                    this.headerRow = r;
                } else {
                    var tmparr = new Array();
                    var key;
                    if (this.matchRowId){
                        if (this.rowPropertiesArray[i]){
                            key = this.rowPropertiesArray[i].id;
                        }else {
                            key = ''; 
                        }
                    }else {
                        key = this.rowPropertiesArray[i];
                    }
                    tmparr[0] = key; 
                    tmparr[1] = r; 
                    this.rowArray.push([key, r]); 
                }
                if (i!=-1){
                    this.cellArray.push(currCellRow); 
                }
            }
            this.body = b; 

        },
        
        function redrawRows(){
            if (!this.hideRows) return;
            if (! this.headerRow || !this.rowArray || !this.rowArray.length) return; 

            for (var i=0; i< this.rowArray.length; i++){
                var currRowProp = this.rowArray[i][0];
                var currRow = this.rowArray[i][1]; 
                if (! this.rowVisibilityFunction(currRowProp)){
                    currRow.enableCls(this.myCls('hidden'), true); 
                }else {
                    currRow.enableCls(this.myCls('hidden'), false); 
                }
            }
        }
        
    ],

    listeners: [
        {
            name: 'onCellClick',
            isFramed: true,
            code: function(){
                var src = arguments[0].src;
                this.currColProperty = src.colMatch;
                this.currRowProperty = src.rowMatch;
                this.pub('CELL_CLICK');
                
            console.log('cell clicked');
            }
        },
        {
            name: 'onEntrySelection',
            isFramed: true,
            code: function(){
                var src = arguments[0].src;
                this.selectedEntry = src.selectedEntry;
                console.log('yepie, shit works'); 
            }
        }, 
        {
            name: 'onSortUpdate',
            isFramed: true,
            code: function(){

                this.makeGrid();
            }
        },

         {
            name: 'onDataUpdate',
            isFramed: true, 
            code: function() {
                console.log('Data updated in GridView');
                this.refreshGrid();
            }
          },
          
          {
            name: 'onRowPropertiesDAOUpdate',
            isFramed: true,
            code: function(){
                if (this.rowPropertiesDAO){
                    this.rowPropertiesDAO.select().then(function(result){
                        if (!result || ! result.a || !result.a.length){
                            console.log('no Column Property detected');
                            return;
                        }else {
                            var arr = [];
                            result.a.forEach(function(e){arr.push(e);});
                            this.rowPropertiesArray = arr; 
                        }
                        if (this.rowDAOMatchUndefined){
                            // very important to use null instead of undefined.
                            // posetSet is not triggered for FOAM if undefined is used. 
                            this.rowPropertiesArray.push(null); 
                        }
                        this.refreshGrid();
                    }.bind(this));
                }
            }
          },
          
          {
            name: 'onColPropertiesDAOUpdate',
            isFramed: true,
            code: function(){
                if (this.colPropertiesDAO){
                    this.colPropertiesDAO.select().then(function(result){
                        if (!result || ! result.a || !result.a.length){
                            console.log('no Column Property detected');
                            return;
                        }else {
                            var arr = [];
                            result.a.forEach(function(e){arr.push(e);});
                            this.colPropertiesArray = arr; 
                        }
                        if (this.colDAOMatchUndefined){
                            this.colPropertiesArray.push(null); 
                        }
                        this.refreshGrid();
                    }.bind(this));
                }
            }
          },
          
          {
            name: 'onRowSelect',
            isFramed: true,
            code: function(s){
                console.log('row Selected');
                var row = s.src;
                this.cellArray[row.rowIndex].forEach(function(c){
                    c.toggleRowHighlight();
                }.bind(this));
            }
          },
          
        {
            name: 'onColSelect',
            isFramed: true,
            code: function(s){
                console.log('col Selected');
                var col = s.src;
                this.cellArray.forEach(function(r){
                    r[col.colIndex].toggleColHighlight();
                }.bind(this));
            }
          },
          

          
          
          


    ],



});
