/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'ColumnConfigPropView',
  extends: 'foam.u2.View',
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
  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this.start()
          .add(this.slot(function(data, data$isPropertySelected, data$columnOptions, data$rootProperty, data$rootProperty$expanded) {
            return this.E()
            .start()
              .addClass(self.myClass('header'))
              .add(foam.u2.ViewSpec.createView(self.ColumnViewHeader, {data$:self.data.rootProperty$},  self, self.__subSubContext__))
            .end()
            .start()
              .addClass(self.myClass('dropdown'))
              .start()
                .add(foam.u2.ViewSpec.createView(self.ColumnViewBody, {data$:self.data.rootProperty$},  self, self.__subSubContext__))
              .end()
              .forEach(self.data.columnOptions, function(o) {
                this
                  .start()
                    .show(self.data.rootProperty.expanded$)
                      .add(foam.u2.ViewSpec.createView(self.RootColumnConfigPropView, {data:o},  self, self.__subSubContext__))
                  .end();
              })
            .end();
          }))
        .end();
    }
  ]
});

foam.CLASS({
  package: 'foam.u2.view',
  name: 'RootColumnConfigPropView',
  extends: 'foam.u2.View',
  properties: [
    {
      class: 'foam.u2.ViewSpec',
      name: 'head',
      value: { class:'foam.u2.view.ColumnViewHeader'}
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'body',
      value: { class:'foam.u2.view.ColumnViewBody'}
    }
  ],
  methods: [
    function initE() {
      this.SUPER();
      this
      .start()
          .add(foam.u2.ViewSpec.createView(this.head, {data$:this.data$},  this, this.__subSubContext__))
        .end()
        .start()
          .add(foam.u2.ViewSpec.createView(this.body, {data$:this.data$},  this, this.__subSubContext__))
        .end();
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
      of: 'foam.u2.view.SubColumnSelectConfig',
      expression: function(of, selectedColumns, isPropertySelected) {
        return this.updateRootProperty();
      }
    },
    {
      name: 'columnOptions',
      class: 'FObjectArray',
      of: 'foam.u2.view.SubColumnSelectConfig',
      factory: function() {
        return this.updateOptionsProperty();
      }
    },
    {
      name: 'columnsAvailable',
      class: 'StringArray',
    },
    {
      name: 'isPropertySelected',
      class: 'Boolean',
      value: true,
      postSet: function() {
        if ( this.isPropertySelected) {
          this.rootProperty = this.updateRootProperty();
          this.columnOptions = this.updateOptionsProperty();
          this.rootProperty.parentExpanded = false;
          this.rootProperty.expanded = false;
          this.isPropertySelected = false;
        }
      }
    },
    'labels'
  ],
  methods: [
    function updateRootProperty() {
      var p = this.labels.find(c => c[0] === this.selectedColumns[0]);
      if ( !p )
        p = this.labels[0];
      return this.SubColumnSelectConfig.create({ rootProperty: p, hasOtherOptions:true, selectedColumns$:this.selectedColumns$, level:0, isPathSelected$:this.isPropertySelected$, of:this.of });
    },
    function updateOptionsProperty() {
      var propViews = [];
      var props = this.labels.filter(p => p[0] !== this.selectedColumns[0]);
      for ( var i = 0; i < props.length; i++) {
        propViews.push(this.SubColumnSelectConfig.create({ rootProperty: props[i], hasOtherOptions:false, selectedColumns$:this.selectedColumns$, level:0, isPathSelected$:this.isPropertySelected$, of:this.of }));
      }
      this.isPropertySelected = false;
      return propViews;
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
    padding: 3px;
  }
  `,

  methods: [
    function initE() {
      this.SUPER();
      this
        .on('click', this.toggleExpanded)
        .start()
        .enableClass(this.myClass('selected'), this.data.level < this.data.selectedColumns.length && this.data.selectedColumns[this.data.level] === this.data.rootProperty[0])
        .start()
          .addClass(this.myClass('some-padding'))
          .style({
            'padding-left' : this.data.level * 15 + ( ( this.data.level === 0 && this.data.selectedColumns.length > 0 && this.data.selectedColumns[this.data.level] !== this.data.rootProperty[0]) ? 5 : 0 ) + 'px'
          })
          .start('span')
            .add(this.data.rootProperty[1])
          .end()
          .start('span')
            .show(this.data.hasOtherOptions || this.data.hasSubProperties)
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
      this.data.expanded = !this.data.expanded;
      if ( ( !this.data.expanded && this.data.hasOtherOptions ) || ( !this.data.hasSubProperties && !this.data.hasOtherOptions ) ) {
        this.data.isPropertySelected = true;
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
            .forEach(this.data.subColumnSelectConfig, function(p) {
            self
              .show(self.data.expanded$)
              .add(foam.u2.ViewSpec.createView(self.RootColumnConfigPropView, {data:p}, self, self.__subSubContext__));
          })
        .end();
    }
  ]
});

foam.CLASS({
  package: 'foam.u2.view',
  name: 'SubColumnSelectConfig',
  properties: [
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
        if ( !this.of )
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
        if ( !this.of )
          return [];
        var arr = [];
        var l = level + 1;
        var r = this.of.getAxiomByName(this.rootProperty[0]);
        for ( var i = 0; i < subProperties.length; i++ )
          arr.push(this.cls_.create({ rootProperty: subProperties[i], selectedColumns$:this.selectedColumns$, level:l, isPathSelected$:this.isPropertySelected$, parentExpanded$:this.expanded$, of:r.of.getAxiomByName([subProperties[i][0]]).cls_ }));
        return arr;
      }
    },
    {
      name: 'rootProperty'
    },
    {
      name: 'isPropertySelected',
      class: 'Boolean',
      postSet: function() {
        if ( this.isPropertySelected ) {
          while ( this.level > this.selectedColumns.length - 1 ) {
            this.selectedColumns.push(undefined);
          } 
          if ( this.selectedColumns[this.level] !== this.rootProperty[0])
            this.selectedColumns[this.level] = this.rootProperty[0];
  
          if ( !this.hasSubProperties && this.level !== this.selectedColumns.length - 1 ) {
            this.selectedColumns.splice(this.level, this.selectedColumns.length - 1 - this.level);
          }
          this.isPathSelected = true;
        }
      }
    },
    {
      name: 'isPathSelected',
      class: 'Boolean',
      value: false
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
    {
      name: 'hasOtherOptions',
      class: 'Boolean',
      value: false
    }
  ]
});