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
          arr.push(foam.u2.view.SubColumnSelectConfig.create({ index:i, rootProperty: [data.of.getAxiomByName(selectedColumns[i]).name, data.of.getAxiomByName(selectedColumns[i]).label ? data.of.getAxiomByName(selectedColumns[i]).label : data.of.getAxiomByName(selectedColumns[i]).name], level:0, of:data.of, selectedColumns:data.selectedColumnNames, updateParent:this.onSelectionChanged.bind(this) }));
        }
        var nonSelectedViewModels = [];
        for(i = 0; i < notSelectedColumns.length; i++) {
          nonSelectedViewModels.push(foam.u2.view.SubColumnSelectConfig.create({ index:i+selectedColumns.length, rootProperty: [data.of.getAxiomByName(notSelectedColumns[i]).name, data.of.getAxiomByName(notSelectedColumns[i]).label ? data.of.getAxiomByName(notSelectedColumns[i]).label : data.of.getAxiomByName(notSelectedColumns[i]).name], level:0, of:data.of, selectedColumns:data.selectedColumnNames, updateParent:this.onSelectionChanged.bind(this) }));
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
          arr.push(this.RootColumnConfigPropView.create({index: i, prop:columns[i], onDragAndDrop:this.onDragAndDrop.bind(this)}));
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
    function onDragAndDrop(targetIndex, draggableIndex) {
      this.resetProperties(targetIndex, draggableIndex);
      this.data.updateColumns();
    },
    function resetProperties(targetIndex, draggableIndex) {
      var thisProps = this.views.map(v => v.prop);
      thisProps = [...thisProps];
      var prop;
      var replaceIndex;
      prop = this.views[draggableIndex].prop;
      replaceIndex = targetIndex;
      if (targetIndex > draggableIndex) {
        for (var i = draggableIndex; i < targetIndex; i++) {
          this.views[i].prop = thisProps[i+1];
          this.views[i].prop.index = i;
        }
      } else {
        for (var i = targetIndex+1; i <= draggableIndex; i++) {
          this.views[i].prop = thisProps[i-1];
          this.views[i].prop.index = i;
        }
      }
      this.views[replaceIndex].prop = prop;
      this.views[replaceIndex].prop.index = replaceIndex;
      this.data.selectedColumnNames = this.rebuildSelectedColumns();
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
    function onSelectionChanged(isColumnSelected, index, isParentPropertySelectionChanged) {
      if (isParentPropertySelectionChanged) {
        if ( isColumnSelected ) {
          this.onSelect(index);
        } else if ( !isColumnSelected ) {
          this.onUnSelect(index);
        }
      }
      this.data.updateColumns();
    },

    function onSelect(draggableIndex) {
      var startUnselectedIndex = this.views.find(v => !v.prop.isPropertySelected);
      if (!startUnselectedIndex)
        return;
      startUnselectedIndex =  startUnselectedIndex.index;
      
      if ( draggableIndex > startUnselectedIndex )
        return this.resetProperties(startUnselectedIndex, draggableIndex);
    },
    function onUnSelect(draggableIndex) {
      var startUnselectedIndex = this.views.find(v => !v.prop.isPropertySelected && v.index !== draggableIndex);
      if (!startUnselectedIndex)
        return this.resetProperties(this.views.length - 1, draggableIndex);

      startUnselectedIndex =  startUnselectedIndex.index;
      if ( startUnselectedIndex - draggableIndex === 1 ) {
        if ( this.views[draggableIndex].prop.rootProperty[1].toLowerCase().localeCompare(this.views[startUnselectedIndex].prop.rootProperty[1].toLowerCase()) < 1 )
          return this.resetProperties(startUnselectedIndex-1, draggableIndex);
      }
      
      while(startUnselectedIndex < this.views.length) {
        // if (startUnselectedIndex === this.views.length - 1)
        //   return this.resetProperties(this.views.length - 1, draggableIndex);
        
        if (this.views[draggableIndex].prop.rootProperty[1].toLowerCase().localeCompare(this.views[startUnselectedIndex].prop.rootProperty[1].toLowerCase()) < 0 ) {
          break;
        }
        startUnselectedIndex++;
      }
      return this.resetProperties(startUnselectedIndex-1, draggableIndex);
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
    'prop',
    'onDragAndDrop',
    'index'
  ],
  methods: [
    function initE() {
      var self = this;
      this.SUPER();
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
            .add(foam.u2.ViewSpec.createView(self.body, {data$:self.prop$},  self, self.__subSubContext__))
          .end();
        }));
    }
  ],
  listeners: [
    function onDragStart(e){
      console.log('dragstart');
      e.dataTransfer.setData('draggableId', this.index);
    },
    function onDragOver(e){
      console.log('dragover');
      e.preventDefault();
    },
    function onDrop(e) {
      e.preventDefault();
      e.stopPropagation();
      this.onDragAndDrop(this.index, parseInt(e.dataTransfer.getData('draggableId')));
      console.log(e.target.id);
    }
  ]
});


foam.CLASS({
  package: 'foam.u2.view',
  name: 'ColumnOptionsSelectConfig',
  requires: [
    'foam.u2.view.SubColumnSelectConfig'
  ],
  properties: [
    'selectedColumns',
    'of',
    {
      name: 'rootProperty',
      class: 'FObjectProperty',
      of: 'foam.u2.view.SubColumnSelectConfig'
    },
    {
      name: 'isPropertySelected',
      class: 'Boolean',
      value: true,
      postSet: function() {
        if ( this.isPropertySelected) {
          this.rootProperty = this.updateRootProperty();
          this.rootProperty.parentExpanded = false;
          this.rootProperty.expanded = false;
          this.isPropertySelected = false;
        }
      }
    },
    'labels'
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
    },],
  methods: [
    function initE() {
      this.SUPER();
      this
        .on('click', this.toggleExpanded)
        .start()
        // .enableClass(this.myClass('selected'), this.data.isPropertySelected)
        .start()
          .addClass(this.myClass('some-padding'))
          .add(this.slot(function(data$isPropertySelected) {
            this.style({
              'padding-left' : this.data.level * 15 + 5 + 'px'
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
  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      this
        .start()
        .show(self.data.expanded$)
            .forEach(this.data.subColumnSelectConfig, function(p) {
            self
              .show(self.data.expanded$)
              .add(foam.u2.ViewSpec.createView(self.RootColumnConfigPropView, {prop:p}, self, self.__subSubContext__));
          })
        .end();
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
        for ( var i = 0; i < subProperties.length; i++ ) {
          arr.push(this.cls_.create({ index:i, rootProperty: subProperties[i], selectedColumns$:this.selectedColumns$, level:l, parentExpanded$:this.expanded$, of: r && r.of ? r.of.getAxiomByName([subProperties[i][0]]).cls_ : r, updateParent:this.callOnSelect.bind(this)}));
          if (!this.isPropertySelected)
            arr[i].isPropertySelected = false;
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
    'updateParent'
  ],
  methods: [
    function callOnSelect(isSelected, propertyNameSoFar) {
      var isSelectionChanged = this.isPropertySelected;
      if ( !this.hasSubProperties )
        this.isPropertySelected = isSelected;
      else {
        this.isPropertySelected = typeof this.subColumnSelectConfig.find(s => s.isPropertySelected) !== 'undefined';
        this.expanded = false;
      }
      if ( this.level === 0 ) {
        if (isSelected)
          this.selectedColumns.push(propertyNameSoFar ? this.rootProperty[0] + '.' + propertyNameSoFar : this.rootProperty[0]);
        else
          this.selectedColumns.splice(this.selectedColumns.indexOf(propertyNameSoFar ? this.rootProperty[0] + '.' + propertyNameSoFar : this.rootProperty[0]), 1);
        
        this.updateParent(isSelected, this.index, isSelectionChanged !== this.isPropertySelected);
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