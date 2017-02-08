foam.CLASS
({
    package: 'foam.u2.grid',
    name: 'NewGridView',
    extends: 'foam.u2.Element',

    implements: [
    ],

    requires:
    [
        'foam.u2.Element', 
        'foam.u2.grid.GridCell',
        'foam.u2.grid.GridHeaderCell', 
    ],

    exports: [
        //single selection of cell, row, or column.
        //if a cell is selected, double click of the cell will
        //highlight the row and column the cell is in. 
        'selection',
        'selectedRowproperty',
        'seletedColumnProperty', 
        
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
            //TODO: to change from matching Id to any other property of your choice. 
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
        'selection',
        'selectedRowproperty',
        'seletedColumnProperty', 
        
        /*
         *---------------------------------- Cell and Cell wrapper ------------------------------
         */
        {
            class: 'Class',
            documentation: 'rendering of each entry of the cell. ', 
            name: 'cellView', 
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

    ],

    methods:
    [
        function initE() {
            this.refreshGrid(); 
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
                            rowIndex : i, 
                            });
                        rowHeaderCell.sub('selected', this.onRowSelect);
                        r.add(rowHeaderCell);
                    }else if (i==-1){ //header column
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
                    //this.rowArray.push([key, r]); 
                }
                if (i!=-1){
                    this.cellArray.push(currCellRow); 
                }
            }
            this.body = b; 

        },
        
        // need to be removed/absorbed
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
