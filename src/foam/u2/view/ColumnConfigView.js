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

    ^header {
      border: 2px solid grey;
      border-radius: 5px;
      margin-bottom:5px;
    }

    ^dropdown {
      border-radius: 4px;
      position: absolute;
      background-color: #f9f9f9;
      margin-bottom: 20px;
      box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
      min-width: 1118px;
      z-index: 1;
    }
  `,
  properties: [
    'data',
    {
      name: 'columns',
      expression: function(data) {
        var arr = [];
        var selectedColumns = [];
        var notSelectedColumns = [];
        data.allColumns.forEach(c => {
          if ( data.selectedColumnNames.find(s => s.split('.')[0] === c) != null )
            selectedColumns.push(c);
          else
            notSelectedColumns.push(c);
        });
        for(var i = 0; i < selectedColumns.length; i++) {
          arr.push(foam.u2.view.SubColumnSelectConfig.create({ 
            index:i, 
            rootProperty: [data.of.getAxiomByName(selectedColumns[i]).name, 
            data.of.getAxiomByName(selectedColumns[i]).label ? data.of.getAxiomByName(selectedColumns[i]).label : data.of.getAxiomByName(selectedColumns[i]).name], 
            level:0, 
            of:data.of, 
            selectedColumns$:data.selectedColumnNames$, 
           // updateParent:this.onTopPropertiesSelectionChange.bind(this),
          }));
        }
        var nonSelectedViewModels = [];
        for(i = 0; i < notSelectedColumns.length; i++) {
          nonSelectedViewModels.push(foam.u2.view.SubColumnSelectConfig.create({ 
            index:i+selectedColumns.length, 
            rootProperty: [data.of.getAxiomByName(notSelectedColumns[i]).name, data.of.getAxiomByName(notSelectedColumns[i]).label ? data.of.getAxiomByName(notSelectedColumns[i]).label : data.of.getAxiomByName(notSelectedColumns[i]).name], 
            level:0, 
            of:data.of, 
            selectedColumns$:data.selectedColumnNames$, 
            //updateParent:this.onTopPropertiesSelectionChange.bind(this),
          }));
        }
        nonSelectedViewModels.sort((a, b) => { return a.rootProperty[1].toLowerCase().localeCompare(b.rootProperty[1].toLowerCase());});
        arr = arr.concat(nonSelectedViewModels);
        return arr;
      }
    },
    {
      name: 'views',
      expression: function(columns) {
        var arr = [];
        for(var i = 0; i < columns.length; i++) {
          arr.push(this.RootColumnConfigPropView.create({
            index: i,
            prop:columns[i],
            onDragAndDropParentFunction:this.onTopLevelPropertiesDragAndDrop.bind(this),
            onSelectionChangedParentFunction: this.onTopPropertiesSelectionChange.bind(this),
            onDragAndDrop: this.onDragAndDrop.bind(this),//for parent to call if on its  views on child drag and drop
            onSelectionChanged: this.onSelectionChanged.bind(this)//for parent to call if on its  views on child selectionChanged
          }));
        }
        return arr;
      }
    },
    {
      name: 'updateSort',
      class: 'Boolean'
    }
  ],
  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this
        .start()
         // .addClass(self.myClass('dropdown'))
         .add(this.slot(function(views) {
           var i = 0;
           return this.E()
            .forEach(views, function(view) {
              view.prop.index = i;
              this
                .start()
                 .add(view)
                .end();
              i++;
            });
         }))
      .end();
    },
    function onClose() {
      this.columns.forEach(c => c.onClose());
    },
    function onTopLevelPropertiesDragAndDrop(targetIndex, draggableIndex) {
      this.onDragAndDrop(this.views, targetIndex, draggableIndex);
    },
    function onDragAndDrop(views, targetIndex, draggableIndex, updateParent) {
      this.resetProperties(views, targetIndex, draggableIndex);
      if (updateParent)
        updateParent();
      this.data.selectedColumnNames = this.rebuildSelectedColumns();
      this.data.updateColumns();
    },
    function resetProperties(views, targetIndex, draggableIndex) {
      var thisProps = views.map(v => v.prop);
      thisProps = [...thisProps];
      var prop;
      var replaceIndex;
      prop = views[draggableIndex].prop;
      replaceIndex = targetIndex;
      if (targetIndex > draggableIndex) {
        for (var i = draggableIndex; i < targetIndex; i++) {
          thisProps[i+1].index = i;
          views[i].prop = thisProps[i+1];
        }
      } else {
        for (var i = targetIndex+1; i <= draggableIndex; i++) {
          thisProps[i-1].index = i;
          views[i].prop = thisProps[i-1];
        }
      }
      thisProps[draggableIndex].index = draggableIndex;
      views[replaceIndex].prop = thisProps[draggableIndex];
    },
    function rebuildSelectedColumns() {
      var arr = [];
      for (var i = 0; i < this.views.length; i++) {
        if (this.views[i].prop.isPropertySelected) {
          var propSelectedTraversed = this.views[i].prop.returnSelectedProps();
          for (var j = 0; j < propSelectedTraversed.length; j++) {
            arr.push(propSelectedTraversed[j].join('.'));
          }
        }
      }
      return arr;
    },

    function onTopPropertiesSelectionChange(isColumnSelected, index) {
      this.onSelectionChanged(isColumnSelected, index, this.views);
    },

    function onSelectionChanged(isColumnSelected, index, views, updateParent) {
      if ( isColumnSelected ) {
        this.onSelect(index, views);
      } else if ( !isColumnSelected ) {
        this.onUnSelect(index, views);
      }
      if ( updateParent )
        updateParent();
      this.data.updateColumns();
    },

    function onSelect(draggableIndex, views) {
      var startUnselectedIndex = views.find(v => !v.prop.isPropertySelected);
      if (!startUnselectedIndex)
        return;
      startUnselectedIndex =  startUnselectedIndex.index;
      
      if ( draggableIndex > startUnselectedIndex )
        return this.resetProperties(views, startUnselectedIndex, draggableIndex);
    },
    function onUnSelect(draggableIndex, views) {
      var startUnselectedIndex = views.find(v => !v.prop.isPropertySelected && v.index !== draggableIndex);
      if (!startUnselectedIndex)
        return this.resetProperties(views, views.length - 1, draggableIndex);

      startUnselectedIndex =  startUnselectedIndex.index;
      if ( startUnselectedIndex - draggableIndex === 1 ) {
        if ( views[draggableIndex].prop.rootProperty[1].toLowerCase().localeCompare(views[startUnselectedIndex].prop.rootProperty[1].toLowerCase()) < 1 )
          return this.resetProperties(views, startUnselectedIndex-1, draggableIndex);
      }
      
      while(startUnselectedIndex < views.length) {
        // if (startUnselectedIndex === this.views.length - 1)
        //   return this.resetProperties(this.views.length - 1, draggableIndex);
        
        if ( views[draggableIndex].prop.rootProperty[1].toLowerCase().localeCompare(views[startUnselectedIndex].prop.rootProperty[1].toLowerCase()) < 0 ) {
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
      postSet: function() {
        this.subscribeSelected();
      }
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
    }
  ],
  methods: [
    function updateParent() {
      this.prop.subColumnSelectConfig = this.prop.subColumnSelectConfig.sort((s1, s2) => s1.index > s2.index ? 1 : -1);
    },
    function subscribeSelected() {
      var self = this;
      this.prop.isPropertySelected$.sub(function() {
        self.onSelectionChangedParentFunction(self.prop.isPropertySelected, self.prop.index);
      });
    },
    function initE() {
      var self = this;
      this.SUPER();

      // this.prop$.sub(function() {
      //           //bug
        
      //   console.log('s');
      // });

      // this.prop.index$.sub(function() {
      //   console.log('s');
      // });

      this
        .add(this.slot(function(prop$isPropertySelected){
          this.callIf(self.prop.isPropertySelected, function() {
            this
              .attrs({ draggable: 'true' }).
                on('dragstart', self.onDragStart.bind(self)).
                on('dragenter', self.onDragOver.bind(self)).
                on('dragover',  self.onDragOver.bind(self)).
                on('drop',      self.onDrop.bind(self));
          });
        }))
        .add(self.slot(function(prop) {
          return self.E().start()
            .add(foam.u2.ViewSpec.createView(self.head, {data$:self.prop$},  self, self.__subSubContext__))
          .end()
          .start()
            .add(foam.u2.ViewSpec.createView(self.body, {data$:self.prop$, parentUpdateSubproperties: this.updateParent.bind(this), onDragAndDrop: this.onDragAndDrop, onSelectionChanged: this.onSelectionChanged },  self, self.__subSubContext__))
          .end();
        }));
    }
  ],
  listeners: [
    function onDragStart(e){
      console.log('dragstart');
      e.dataTransfer.setData('draggableId', this.index);
      e.stopPropagation();
    },
    function onDragOver(e){
      console.log('dragover');
      e.preventDefault();
    },
    function onDrop(e) {
      e.preventDefault();
      e.stopPropagation();
      this.onDragAndDropParentFunction(this.index, parseInt(e.dataTransfer.getData('draggableId')));
      console.log(e.target.id);
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
  methods: [
    function initE() {
      var self = this;
      this.SUPER();
      this
        .on('click', this.toggleExpanded)
        .start()
        // .enableClass(this.myClass('selected'), this.data.isPropertySelected)
        .start()
          .addClass(this.myClass('some-padding'))
          .add(this.slot(function(data$isPropertySelected) {
            this.style({
              'padding-left' : self.data.level * 15 + 5 + 'px'
            });
          }))
          .start('span')
            .show(this.data.isPropertySelected$)
            .add(this.CHECK_MARK)
          .end()
          .start('span')
            .style({'padding-left' : this.data.isPropertySelected$.map(function(s) { return s ? '4px' : '13px';})})
            .add(this.data.rootProperty[1])
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
      this.data.expanded = !this.data.expanded;
      if ( !this.data.hasSubProperties ) {//|| ( this.data.hasSubProperties && this.data.isPropertySelected )
        this.data.callOnSelect(!this.data.isPropertySelected);
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
        for(var i = 0; i < this.data.subColumnSelectConfig.length; i++) {
          arr.push(this.RootColumnConfigPropView.create({
            index: i,
            prop:this.data.subColumnSelectConfig[i],
            onDragAndDrop:this.onDragAndDrop,
            onSelectionChanged:this.onSelectionChanged,
            onSelectionChangedParentFunction:this.onChildrenSelectionChanged.bind(this),
            onDragAndDropParentFunction: this.onChildrenDragAndDrop.bind(this)
          }));
        }
        return arr;
      }
    },
    'parentUpdateSubproperties',
    {
      name: 'onDragAndDrop',
      documentation: 'to reuse onDragAndDrop function'
    },
    {
      name: 'onSelectionChanged',
      documentation: 'to reuse onSelectionChanged function'
    }
  ],
  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      this
        .start()
        .show(self.data.expanded$)
            .forEach(this.views, function(v) {
            self
              .show(self.data.expanded$)
              .add(v);
          })
        .end();
    },
    function onChildrenDragAndDrop(targetIndex, draggableIndex) {
      this.onDragAndDrop(this.views, targetIndex, draggableIndex, this.parentUpdateSubproperties);
    },
    function onChildrenSelectionChanged(isColumnSelected, index) {
      this.onSelectionChanged(isColumnSelected, index, this.views, this.parentUpdateSubproperties);
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
        if ( !this.of || !this.of.getAxiomByName)
          return [];
        var r = this.of.getAxiomByName(this.rootProperty[0]);
        if ( r && r.cls_ && r.cls_.name === 'FObjectProperty' )
          return r.of.getAxiomsByClass(foam.core.Property).map(p => [p.name, p.label ? p.label : p.name]);
        return [];
      }
    },
    {
      name: 'subColumnSelectConfig',
      expression: function(subProperties, level) {
        if ( !this.of || !this.of.getAxiomByName)
          return [];
        var arr = [];
        var l = level + 1;
        var r = this.of.getAxiomByName(this.rootProperty[0]);

        var selectedSubProperties = [];
        var otherSubProperties = [];

        var selectedColumn = this.selectedColumns.filter(c => c.split('.').length > this.level && c.split('.')[this.level] === this.rootProperty[0]);

        for ( var i = 0; i < subProperties.length; i++ ) {
          if ( selectedColumn.find(c => c.split('.').length > ( this.level + 1 ) && c.split('.')[this.level+1] === subProperties[i][0]) ) {
            selectedSubProperties.push(subProperties[i]);
          } else {
            otherSubProperties.push(subProperties[i]);
          }
        }
        otherSubProperties.sort((a, b) => { return a[1].toLowerCase().localeCompare(b[1].toLowerCase());});

        for ( var i = 0; i < selectedSubProperties.length; i++  ) {
          arr.push(this.cls_.create({ index:i, rootProperty: selectedSubProperties[i], selectedColumns$:this.selectedColumns$, level:l, parentExpanded$:this.expanded$, of: r && r.of ? r.of.getAxiomByName([selectedSubProperties[i][0]]).cls_ : r, updateParent:this.callOnSelect.bind(this)}));
        }
        
        for ( var i = 0; i < otherSubProperties.length; i++  ) {
          arr.push(this.cls_.create({ index:selectedSubProperties.length+i, rootProperty: otherSubProperties[i], selectedColumns$:this.selectedColumns$, level:l, parentExpanded$:this.expanded$, of: r && r.of ? r.of.getAxiomByName([otherSubProperties[i][0]]).cls_ : r, updateParent:this.callOnSelect.bind(this), isPropertySelected:false}));
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
        return typeof this.selectedColumns.find(s => {
          var propNames = s.split('.');
          return propNames.length > this.level && propNames[this.level] === this.rootProperty[0];
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
        if ( !this.parentExpanded )
          this.expanded = false;
      }
    },
    {
      name: 'expanded',
      class: 'Boolean',
      value: false
    },
    'updateParent',
    'childrenOnSelectionChangedDragAndDrop'
  ],
  methods: [
    function onClose() {
      this.subColumnSelectConfig.forEach(c => c.onClose());
      this.expanded = false;
    },
    function callOnSelect(isSelected, propertyNameSoFar) {
      var isSelectionChanged = this.isPropertySelected;
      if ( !this.hasSubProperties )
        this.isPropertySelected = isSelected;
      else {
        this.isPropertySelected = typeof this.subColumnSelectConfig.find(s => s.isPropertySelected) !== 'undefined';
        if ( !this.isPropertySelected )
          this.expanded = false;
      }
      if ( this.level === 0 ) {
        if (isSelected)
          this.selectedColumns.push(propertyNameSoFar ? this.rootProperty[0] + '.' + propertyNameSoFar : this.rootProperty[0]);
        else
          this.selectedColumns.splice(this.selectedColumns.indexOf(propertyNameSoFar ? this.rootProperty[0] + '.' + propertyNameSoFar : this.rootProperty[0]), 1);
        
        // this.updateParent(isSelected, this.index, isSelectionChanged !== this.isPropertySelected);
      }
      else {
        this.updateParent(isSelected, propertyNameSoFar ? this.rootProperty[0] + '.' + propertyNameSoFar : this.rootProperty[0]);
      }
    },
    function returnSelectedProps() {
      if ( !this.hasSubProperties) {
        if (this.level == 0)
          return [[this.rootProperty[0]]];
        return [this.rootProperty[0]];
      } else {
        var arr = [];
        for (var i = 0; i < this.subColumnSelectConfig.length; i++) {
          if (this.subColumnSelectConfig[i].isPropertySelected) {
            var childProps = this.subColumnSelectConfig[i].returnSelectedProps();
            childProps.splice(0, 0, this.rootProperty[0]);
            arr.push(childProps);
          }
        }
        return arr;
      }
    }
  ]
});