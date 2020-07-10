/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'ColumnConfigPropView',
  extends: 'foam.u2.Controller',
  requires: [
    'foam.u2.view.ColumnViewHeader',
    'foam.u2.view.ColumnViewBody',
    'foam.u2.view.RootColumnConfigPropView',

  ],
  css: `
    ^ {
      max-width: 200px;
    }
    ^search {
      margin: 5px;
      margin-bottom: 8px;
    }

    input[type="search"] {
      width: 290px;
    }
  `,
  properties: [
    'data',
    {
      name: 'columns',
      expression: function(data) {
        var arr = [];
        var notSelectedColumns = [];
        //selectedColumnNames misleading name cause it may contain objects
        data.selectedColumnNames = data.selectedColumnNames.map(c => 
          {
            var name = foam.Array.isInstance(c) ? c[0] : c;
            name = foam.String.isInstance(c) ? c : c;
            return name; 
          });
        var tableColumns = this.data.columns;
        tableColumns = tableColumns.map(c => Array.isArray(c) ? c[0] : c).filter( c => foam.String.isInstance(c) ? data.allColumns.includes(c) : data.allColumns.includes(c.name) );
        //to keep record of columns that are selected
        var topLevelProps = [];
        //to remove properties that are FObjectProperty or Reference and are not nested
        //or some kind of outputter might be used to convert property to number of nested properties eg 'address' to [ 'address.city', 'address.region', ... ]
        var columnThatShouldBeDeleted = [];

        for ( var i = 0 ; i < data.selectedColumnNames.length ; i++ ) {
          var rootProperty;
          if ( foam.String.isInstance(data.selectedColumnNames[i]) ) {
            var axiom;
            if ( data.selectedColumnNames[i].includes('.') )
              axiom = data.of.getAxiomByName(data.selectedColumnNames[i].split('.')[0]);
            else {
              axiom = tableColumns.find(c => c.name === data.selectedColumnNames[i]);
              if ( ! axiom )
                axiom = data.of.getAxiomByName(data.selectedColumnNames[i]);
              if ( foam.core.FObjectProperty.isInstance(axiom) || foam.core.Reference.isInstance(axiom) ) {
                columnThatShouldBeDeleted.push(data.selectedColumnNames[i]);
                continue;
              }
            }
            if ( ! axiom || axiom.networkTransient ) {
              continue;
            }
            rootProperty = [ axiom.name, axiom.label ? axiom.label : axiom.name ];
          } else 
            rootProperty = data.selectedColumnNames[i];

          if ( ! topLevelProps.includes(foam.Array.isInstance(rootProperty) ? rootProperty[0] : rootProperty.name) ) {
            arr.push(foam.u2.view.SubColumnSelectConfig.create({ 
              index:i, 
              rootProperty:rootProperty, 
              level:0, 
              of:data.of, 
              selectedColumns$:data.selectedColumnNames$, 
            }));
            topLevelProps.push(foam.Array.isInstance(rootProperty) ? rootProperty[0] : rootProperty.name);
          }
        }

        for ( var colToDelete of columnThatShouldBeDeleted) {
          data.selectedColumnNames.splice(data.selectedColumnNames.indexOf(colToDelete), 1);
        }
        
        var notSelectedColumns = data.allColumns.filter(c => {
          return ! topLevelProps.includes(c);
        });
        //to add properties that are specified in 'tableColumns' as an option
        tableColumns = tableColumns.filter(c => ! topLevelProps.includes(foam.String.isInstance(c) ? c : c.name));
        for ( var i = 0 ; i < tableColumns.length ; i++ ) {
          var indexOfTableColumn = notSelectedColumns.indexOf(foam.String.isInstance(tableColumns[i]) ? tableColumns[i] : tableColumns[i].name);
          if ( indexOfTableColumn === -1)
            notSelectedColumns.push(tableColumns[i]);
          else
            notSelectedColumns.splice(indexOfTableColumn, 1, tableColumns[i]);
        }
        var nonSelectedViewModels = [];
        for ( i = 0 ; i < notSelectedColumns.length ; i++ ) {
          var rootProperty;
          if ( foam.String.isInstance(notSelectedColumns[i]) ) {
            var axiom =  tableColumns.find(c => c.name === notSelectedColumns[i]);
            axiom = axiom || data.of.getAxiomByName(notSelectedColumns[i]);
            if ( axiom.networkTransient )
              continue;
            rootProperty = [ axiom.name, axiom.label ? axiom.label : axiom.name ];
          } else 
            rootProperty = notSelectedColumns[i];
          
          nonSelectedViewModels.push(foam.u2.view.SubColumnSelectConfig.create({ 
            index:data.selectedColumnNames.length + i, 
            rootProperty: rootProperty,
            level:0, 
            of:data.of, 
            selectedColumns$:data.selectedColumnNames$, 
          }));
        }
        nonSelectedViewModels.sort((a, b) => { 
          var aName = foam.Array.isInstance(a.rootProperty) ?  a.rootProperty[1] : a.rootProperty.label ? a.rootProperty.label : a.rootProperty.name;
          var bName = foam.Array.isInstance(b.rootProperty) ? b.rootProperty[1] : b.rootProperty.label ? b.rootProperty.label : b.rootProperty.name;
          return aName.toLowerCase().localeCompare(bName.toLowerCase());
        });
        arr = arr.concat(nonSelectedViewModels);
        return arr;
      }
    },
    {
      name: 'views',
      expression: function(columns) {
        var arr = [];
        for ( var i = 0 ; i < columns.length ; i++ ) {
          arr.push(this.RootColumnConfigPropView.create({
            index: i,
            prop:columns[i],
            onDragAndDropParentFunction:this.onTopLevelPropertiesDragAndDrop.bind(this),
            onSelectionChangedParentFunction: this.onTopPropertiesSelectionChange.bind(this),
            onDragAndDrop: this.onDragAndDrop.bind(this),//for parent to call on its views on child drag and drop
            onSelectionChanged: this.onSelectionChanged.bind(this),//for parent to call on its views on child selectionChanged
          }));
        }
        return arr;
      }
    },
    {
      name: 'updateSort',
      class: 'Boolean'
    },
    {
      class: 'String',
      name: 'menuSearch',
      view: {
        class: 'foam.u2.TextField',
        type: 'search',
        onKey: true,

      },
      value: '',
      postSet: function() {
        for ( var i = 0 ; i < this.columns.length ; i++ ) {
          this.columns[i].updateOnSearch(this.menuSearch);
        }
      }
    }
  ],
  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this
      .on('click', this.stopPropagation)
        .start()
          .start()
            .add(this.MENU_SEARCH)
            .addClass('foam-u2-search-TextSearchView')
            .addClass(this.myClass('search'))
          .end()
          .start()
          .add(this.slot(function(views) {
            var i = 0;
            return this.E()
              .style({'overflow': 'scroll', 'padding-bottom': '20px', 'max-height': window.innerHeight - 300 > 0 ? window.innerHeight - 300 : window.innerHeight + 'px'})
              .forEach(views, function(view) {
                view.prop.index = i;
                this
                  .start()
                  .add(view)
                  .end();
                i++;
              });
          }))
          .end()
      .end();
    },
    function stopPropagation(e) {
      e.stopPropagation();
    },
    function onClose() {
      this.menuSearch = '';
      this.columns.forEach(c => c.onClose());
    },
    function onTopLevelPropertiesDragAndDrop(targetIndex, draggableIndex) {
      this.onDragAndDrop(this.views, targetIndex, draggableIndex);
    },
    function onTopPropertiesSelectionChange(isColumnSelected, index, isColumnSelectionHaventChanged) {
      if ( ! isColumnSelectionHaventChanged )
        this.onSelectionChanged(isColumnSelected, index, this.views);
      this.data.selectedColumnNames = this.rebuildSelectedColumns();
      this.data.updateColumns();
    },
    function onDragAndDrop(views, targetIndex, draggableIndex) {
      this.resetProperties(views, targetIndex, draggableIndex);
      this.data.selectedColumnNames = this.rebuildSelectedColumns();
      this.data.updateColumns();
    },
    function resetProperties(views, targetIndex, draggableIndex) {
      var thisProps = views.map(v => v.prop);
      thisProps = [...thisProps];
      var replaceIndex;
      replaceIndex = targetIndex;
      if ( draggableIndex < targetIndex ) {
        
        for ( var i = draggableIndex ; i < targetIndex ; i++ ) {
          thisProps[i+1].index = i;
          views[i].prop = thisProps[i+1];
        }
      } else {
        for ( var i = targetIndex + 1 ; i <= draggableIndex ; i++ ) {
          thisProps[i-1].index = i;
          views[i].prop = thisProps[i-1];
        }
      }
      thisProps[draggableIndex].index = replaceIndex;
      views[replaceIndex].prop = thisProps[draggableIndex];
    },
    function rebuildSelectedColumns() {
      var arr = [];
      for ( var i = 0 ; i < this.views.length ; i++ ) {
        if ( this.views[i].prop.isPropertySelected ) {
          var propSelectedTraversed = this.views[i].prop.returnSelectedProps();
          for ( var j = 0 ; j < propSelectedTraversed.length ; j++ ) {
            if ( foam.Array.isInstance(propSelectedTraversed[j]) )
              arr.push(propSelectedTraversed[j].join('.'));
            else
              arr.push(propSelectedTraversed[j]);
          }
        }
      }
      return arr;
    },
    function onSelectionChanged(isColumnSelected, index, views) {
      if ( isColumnSelected ) {
        this.onSelect(index, views);
      } else if ( ! isColumnSelected ) {
        this.onUnSelect(index, views);
      }
    },

    function onSelect(draggableIndex, views) {
      var startUnselectedIndex = views.find(v => ! v.prop.isPropertySelected);
      if ( ! startUnselectedIndex )
        return;
      startUnselectedIndex =  startUnselectedIndex.index;
      
      if ( draggableIndex > startUnselectedIndex )
        return this.resetProperties(views, startUnselectedIndex, draggableIndex);
    },
    function onUnSelect(draggableIndex, views) {
      var startUnselectedIndex = views.find(v => ! v.prop.isPropertySelected && v.index !== draggableIndex);
      if ( ! startUnselectedIndex )
        return this.resetProperties(views, views.length - 1, draggableIndex);

      startUnselectedIndex =  startUnselectedIndex.index;
      if ( startUnselectedIndex - draggableIndex === 1 ) {
        var currentProp = foam.Array.isInstance(views[draggableIndex].prop.rootProperty) ? views[draggableIndex].prop.rootProperty[1] : views[draggableIndex].prop.rootProperty.name;
        var comparedToProp = foam.Array.isInstance(views[startUnselectedIndex].prop.rootProperty) ? views[startUnselectedIndex].prop.rootProperty[1] : views[startUnselectedIndex].prop.rootProperty.name;
        if ( views[draggableIndex].prop.rootProperty[1].toLowerCase().localeCompare(views[startUnselectedIndex].prop.rootProperty[1].toLowerCase()) < 1 )
          return this.resetProperties(views, startUnselectedIndex-1, draggableIndex);
      }
      
      while(startUnselectedIndex < views.length) {
        var currentProp = foam.Array.isInstance(views[draggableIndex].prop.rootProperty) ? views[draggableIndex].prop.rootProperty[1] : views[draggableIndex].prop.rootProperty.name;
        var comparedToProp = foam.Array.isInstance(views[startUnselectedIndex].prop.rootProperty) ? views[startUnselectedIndex].prop.rootProperty[1] : views[startUnselectedIndex].prop.rootProperty.name;
        if ( currentProp.toLowerCase().localeCompare(comparedToProp.toLowerCase()) < 0 ) {
          break;
        }
        startUnselectedIndex++;
      }
      return this.resetProperties(views, startUnselectedIndex-1, draggableIndex);
    }
  ]
});

foam.CLASS({
  package: 'foam.u2.view',
  name: 'RootColumnConfigPropView',
  extends: 'foam.u2.Controller',
  properties: [
    // {
    //   class: 'Boolean',
    //   name: 'draggable',
    //   documentation: 'Enable to allow drag&drop editing.'
    // },
    {
      class: 'foam.u2.ViewSpec',
      name: 'head',
      value: { class:'foam.u2.view.ColumnViewHeader'}
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'body',
      value: { class:'foam.u2.view.ColumnViewBody'}
    },
    {
      name: 'prop',
    },
    'index',
    {
      name: 'onDragAndDropParentFunction',
      documentation: 'parent\'s on this DragAndDrop function' 
    },
    {
      name: 'onSelectionChangedParentFunction',
      documentation: 'parent\'s on this onSelectionChanged function'
    },
    {
      name: 'onDragAndDrop',
      documentation: 'to reuse onDragAndDrop function'
    },
    {
      name: 'onSelectionChanged',
      documentation: 'to reuse onSelectionChanged function'
    },
  ],
  constants: [
    {
      name: 'DEFAULT_BG_COLOR',
      type: 'String',
      value: 'rgb(249, 249, 249)'
    },
    {
      name: 'ON_DRAG_OVER_BG_COLOR',
      type: 'String',
      value: '#e5f1fc'
    }
  ],
  methods: [
    function initE() {
      var self = this;
      this.SUPER();

      this
      
        .add(self.slot(function(prop) {
          return self.E()
          .attrs({ draggable: prop.isPropertySelected ? 'true' : 'false' })
          .callIf(prop.isPropertySelected, function() {
            this.on('dragstart',   self.onDragStart.bind(self)).
              on('dragenter',   self.onDragOver.bind(self)).
              on('dragover',    self.onDragOver.bind(self)).
              on('dragleave',   self.onDragLeave.bind(self)).
              on('drop',        self.onDrop.bind(self));
          })
          .style({'cursor': prop.isPropertySelected ? 'pointer' : 'default'})
          .show(self.prop.showOnSearch$)
          .start()
            .add(foam.u2.ViewSpec.createView(self.head, {data$:self.prop$, onSelectionChangedParentFunction:self.onSelectionChangedParentFunction},  self, self.__subSubContext__))
          .end()
          .start()
            .add(foam.u2.ViewSpec.createView(self.body, {data$:self.prop$, onSelectionChangedParentFunction: this.onSelectionChangedParentFunction, onDragAndDrop: this.onDragAndDrop, onSelectionChanged: this.onSelectionChanged },  self, self.__subSubContext__))
          .end();
        }));
    }
  ],
  listeners: [
    function onDragStart(e){
      e.dataTransfer.setData('draggableId', this.index);
      e.stopPropagation();
    },
    function onDragOver(e){
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.style.setProperty("background-color", this.ON_DRAG_OVER_BG_COLOR);
    },
    function onDragLeave(e){
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.style.setProperty("background-color", this.DEFAULT_BG_COLOR);
    },
    function onDrop(e) {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.style.setProperty("background-color", this.DEFAULT_BG_COLOR);
      this.onDragAndDropParentFunction(this.index, parseInt(e.dataTransfer.getData('draggableId')));
    }
  ]
});


foam.CLASS({
  package: 'foam.u2.view',
  name: 'ColumnViewHeader',
  extends: 'foam.u2.View',
  css: `
  
  ^selected {
    background: #cfdbff;
  }
  ^some-padding {
    text-align: left;
    padding: 3px;
  }
  `,
  constants: [
    {
      name: 'CHECK_MARK',
      type: 'String',
      value: '\u2713'
    }
  ],
  properties: [
    'onSelectionChangedParentFunction'
  ],
  methods: [
    function initE() {
      var self = this;
      this.SUPER();
      this
        .on('click', this.toggleExpanded)
        .start()
          .start()
            .addClass(this.myClass('some-padding'))
            .style({
              'padding-left' : self.data.level * 15 + 15 + 'px',
              'padding-right' : '15px'
            })
            .start('span')
              .show(this.data.isPropertySelected$)
              .add(this.CHECK_MARK)
            .end()
            .start('span')
              .style({'padding-left' : this.data.isPropertySelected$.map(function(s) { return s ? '4px' : '13px';})})
              .add(foam.Array.isInstance(this.data.rootProperty) ? this.data.rootProperty[1] : this.data.rootProperty.label)
            .end()
            .start('span')
              .show(this.data.hasSubProperties)
              .style({
                'vertical-align': 'middle',
                'font-weight':    'bold',
                'visibility':     'visible',
                'font-size':      '16px',
                'float':          'right',
                'transform':      this.data.expanded$.map(function(c) { return c ? 'rotate(180deg)' : 'rotate(90deg)'; })
              })
              .on('click', this.toggleExpanded)
              .add('\u2303')
            .end()
          .end()
        .end();
    }
  ],
  listeners: [
    function toggleExpanded(e) {
      e.stopPropagation();
      this.data.expanded = ! this.data.expanded;
      if ( ! this.data.hasSubProperties ) {
        this.data.isPropertySelected = ! this.data.isPropertySelected;
        this.onSelectionChangedParentFunction(this.data.isPropertySelected, this.data.index);
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.u2.view',
  name: 'ColumnViewBody',
  extends: 'foam.u2.View',
  requires: [
    'foam.u2.view.RootColumnConfigPropView',
    'foam.u2.view.SubColumnSelectConfig'
  ],
  properties: [
    {
      name: 'views',
      factory: function() {
        var arr = [];
        for ( var i = 0 ; i < this.data.subColumnSelectConfig.length ; i++ ) {
          arr.push(this.RootColumnConfigPropView.create({
            index: i,
            prop:this.data.subColumnSelectConfig[i],
            onDragAndDrop:this.onDragAndDrop,
            onSelectionChanged:this.onSelectionChanged,
            onSelectionChangedParentFunction:this.onChildrenSelectionChanged.bind(this),
            onDragAndDropParentFunction: this.onChildrenDragAndDrop.bind(this),
          }));
        }
        return arr;
      }
    },
    'onSelectionChangedParentFunction',
    {
      name: 'onDragAndDrop',
      documentation: 'to reuse onDragAndDrop function'
    },
    {
      name: 'onSelectionChanged',
      documentation: 'to reuse onSelectionChanged function'
    },
  ],
  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      this
        .start()
        .show(self.data.expanded$)
        .add(this.slot(function(views) {
          return this.E().forEach(this.views, function(v) {
            self
              .show(self.data.expanded$)
              .add(v);
        });
      }))
      .end();
    },
    function updateSubColumnsOrder(selctionChanged) {
      //re-order subproperties
      this.data.subColumnSelectConfig.sort((a, b) => a.index > b.index ? 1 : -1);
      this.onSelectionChangedParentFunction(this.data.isPropertySelected, this.data.index, selctionChanged);
    },
    function onChildrenDragAndDrop(targetIndex, draggableIndex) {
      this.onDragAndDrop(this.views, targetIndex, draggableIndex);
      this.updateSubColumnsOrder(true);
    },
    function onChildrenSelectionChanged(isColumnSelected, index, isColumnSelectionHaventChanged) {
      //isColumnSelectionHaventChanged to be false on either selectionChanged or being undefined
      if ( ! isColumnSelectionHaventChanged ) {
        //to change view 
        this.onSelectionChanged(isColumnSelected, index, this.views);
        //to set currentProperty isColumnSelected
        var hasPropertySelectionChanged = this.data.isPropertySelected;
        //to re-check if isPropertySelected changed
        if ( this.data.isPropertySelected !== isColumnSelected ) {
          var anySelected = this.data.subColumnSelectConfig.find(s => s.isPropertySelected);
          this.data.isPropertySelected = typeof anySelected !== 'undefined';
          //close if not selected
          if ( ! this.data.isPropertySelected )
            this.data.expanded = false;
        }
        this.updateSubColumnsOrder(hasPropertySelectionChanged === this.data.isPropertySelected);
      } else {
        this.updateSubColumnsOrder(true);
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.u2.view',
  name: 'SubColumnSelectConfig',
  extends: 'foam.u2.View',
  properties: [
    'index',
    'of',
    {
      name: 'hasSubProperties',
      class: 'Boolean',
      expression: function(subProperties) {
        if ( subProperties.length === 0 )
          return false;
        return true;
      }
    },
    {
      name: 'selectedColumns',
      documentation: 'array of names of selected proprties'
    },
    {
      name: 'subProperties',
      expression: function(rootProperty) {
        if ( ! this.of || ! this.of.getAxiomByName )
          return [];
        var r = this.of.getAxiomByName(foam.Array.isInstance(rootProperty) ? this.rootProperty[0] : rootProperty.name);
        if ( r && r.cls_ && ( foam.core.FObjectProperty.isInstance(r) || foam.core.Reference.isInstance(r) ) )
          return r.of.getAxiomsByClass(foam.core.Property).map(p => [p.name, p.label ? p.label : p.name]);
        return [];
      }
    },
    {
      name: 'subColumnSelectConfig',
      expression: function(subProperties, level) {
        if ( ! this.of || ! this.of.getAxiomByName || subProperties.length === 0 )
          return [];
        var arr = [];
        var l = level + 1;
        var r = this.of.getAxiomByName(this.rootProperty[0]);

        var selectedSubProperties = [];
        var otherSubProperties = [];

        var thisRootPropName = foam.Array.isInstance(this.rootProperty) ? this.rootProperty[0] : this.rootProperty.name;
        //find selectedColumn for the root property 
        var selectedColumn = this.selectedColumns.filter(c => {
          var thisSelectedColumn = foam.String.isInstance(c) ? c : c.name;
          return ( ! foam.String.isInstance(c) && this.level === 0 && thisSelectedColumn === thisRootPropName ) ||
          ( foam.String.isInstance(c) && c.split('.').length > this.level && c.split('.')[this.level] === this.rootProperty[0] );
        });

        for ( var i = 0 ; i < subProperties.length ; i++ ) {
          //the comparison mentioned above is working with the assumption that columns which are specified in 'tableColumns' are top-level properties and
          //we are not using nested "custom" table columns
          if ( selectedColumn.find(c => foam.String.isInstance(c) && c.split('.').length > ( this.level + 1 ) && c.split('.')[this.level+1] === subProperties[i][0]) ) {
            selectedSubProperties.push(subProperties[i]);
          } else {
            otherSubProperties.push(subProperties[i]);
          }
        }
        otherSubProperties.sort((a, b) => { return a[1].toLowerCase().localeCompare(b[1].toLowerCase());});

        for ( var i = 0 ; i < selectedSubProperties.length ; i++ ) {
          arr.push(this.cls_.create({ 
            index:i, 
            rootProperty: selectedSubProperties[i], 
            selectedColumns$:this.selectedColumns$, 
            level:l, parentExpanded$:this.expanded$, 
            of: r && r.of ? r.of.getAxiomByName([selectedSubProperties[i][0]]).cls_ : r}));
        }
        
        for ( var i = 0 ; i < otherSubProperties.length ; i++ ) {
          arr.push(this.cls_.create({ 
            index:selectedSubProperties.length+i, 
            rootProperty: otherSubProperties[i], 
            selectedColumns$:this.selectedColumns$, 
            level:l, parentExpanded$:this.expanded$, 
            of: r && r.of ? r.of.getAxiomByName([otherSubProperties[i][0]]).cls_ : r, 
            isPropertySelected:false}));
        }

        return arr;
      }
    },
    {
      name: 'rootProperty'
    },
    {
      name: 'isPropertySelected',
      class: 'Boolean',
      expression: function() {
        var thisPropName = foam.Array.isInstance(this.rootProperty) ? this.rootProperty[0] : this.rootProperty.name;
        return typeof this.selectedColumns.find(s => {
          var propName = foam.String.isInstance(s) ? s.split('.') : s.name;
          return foam.Array.isInstance(propName) ? ( this.level < propName.length && propName[this.level] === thisPropName ) : thisPropName === propName;
        }) !== 'undefined';
      }
    },
    {
      name: 'level',
      class: 'Int',
    },
    {
      name: 'parentExpanded',
      class: 'Boolean',
      value: false,
      postSet: function() {
        if ( ! this.parentExpanded )
          this.expanded = false;
      }
    },
    {
      name: 'expanded',
      class: 'Boolean',
      value: false
    },
    {
      name: 'showOnSearch',
      class: 'Boolean',
      value: true
    }
  ],
  methods: [
    function onClose() {
      this.subColumnSelectConfig.forEach(c => c.onClose());
      this.expanded = false;
    },
    function returnSelectedProps() {
      if ( ! this.hasSubProperties ) {
        if ( this.level === 0 ) {
          if ( foam.Array.isInstance(this.rootProperty) )
            return [[this.rootProperty[0]]];
          else
            return [this.rootProperty];
        } else 
          return [this.rootProperty[0]];
      } else {
        var arr = [];
        for ( var i = 0 ; i < this.subColumnSelectConfig.length ; i++ ) {
          if ( this.subColumnSelectConfig[i].isPropertySelected ) {
            var childProps = this.subColumnSelectConfig[i].returnSelectedProps();
            childProps.splice(0, 0, this.rootProperty[0]);
            arr.push(childProps);
          }
        }
        return arr;
      }
    },
    function updateOnSearch(query) {
      if ( ! this.hasSubProperties ) {
        if ( query.length !== 0 ) {
          this.showOnSearch = foam.Array.isInstance(this.rootProperty) ? this.rootProperty[1].toLowerCase().includes(query.toLowerCase()) : this.rootProperty.name.toLowerCase().includes(query.toLowerCase());
        } else
          this.showOnSearch = true;
      } else {
        this.showOnSearch = false;
        for ( var  i = 0 ; i < this.subColumnSelectConfig.length ; i++ ) {
          if ( this.subColumnSelectConfig[i].updateOnSearch(query) ) {
            this.showOnSearch = true;
          }
        }
      }
      if ( query.length !== 0 && this.showOnSearch )
        this.expanded = true;
      if ( query.length === 0 )
        this.expanded = false;
      return this.showOnSearch;
    }
  ]
});