foam.CLASS
({
    package: 'foam.u2.grid',
    name: 'NewGridView',
    extends: 'foam.u2.Element',

    implements: [
    ],

    imports: [
    ],
    
    requires:
    [
        'foam.u2.Element', 
        'foam.u2.grid.GridCell',
        'foam.u2.grid.GridHeaderCell', 
    ],

    exports: [
        // the data entry being selected, not the cell. 
        'entrySelection',
        //the row and clumn properties the cell corresponds to
        'rowSelectionProperty',
        'colSelectionProperty',
        //for row and column seletion
        'rowHeaderSelectionProperty',
        'colHeaderSelectionProperty', 
        
    ],
    
    axioms: [
      foam.u2.CSS.create({
          code: function() {/*
            ^grid-table table {
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
        /*
         *----------------------------------- DAO and data source ----------------------------
         */
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
          name: 'of', 
        },

        /*
         *---------------------------------- Row and Column generation : parameters -----------------------
         */
        //group by row first, then columns.
        {
            //a PROPERTY object from foam2
            //e.g. myFieldworker.STATUS
            name: 'colProperty',
            documentation: 'foam.core.Property Object or string. ', 
        },
        {
            name: 'rowProperty',
            documentation: 'foam.core.Property Object or string. ', 
        },
        /*
        //implement later. order rows by some property, up or down.
        //can be expanded in to rowOrderProperties later. 
        //actually,
        {
            name: 'rowOrderProperty', 
        },
        */
        
        {
            //TODO: 
            name: 'makeRowPredicate',
            class: 'Function', 
        },
        
        {
            name: 'makeColPredicate',
            class: 'Function', 
        }, 

        {
            name: 'rowDAOMatchUndefined',
            documentation: 'allowing match for null or undefined. \n the alternative is to have a staging area.', 
            class: 'Boolean', 
            value: false, 
        }, 
        {
            name: 'colDAOMatchUndefined',
            class: 'Boolean', 
            value: false, 
        },
        /*
         *---------------------------------- Row and Column generation : data source -----------------------
         */
        {
            //used to generate colPropertiesArray
            name: 'colPropertiesDAO',
            postSet: function(old, nu){
                nu && nu.on && nu.on.sub(this.onColPropertiesDAOUpdate);
                this.onColPropertiesDAOUpdate();
                
            }
        },
        {
            name: 'rowPropertiesDAO',
            postSet: function(old, nu){
                nu.on.sub(this.onRowPropertiesDAOUpdate);
                this.onRowPropertiesDAOUpdate();
            }
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
        
        /*
         *----------------------------------- cell, row and column Selection -----------------
         */
        {
            name: 'entrySelection',
            postSet: function(old, nu){
                var oldName = old?old.name:old;
                var nuName = nu?nu.name:nu; 
                console.log("entrySelection changed from " + oldName + " to " + nuName); 
            }
        },
        {
            name: 'rowHeaderSelectionProperty',
            documentation: 'for row header selection', 
        }, 
        {
            name: 'colHeaderSelectionProperty',
            documentation: 'for column header selection',
        }, 
        {
            name: 'rowSelectionProperty',
            documentation: 'for normal cell selection', 
        },
        {
            name: 'colSelectionProperty', 
        }, 
        
        /*
         *---------------------------------- Cell and Cell wrapper ------------------------------
         */
        {
            class: 'Class',
            documentation: 'rendering of each entry of the cell. ', 
            name: 'cellView', 
        },
        {
            class: 'Class',
            documentation: 'wrapperDAO to load extra property objects for the data, if necessary. e.g., ReferenceDAO. ', 
            name: 'wrapperDAOClass', 
        }, 
        {
            name: 'cellWrapperClass',
            class: 'Class', 
        }, 
        
        /*
         *----------------------------------- Display Elements -----------------------------------
         */
        
        {
            name: 'body',
            factory: function(){this.Element.create().setNodeName('tbody');}, 
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
            name: 'visibleRowIds',
            documentation: 'toggles the visibility of Rows. ', 
            factory: function(){return []; },
            postSet: function(old, nu){
                console.log("visibleRowIds post set: " + old + " --> " + nu); 
                // if old and nu are both not arrays, show everything. 
                if (!foam.Array.isInstance(nu) && !foam.Array.isInstance(old)){
                    console.log("old and nu both not arrays"); 
                    return;
                }
                // if array of visibleRowIds are unchanged, do nothing. 
                if (foam.Array.isInstance(nu) && foam.Array.isInstance(old) && foam.Array.compare(nu, old) === 0){
                    console.log("old and nu are the same"); 
                    return;
                }
                if (foam.Array.isInstance(nu)){
                    if (! foam.Array.isInstance(this.rowArray)) return;
                    if (!nu.length){
                        this.rowArray.forEach(function(row){row[1].enableCls(this.myCls('hidden'), false);}.bind(this));
                    }else {
                        this.rowArray.forEach(function(row){
                            // upon the change of visibility
                            var key = row[0]?row[0]:""; 
                            if ((nu.indexOf(key) == -1) || (!old || old.indexOf(key) == -1 )){
                                console.log("changing visibility of " + key); 
                                row[1].enableCls(this.myCls('hidden'), (nu.indexOf(key)==-1)?true:false); 
                            }
                        }.bind(this));
                    }
                }
                
                
            }
        },
        
    ],

    methods:
    [
        function initE() {
            this.refreshGrid();
            this.start(this.STOP, {data:this}).end();
            this.cssClass(this.myCls('grid-table')).
            start('table').
                add(this.body$).
            end("table");

        },
        

        function refreshGrid(){
            var b  = this.Element.create().setNodeName('tbody');
            this.cellArray = []; //hopefully I won't need this anymore. 
            
            //rowPropertiesArray and colPropertiesArray should already by populated.
            //populating the table row by row. 
            for (var i=-1; i< this.rowPropertiesArray.length; i++){
                var r = foam.u2.Element.create(null, this).setNodeName('tr');
                var currCellRow = []; 
                for (var j=-1; j< this.colPropertiesArray.length; j++){
                    //corner of cell. 
                    if (i == -1 && j ==-1){
                    var cornerCell = this.GridHeaderCell.create({
                        name: '--'}
                        );
                        r.add(cornerCell);
                    }else if (j==-1){ //header row 
                        var rowHeaderCell = this.GridHeaderCell.create({
                            data: this.rowPropertiesArray[i],
                            property: this.rowProperty,
                            isRowHeader: true, 
                            }); 
                        rowHeaderCell.sub('selected', this.onRowSelect);
                        r.add(rowHeaderCell);
                    }else if (i==-1){ //header column
                        var colHeaderCell = this.GridHeaderCell.create({
                            data: this.colPropertiesArray[j],
                            property: this.colProperty,
                            isColHeader: true, 
                            });
                        colHeaderCell.sub('selected', this.onColSelect);
                        r.add(colHeaderCell);

                    }else {
                        var currCell = this.GridCell.create({
                                data$: this.data$,
                                cellView$: this.cellView$, 
                                rowMatch: this.rowPropertiesArray[i],
                                colMatch: this.colPropertiesArray[j],
                                rowProperty: this.rowProperty, 
                                colProperty: this.colProperty,
                                order: this.order,
                                wrapperClass: this.cellWrapperClass,
                                wrapperDAOClass: this.wrapperDAOClass, 
                            });
                        r.add(currCell);
                        currCellRow.push(currCell); 
                    }
                }
                //all cells added to the row. 
                b.add(r);

                if (i == -1) {
                    this.headerRow = r;
                } else {
                    var key;
                    if (! this.rowPropertiesArray[i]) key = "";
                    else {
                        key = (this.matchRowId || this.rowPropertiesArray[i].id)?this.rowPropertiesArray[i].id:this.rowPropertiesArray[i]; 
                    }
                    this.rowArray.push([key, r]); 
                }
                if (i!=-1){
                    this.cellArray.push(currCellRow); 
                }
            }
            this.body = b; 

        },
        
        function populateRowPropertiesArray()
        {
            if (this.rowPropertiesDAO){
                this.rowPropertiesDAO.select().then(function(result){
                    if (!result || ! result.a || !result.a.length){
                        console.log('no Row Property detected from DAO');
                        return;
                    }else {
                        var arr = [];
                        result.a.forEach(function(e){arr.push(e);});
                        this.rowPropertiesArray = arr; 
                    }
                    if (this.rowDAOMatchUndefined){
                        this.rowPropertiesArray.push(undefined); 
                    }
                    this.refreshGrid();
                }.bind(this));
            }
        },
        
        function populateColPropertiesArray(){
            if (this.colPropertiesDAO){
                this.colPropertiesDAO.select().then(function(result){
                    if (!result || ! result.a || !result.a.length){
                        console.log('no Column Property detected from DAO');
                        return;
                    }else {
                        var arr = [];
                        result.a.forEach(function(e){arr.push(e);});
                        this.colPropertiesArray = arr; 
                    }
                    if (this.colDAOMatchUndefined){
                        this.colPropertiesArray.push(undefined); 
                    }
                    this.refreshGrid();
                }.bind(this));
            }
        }
        
    ],
    
    actions:
    [

        {
            name: 'stop',
            code: function(){
                debugger;
            }
        },
        
    ], 

    listeners: [
        {
            name: 'onSortUpdate',
            isFramed: true,
            code: function(){

                this.refreshGrid();
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
          
          
        {
            name: 'onRowPropertiesDAOUpdate',
            isFramed: true,
            code: function(){
                if (this.rowPropertiesDAO)
                this.populateRowPropertiesArray(); 
            }
        },
        
        {
            name: 'onColPropertiesDAOUpdate',
            isFramed: true,
            code: function(){
                if (this.colPropertiesDAO)
                this.populateColPropertiesArray(); 
            }
        }, 
                    


    ],



});
