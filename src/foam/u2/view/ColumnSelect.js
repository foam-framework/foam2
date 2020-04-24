/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.tag',
  name: 'ColumnSelect',
  extends: 'foam.u2.View',
  requires:[
    'foam.u2.tag.ColumnView',
  ],
  css:`
  ^move-right {
    margin-left: 15px;
  }
  `,

  properties: [
    {
      name: 'hasSubProperties',
      class: 'Boolean',
      expression: function(currentProperty) {
        if ( currentProperty.cls_.name === 'FObjectProperty' )
          return true;
        return false;
      }
    },
    {
      name: 'subProperties',
      expression: function(currentProperty) {
        if ( currentProperty.cls_.name === 'FObjectProperty' )
          return currentProperty.of.getAxiomsByClass(foam.core.Property);
        return [];
      }
    },
    {
      name: 'props',
      value: []
    },
    {
      name: 'isPropertySelected',
      class: 'Boolean',
      value: false
    },
    'thisPropertyView',
    'views',
    {
      class: 'foam.u2.ViewSpec',
      name: 'columnView',
      factory: function() {
        return this.ColumnView;
      }
    },
    {
      name: 'open',
      class: 'Boolean',
      value: false
    },
    'selectedColumns',
    {
      name: 'level',
      class: 'Int',
      // value: 0//default??
    },
    {
      name: 'currentProperty',
      expression: function(props, selectedColumns, level) {
        if ( level > selectedColumns.length - 1 )
          return props[0];
        return props.find(p => p.name == selectedColumns[selectedColumns.length - 1 - level]);
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this.isPropertySelected$.sub(function() {
        if ( self.thisPropertyView.currentProperty.name !== self.selectedColumns[self.selectedColumns.length - 1] ) {
          self.views.push(self.thisPropertyView);
          for ( var i = 0; i < self.views.length - 1; i++) {
            if ( self.views[i].currentProperty.name === self.selectedColumns[self.selectedColumns.length - 1]) {
              self.currentProperty = self.views[i].currentProperty;
              self.thisPropertyView = self.views[i];
              self.views.splice(i, 1);
              break;
            }
          }
          self.isPropertySelected = false;
        }
      });
      this.views = [];
      var i = 0;
      if ( !this.currentProperty ) {
        this.currentProperty = this.props[0];
        this.thisPropertyView = foam.u2.ViewSpec.createView(self.ColumnView, {currentProperty: this.props[i], isThisPropertyPathSelected$: self.isPropertySelected$, selectedColumns$: self.selectedColumns$, level:0, hasOptions:true }, this, this.__subSubContext__);
        i = 1;
      }

      for ( ; i < this.props.length; i++ ) {
        if ( this.props[i].name === this.currentProperty.name  )
          this.thisPropertyView = foam.u2.ViewSpec.createView(self.ColumnView, { currentProperty: self.props[i], isThisPropertyPathSelected$: self.isPropertySelected$, selectedColumns$: self.selectedColumns$, level:0, hasOptions:true }, self, self.__subSubContext__);
        else
          self.views.push(foam.u2.ViewSpec.createView(self.ColumnView, {currentProperty: self.props[i], isThisPropertyPathSelected$: self.isPropertySelected$, selectedColumns$: self.selectedColumns$, level:0 }, self, self.__subSubContext__));
      }
      for ( i = 0; i < self.views.length; i++ ) {
        self.views[i].isThisPropertyPathSelected$.sub(function() {
          self.isPropertySelected = true;
        });
      }
      this
      .start()
        .start()//
          .start()//.addClass(self.myClass('container-handle'))
            .add(this.slot(function(thisPropertyView) {
              return self.E().tag(this.thisPropertyView.header);
            }))
          .end()
          .start()
            .add(this.slot(function(thisPropertyView) {
              return self.E().tag(this.thisPropertyView.body);
            }))
          .end()
          .start()
              .forEach(self.views, function(v) {
                self
                  .start()
                  .addClass(self.myClass('move-right'))
                  .show(self.thisPropertyView.expanded$)
                    .add(v)
                  .end();
              })
          .end()
        .end()
      .end();


      self.thisPropertyView.expanded$.sub(function() {
        console.log('expended changed');
      });
    }
  ]
});


foam.CLASS({
  package: 'foam.u2.tag',
  name: 'ColumnView',
  extends: 'foam.u2.View',
  requires: [
    'foam.u2.tag.ColumnViewHeader',
    'foam.u2.tag.ColumnViewBody'
  ],
  css:`
  ^margin-left {
    margin-left: 3px;
  }
  
  `,

  properties: [
    {
      name: 'hasSubProperties',
      class: 'Boolean',
      expression: function(subProperties) {
        if ( subProperties && subProperties.length !== 0 )
          return true;
        return false;
      }
    },
    {
      class: 'Int',
      name: 'level'
    },
    {
      name: 'selectedColumns',
      value: []
    },
    'currentProperty',
    {
      name: 'subProperties',
      expression: function(currentProperty) {
        if ( currentProperty.cls_.name === 'FObjectProperty' )
          return currentProperty.of.getAxiomsByClass(foam.core.Property);
        return [];
      }
    },
    {
      name: 'expanded',
      class: 'Boolean',
      value: false
    },
    {
      name: 'isThisPropSelected',
      class: 'Boolean',
      value: false
    },
    {
      name: 'isThisPropertyPathSelected',
      class: 'Boolean',
      value: false
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'body',
      //value: { class: 'foam.u2.tag.ColumnViewBody', hasSubProperties: this.hasSubProperties, isPropertySelected$:this.isPropertySelected$, expanded:this.expanded, currentProperty:this.currentProperty, isThisPropSelected:this.isThisPropSelected, selectedProp:this.selectedProp, open$:this.open$},
      factory: function() { return { class: 'foam.u2.tag.ColumnViewBody', hasSubProperties$:this.hasSubProperties$, currentProperty$:this.currentProperty$, expanded$:this.expanded$, subProperties:this.subProperties, isThisPropSelected$:this.isThisPropSelected$, isThisPropertyPathSelected$:this.isThisPropertyPathSelected$, level$:this.level$, selectedColumns$: this.selectedColumns$ }; }
    },
    {
      name: 'hasOptions',
      class: 'Boolean',
      value: false
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'header',
      //value: { class: 'foam.u2.tag.ColumnViewHeader', hasSubProperties: this.hasSubProperties, isPropertySelected$:this.isPropertySelected$, expanded:this.expanded, currentProperty:this.currentProperty, isThisPropSelected:this.isThisPropSelected, selectedProp:this.selectedProp, open$:this.open$},
      factory: function() { return { class: 'foam.u2.tag.ColumnViewHeader', hasSubProperties$: this.hasSubProperties$, expanded$:this.expanded$, currentProperty:this.currentProperty, isThisPropSelected$:this.isThisPropSelected$, selectedColumns$: this.selectedColumns$, level:this.level, hasOptions:this.hasOptions$ }; }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      self.isThisPropSelected$.sub(function() {
        self.isThisPropertyPathSelected = !self.isThisPropertyPathSelected;
      });

      this
        .start()
          //.addClass(this.myClass('container-handle'))
          .start()
            .tag(this.header)
          .end()
          .start()
            .tag(this.body)
          .end()
        .end();
    }
  ]
});

foam.CLASS({
  package: 'foam.u2.tag',
  name: 'ColumnViewHeader',
  extends: 'foam.u2.View',
  css: `
  
  ^selected {
    background: lightblue;
  }
  `,
  properties: [
    'hasSubProperties',
    'hasOptions',
    'expanded',
    'currentProperty',
    'isThisPropSelected',
    'level',
    'selectedColumns'
   // 'open'
  ],
  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      this.start()
        .enableClass(this.myClass('selected'), this.selectedColumns[this.selectedColumns.length - 1 - this.level] == this.currentProperty.name)
        .on('click', this.toggleExpanded)
        //.addClass(self.myClass('handle-title'))
        .start()
          .add(this.currentProperty.name)
          .start('span')
            .show(this.hasOptions || this.hasSubProperties)
            .style({
              // 'margin-right':   '36px',
              'vertical-align': 'middle',
              'font-weight':    'bold',
              // 'display':        'inline-block',
              'visibility':     'visible',
              'font-size':      '16px',
              'float':          'right',
              'transform':      this.expanded$.map(function(c) { return c ? 'rotate(180deg)' : 'rotate(90deg)'; })
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
      this.expanded = !this.expanded;
      if ( !this.hasSubProperties ) {
        //this.selectedProp.push(this.currentProperty.name);
        this.isThisPropSelected = !this.expanded;//not sure that this is needed
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.u2.tag',
  name: 'ColumnViewBody',
  extends: 'foam.u2.View',
  requires: [
    'foam.u2.tag.ColumnView'
  ],
  properties: [
    'hasSubProperties',
    'currentProperty',
    'expanded',
    'subProperties',
    'isThisPropSelected',
    'isThisPropertyPathSelected',
    'selectedColumns',
    'level'
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
      var childrenLevel = this.level + 1;

      // self.expanded$.sub(function() {
      //   console.log('ColumnViewBody expanded changed');
      // });

      // self.isThisPropSelected$.sub(function() {
      //   console.log('isThisPropSelected expanded changed');
      // });
      self.isThisPropSelected$.sub(function() {
        if ( self.isThisPropSelected ) {
          if ( self.level > self.selectedColumns.length - 1 ) {
            self.selectedColumns.push(self.currentProperty.name);
          } else {
            if ( self.selectedColumns[self.selectedColumns.length - 1 - self.level] !== self.currentProperty.name )
              self.selectedColumns[self.selectedColumns.length - 1 - self.level] = self.currentProperty.name;

            //if level higher then previous one 
            if ( !self.hasSubProperties && self.level !== self.selectedColumns.length - 1 ) {
              self.selectedColumns.splice(0, self.selectedColumns.length - 1 - self.level);
            }
          }
          self.isThisPropertyPathSelected = !self.isThisPropertyPathSelected;
        }
      });

      this
        .start()
          .forEach(this.subProperties, function(p) {
            self
              .show(self.expanded$)
              .addClass(self.myClass('move-right'))
              .add(foam.u2.ViewSpec.createView(self.ColumnView, {currentProperty: p, isThisPropertyPathSelected$:self.isThisPropSelected$, selectedColumns$: self.selectedColumns$, level:childrenLevel }, self, self.__subSubContext__));
          })
        .end();
    }
  ]
});