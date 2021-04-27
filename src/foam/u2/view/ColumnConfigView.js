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
      margin: 0px;
      padding: 0px 8px;
      padding-bottom: 16px;
    }
    ^ input[type='search']{
      width: 100%;
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
            return this.columnHandler.checkIfArrayAndReturnPropertyNamesForColumn(c);
          });
        var tableColumns = this.data.columns;
        tableColumns = tableColumns.filter( c => data.allColumns.includes(this.columnHandler.checkIfArrayAndReturnPropertyNamesForColumn(c))).map(c => this.columnHandler.checkIfArrayAndReturnPropertyNamesForColumn(c));
        //to keep record of columns that are selected
        var topLevelProps = [];
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
            }
            if ( ! axiom ) {
              continue;
            }
            rootProperty = [ axiom.name, this.columnHandler.returnAxiomHeader(axiom) ];
          } else
            rootProperty = data.selectedColumnNames[i];

          var rootPropertyName = this.columnHandler.checkIfArrayAndReturnPropertyNamesForColumn(rootProperty);
          if ( ! topLevelProps.includes(rootPropertyName) ) {
            arr.push(foam.u2.view.SubColumnSelectConfig.create({
              index:i,
              rootProperty:rootProperty,
              level:0,
              of:data.of,
              selectedColumns$:data.selectedColumnNames$,
            }, this));
            topLevelProps.push(rootPropertyName);
          }
        }

        for ( var colToDelete of columnThatShouldBeDeleted) {
          data.selectedColumnNames.splice(data.selectedColumnNames.indexOf(colToDelete), 1);
        }

        var notSelectedColumns = data.allColumns.filter(c => {
          return ! topLevelProps.includes(c);
        });
        //to add properties that are specified in 'tableColumns' as an option
        tableColumns = tableColumns.filter(c => ! topLevelProps.includes(c));
        for ( var i = 0 ; i < tableColumns.length ; i++ ) {
          var indexOfTableColumn = notSelectedColumns.indexOf(tableColumns[i]);
          if ( indexOfTableColumn === -1)
            notSelectedColumns.push(tableColumns[i]);
          else
            notSelectedColumns.splice(indexOfTableColumn, 1, tableColumns[i]);
        }
        var nonSelectedViewModels = [];
        for ( i = 0 ; i < notSelectedColumns.length ; i++ ) {
          var rootProperty;
          if ( this.columnHandler.canColumnBeTreatedAsAnAxiom(notSelectedColumns[i]) )
            rootProperty = notSelectedColumns[i];
          else {
            var axiom =  tableColumns.find(c => c.name === notSelectedColumns[i]);
            axiom = axiom || data.of.getAxiomByName(notSelectedColumns[i]);
            rootProperty = [ axiom.name, this.columnHandler.returnAxiomHeader(axiom) ];
          }

          nonSelectedViewModels.push(foam.u2.view.SubColumnSelectConfig.create({
            index:data.selectedColumnNames.length + i,
            rootProperty: rootProperty,
            level:0,
            of:data.of,
            selectedColumns$:data.selectedColumnNames$,
          }, this));
        }
        nonSelectedViewModels.sort((a, b) => {
          var aName = this.columnHandler.checkIfArrayAndReturnRootPropertyHeader(a.rootProperty);
          var bName = this.columnHandler.checkIfArrayAndReturnRootPropertyHeader(b.rootProperty);
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
    },
    {
      name: 'columnHandler',
      class: 'FObjectProperty',
      of: 'foam.nanos.column.CommonColumnHandler',
      factory: function() {
        return foam.nanos.column.CommonColumnHandler.create();
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
              .style({'overflow': 'auto', 'padding-bottom': '20px', 'max-height': window.innerHeight - 300 > 0 ? window.innerHeight - 300 : window.innerHeight + 'px'})
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
      if ( this.menuSearch )
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
        var currentProp = this.columnHandler.checkIfArrayAndReturnRootPropertyHeader(views[draggableIndex].prop.rootProperty);
        var comparedToProp =  this.columnHandler.checkIfArrayAndReturnRootPropertyHeader(views[startUnselectedIndex].prop.rootProperty);
        if ( currentProp.toLowerCase().localeCompare(comparedToProp.toLowerCase()) < 1 )
          return this.resetProperties(views, startUnselectedIndex-1, draggableIndex);
      }

      while ( startUnselectedIndex < views.length ) {
        var currentProp = this.columnHandler.checkIfArrayAndReturnRootPropertyHeader(views[draggableIndex].prop.rootProperty);
        var comparedToProp =  this.columnHandler.checkIfArrayAndReturnRootPropertyHeader(views[startUnselectedIndex].prop.rootProperty);
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
  imports: ['theme'],
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
          .attrs({ draggable: prop.isPropertySelected$ ? 'true' : 'false' })
          .callIf(prop.isPropertySelected$, function() {
            this.on('dragstart',   self.onDragStart.bind(self)).
              on('dragenter',   self.onDragOver.bind(self)).
              on('dragover',    self.onDragOver.bind(self)).
              on('dragleave',   self.onDragLeave.bind(self)).
              on('drop',        self.onDrop.bind(self));
          })
          .style({'cursor': prop.isPropertySelected$ ? 'pointer' : 'default'})
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
    function onDragStart(e) {
      e.dataTransfer.setData('draggableId', this.index);
      e.stopPropagation();
    },
    function onDragOver(e) {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.style.setProperty('background-color', this.theme ? this.theme.primary5 : this.ON_DRAG_OVER_BG_COLOR);
    },
    function onDragLeave(e) {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.style.setProperty( 'background-color', this.theme ? this.theme.white : '#ffffff' );
    },
    function onDrop(e) {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.style.setProperty('background-color', this.theme ? this.theme.white : '#ffffff');
      this.onDragAndDropParentFunction(this.index, parseInt(e.dataTransfer.getData('draggableId')));
    }
  ]
});


foam.CLASS({
  package: 'foam.u2.view',
  name: 'ColumnViewHeader',
  extends: 'foam.u2.View',

  requires: ['foam.u2.CheckBox'],
  css: `

  ^selected {
    background: #cfdbff;
  }
  ^some-padding {
    text-align: left;
    font-size: 14px;
    line-height: 24px;
    padding: 4px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  ^some-padding:hover {
    background-color: /*%PRIMARY5%*/ #E5F1FC;
    border-radius: 4px;
  }
  ^label {
    display: flex;
    align-items: center;
    justify-content: start;
  }
  `,
  properties: [
    'onSelectionChangedParentFunction',
    {
      name: 'columnHandler',
      class: 'FObjectProperty',
      of: 'foam.nanos.column.CommonColumnHandler',
      factory: function() {
        return foam.nanos.column.CommonColumnHandler.create();
      }
    }
  ],
  methods: [
    function initE() {
      var self = this;
      this.SUPER();
      this
        .on('click', this.toggleSelection)
          .start()
            .addClass(this.myClass('some-padding'))
            .style({
              'padding-left': self.data.level * 16 + 8 + 'px',
              'padding-right': '8px'
            })
            .start()
              .addClass(this.myClass('label'))
              .start()
                .add(this.CheckBox.create({ data$: this.data.isPropertySelected$ }))
                .on('click', this.toggleSelection)
              .end()
              .start()
                .style({'padding-left' : '12px'})
                .add(this.columnHandler.checkIfArrayAndReturnRootPropertyHeader(this.data.rootProperty))
              .end()
            .end()
            .start()
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
          .end();
    }
  ],
  listeners: [
    function toggleSelection(e) {
      e.stopPropagation();
      // this.data.expanded = ! this.data.expanded;
      if ( ! this.data.hasSubProperties || foam.core.Reference.isInstance(this.data.prop) ) {
        this.data.isPropertySelected = ! this.data.isPropertySelected;
        if ( ! this.data.isPropertySelected )
          this.data.expanded = false;
        this.onSelectionChangedParentFunction(this.data.isPropertySelected, this.data.index);
      }
    },
    function toggleExpanded(e) {
      e.stopPropagation();
      this.data.expanded = ! this.data.expanded;
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
      expression: function(data$subColumnSelectConfig) {
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
    function updateSubColumnsOrder(selectionChanged) {
      //re-order subproperties
      this.data.subColumnSelectConfig.sort((a, b) => a.index > b.index ? 1 : -1);
      this.onSelectionChangedParentFunction(this.data.isPropertySelected, this.data.index, selectionChanged);
    },
    function onChildrenDragAndDrop(targetIndex, draggableIndex) {
      this.onDragAndDrop(this.views, targetIndex, draggableIndex);
      this.updateSubColumnsOrder(true);
    },
    function onChildrenSelectionChanged(isColumnSelected, index, isColumnSelectionHaventChanged) {
      //isColumnSelectionHaventChanged to be false on either selectionChanged or being undefined
      if ( ! isColumnSelectionHaventChanged || foam.core.Reference.isInstance(this.data.prop) ) {
        //to change view
        this.onSelectionChanged(isColumnSelected, index, this.views);
        //to set currentProperty isColumnSelected
        var hasPropertySelectionChanged = this.data.isPropertySelected;
        //to re-check if isPropertySelected changed
        if ( this.data.isPropertySelected !== isColumnSelected ) {
          var anySelected = this.data.subColumnSelectConfig.find(s => s.isPropertySelected);
          if ( ! ( this.data.isPropertySelected && ! anySelected && foam.core.Reference.isInstance(this.data.prop) ) ) {
            this.data.isPropertySelected = typeof anySelected !== 'undefined';
            //close if not selected
            if ( ! this.data.isPropertySelected )
              this.data.expanded = false;
          }
        }
        this.updateSubColumnsOrder( hasPropertySelectionChanged === this.data.isPropertySelected );
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
      name: 'prop',
      expression: function(rootProperty) {
        return this.of.getAxiomByName(this.columnHandler.checkIfArrayAndReturnPropertyNameForRootProperty(rootProperty));
      }
    },
    {
      name: 'subProperties',
      expression: function(prop) {
        if ( ! this.of || ! this.of.getAxiomByName )
          return [];
        if ( prop && prop.cls_ && ( foam.core.FObjectProperty.isInstance(prop) || foam.core.Reference.isInstance(prop) ) )
          return prop.of.getAxiomsByClass(foam.core.Property).map(p => [p.name, this.columnHandler.returnAxiomHeader(p)]);
        return [];
      }
    },
    {
      name: 'subColumnSelectConfig',
      expression: function(subProperties, level, expanded) {
        return this.returnSubColumnSelectConfig(subProperties, level, expanded);
      }
    },
    {
      name: 'rootProperty'
    },
    {
      name: 'isPropertySelected',
      class: 'Boolean',
      expression: function() {
        var thisPropName = this.columnHandler.checkIfArrayAndReturnPropertyNameForRootProperty(this.rootProperty);
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
      value: false,
      postSet: function() {
        if ( this.subColumnSelectConfig.length == 0 ) 
          this.subColumnSelectConfig = this.returnSubColumnSelectConfig(this.subProperties, this.level, this.expanded);
      }
    },
    {
      name: 'showOnSearch',
      class: 'Boolean',
      value: true
    },
    {
      name: 'columnHandler',
      class: 'FObjectProperty',
      of: 'foam.nanos.column.CommonColumnHandler',
      factory: function() {
        return foam.nanos.column.CommonColumnHandler.create();
      }
    }
  ],
  methods: [
    function onClose() {
      this.subColumnSelectConfig.forEach(c => c.onClose());
      this.expanded = false;
    },
    function returnSelectedProps() {
      if ( this.hasSubProperties ) {
        var arr = [];
        for ( var i = 0 ; i < this.subColumnSelectConfig.length ; i++ ) {
          if ( this.subColumnSelectConfig[i].isPropertySelected ) {
            var childProps = this.subColumnSelectConfig[i].returnSelectedProps();
            childProps.splice(0, 0, this.rootProperty[0]);
            arr.push(childProps);
          }
        }
        if ( arr && arr.length > 0 )
          return arr;
      }
      if ( this.level === 0 ) {
        if ( foam.Array.isInstance(this.rootProperty) )
          return [[this.rootProperty[0]]];
        return [this.rootProperty];
      }
      return [this.rootProperty[0]];
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
    },
    function returnSubColumnSelectConfig(subProperties, level, expanded) {
      if ( ! this.of || ! this.of.getAxiomByName || subProperties.length === 0 || ! expanded )
          return [];
        var arr = [];
        var l = level + 1;
        var r = this.of.getAxiomByName(this.rootProperty[0]);

        var selectedSubProperties = [];
        var otherSubProperties = [];

        var thisRootPropName = this.columnHandler.checkIfArrayAndReturnPropertyNameForRootProperty(this.rootProperty);
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
            index: i,
            rootProperty: selectedSubProperties[i],
            selectedColumns$: this.selectedColumns$,
            level: l,
            parentExpanded$: this.expanded$,
            of: r.of
          }));
        }

        for ( var i = 0 ; i < otherSubProperties.length ; i++ ) {
          arr.push(this.cls_.create({
            index: selectedSubProperties.length+i,
            rootProperty: otherSubProperties[i],
            selectedColumns$: this.selectedColumns$,
            level:l, parentExpanded$: this.expanded$,
            of: r.of,
            isPropertySelected: false
          }, this));
        }

        return arr;
    }
  ]
});
