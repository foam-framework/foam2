/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.u2.view',
  name: 'ColumnsConfigView',
  extends: 'foam.u2.View',

  documentation: 'A view for configuring table columns.',

  requires: [
    'foam.u2.view.ColumnConfigPropView',
    'foam.u2.view.ColumnOptionsSelectConfig',
  ],

  properties: [
    'of',
    'allColumns',
    'selectedColumns',
    {
      name: 'allProperties',
      expression: function(allColumns, of) {
        var props = [];
        allColumns.map(axiomName => {//what is overridesMap??? can't find
          props.push(this.of.getAxiomByName(axiomName[0]));
          });
        
        return props;
      }
    },
    'isColumnChanged',
    {
      name: 'columns',
      value: []
    }
  ],

  css: `
    ^ {
      padding: 8px 0;
      //display: grid;
      grid-template-columns: 1fr 1fr;
    }
    ^ > * {
      align-self: center;
    }
  `,

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      for (var i = 0; i < this.data.selectedColumnNames.length; i++) {
        self.columns.push(self.ColumnOptionsSelectConfig.create({selectedColumns: self.data.selectedColumnNames[i][0], of:self.data.of}));
      }

      // for (var v of self.columns) {
      //   const v1 = v;
      //   v1.config.isPropertySelected$.sub(function() {
      //     self.isColumnChanged = true;
      //     self.selectedColumnNames[v1.i] = v1.config.selectedColumns;
      //   });
      // }

      this
        .addClass(this.myClass())
        .forEach(this.columns, function(c) {
          self.add(foam.u2.ViewSpec.createView(self.ColumnConfigPropView, {data:c},  this, this.__subSubContext__));
        });
        //.add(this.ColumnSelect.create({currentProperty$: this.data.axiom$, props: this.data.of.getAxiomsByClass(foam.core.Property), headerProp: this.data.axiom.name}));
        // .start('span').call(this.data.axiom.\tableHeaderFormatter, [this.data.axiom]).end()
        // .tag(this.data.VISIBILITY);
    }
  ]
});

foam.CLASS({
  package: 'foam.u2.view',
  name: 'ColumnConfigView',
  extends: 'foam.u2.View',

  documentation: 'A view for configuring table columns.',

  requires: [
    'foam.u2.view.ColumnConfigPropView',
    'foam.u2.view.ColumnOptionsSelectConfig',
  ],

  css: `
    ^ {
      padding: 8px 0;
      // display: grid;
      grid-template-columns: 1fr 1fr;
    }
    ^ > * {
      align-self: center;
    }
  `,

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      var viewConfig = self.ColumnOptionsSelectConfig.create({selectedColumns: self.data$selectedColumns[i], of$:self.data.of$});

      this
        .addClass(this.myClass())
        .forEach(this.data.selectedColumns, function(s) {
          self
            .add(foam.u2.ViewSpec.createView(self.ColumnConfigPropView, {data:viewConfig},  this, this.__subSubContext__));
        });
    }
  ]
});

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
    ^move-right {
      margin-left: 15px;
    }
  `,
  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this.start()//.addClass(self.data.myClass('container-handle'))
        .start()
            .add(foam.u2.ViewSpec.createView(this.ColumnViewHeader, {data$:this.data.rootProperty$},  this, this.__subSubContext__))
          .end()
          .start()
            .show(self.data.rootProperty.expanded$)
            .forEach(self.data.columnOptions, function(o) {
              self
                .start()
                .show(self.data.rootProperty.expanded$)
                .addClass(self.myClass('move-right'))
                  .add(foam.u2.ViewSpec.createView(self.RootColumnConfigPropView, {data:o},  self, self.__subSubContext__))
                .end();
            })
            //.add(foam.u2.ViewSpec.createView(this.ColumnViewBody, {data$:this.data.rootProperty$},  this, this.__subSubContext__))
          .end()
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
      .start()//.addClass(self.data.myClass('container-handle'))
          .add(foam.u2.ViewSpec.createView(this.head, {data$:this.data$},  this, this.__subSubContext__))
        .end()
        .start()
          .add(foam.u2.ViewSpec.createView(self.body, {data$:self.data$},  this, this.__subSubContext__))
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
      expression: function(of) {
       var p = of.getAxiomByName(this.selectedColumns[this.selectedColumns.length - 1]);
       return this.SubColumnSelectConfig.create({ rootProperty: p, hasOtherOptions:true, selectedColumns$:this.selectedColumns$, level:0 });
      }
    },
    {
      name: 'columnOptions',
      class: 'FObjectArray',
      of: 'foam.u2.view.SubColumnSelectConfig',
      factory: function() {
        var props = this.of.getAxiomsByClass(foam.core.Property);
        var propViews = [];
        props = props.filter(p => p.name !== this.selectedColumns[this.selectedColumns.length - 1]);
        for ( var i = 0; i < props.length; i++) {
          propViews.push(this.SubColumnSelectConfig.create({ rootProperty: props[i], hasOtherOptions:false, selectedColumns$:this.selectedColumns$, level:0, expanded$:this.rootProperty.expanded$ }));
        }
        return propViews;
       }
    }
  ]
});

foam.CLASS({
  package: 'foam.u2.view',
  name: 'ColumnViewHeader',
  extends: 'foam.u2.View',
  css: `
  
  ^selected {
    background: lightblue;
  }
  `,

  methods: [
    function initE() {
      this.SUPER();
      this.start()
        .enableClass(this.myClass('selected'), this.data.selectedColumns[this.data.selectedColumns.length - 1 - this.data.level] == this.data.rootProperty.name)
        .on('click', this.toggleExpanded)
        //.addClass(self.myClass('handle-title'))
        .start()
          .add(this.data.rootProperty.name)
          .start('span')
            .show(this.data.hasOtherOptions || this.data.hasSubProperties)
            .style({
              'margin-right':   '36px',
              'vertical-align': 'middle',
              'font-weight':    'bold',
              // 'display':        'inline-block',
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
      if ( !this.data.expanded ) {
        if ( this.data.level > this.data.selectedColumns.length - 1 ) {
          this.data.selectedColumns.push(this.data.rootProperty.name);
        } else {
          if ( this.data.selectedColumns[this.data.selectedColumns.length - 1 - this.data.level] !== this.data.rootProperty.name )
            this.data.selectedColumns[this.data.selectedColumns.length - 1 - this.data.level] = this.data.rootProperty.name;
            this.data.isPropertySelected = !this.data.isPropertySelected;

          //if level higher then previous one 
          if ( !this.data.hasSubProperties && this.data.level !== this.data.selectedColumns.length - 1 ) {
            this.data.selectedColumns.splice(0, this.data.selectedColumns.length - 1 - this.data.level);
          }
        }
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.u2.view',
  name: 'ColumnViewBody',
  extends: 'foam.u2.View',
  requires: [
    // 'foam.u2.view.RootColumnConfigPropView',
    // 'foam.u2.view.SubColumnSelectConfig'
  ],
  css: `
  ^move-right {
    margin-left: 20px;
  }
  `,
  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      self.data.rootProperty.expanded$.sub(function() {
        console.log(self.data.rootProperty.expanded);
      });

      this
        .start()
          .show(self.data.rootProperty.expanded$)
            .forEach(this.data.subColumnSelectConfig, function(p) {
            self
              .addClass(self.myClass('move-right'))
              .add(foam.u2.ViewSpec.createView(self.RootColumnConfigPropView, {data:self.SubColumnSelectConfig.create({ rootProperty: p, hasOtherOptions:false, selectedColumns:self.data.selectedColumns, expanded$:self.data.rootProperty.expanded$ })}, self, self.__subSubContext__));
          })
        .end();
    }
  ]
});

foam.CLASS({
  package: 'foam.u2.view',
  name: 'SubColumnSelectConfig',
  properties: [
    {
      name: 'hasSubProperties',
      class: 'Boolean',
      expression: function(rootProperty) {
        if ( rootProperty.cls_.name === 'FObjectProperty' )
          return true;
        return false;
      }
    },
    {
      name: 'selectedColumns',
      documentation: 'array of names of selected proprties'
    },
    {
      name: 'subProperties',
      expression: function(rootProperty) {
        if ( rootProperty.cls_.name === 'FObjectProperty' )
          return rootProperty.of.getAxiomsByClass(foam.core.Property);
        return [];
      }
    },
    {
      name: 'subColumnSelectConfig',
      expression: function(subProperties, level) {
        var arr = [];
        for ( var i = 0; i < subProperties.length; i++ )
          arr.push(this.cls_.create({ rootProperty: subProperties[i], selectedColumns$:this.selectedColumns$, level:level++ }));
        return arr;
      }
    },
    {
      name: 'rootProperty'
    },
    {
      name: 'isPropertySelected',
      class: 'Boolean'//,
      // expression: function(rootProperty, selectedColumns, level) {
      //   if ( rootProperty.name === selectedColumns[selectedColumns.length - 1 - level]  )
      //     return true;
      //   return false;
      // }
    },
    {
      name: 'level',
      class: 'Int',
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
