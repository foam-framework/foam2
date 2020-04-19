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
  ^ {
    flex: 1;
  }

  ^container-search {
    display: flex;
  }

  ^container-drawer {
    max-height: 0;
    overflow: hidden;

    transition: max-height 0.24s ease-in-out;

    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }

  ^general-field {
    margin: 0;
    flex: 1 1 80%;
  }

  ^general-field .foam-u2-tag-Input {
    width: 100%;
    height: 34px;
    border-radius: 5px 0 0 5px;
    border: 1px solid /*%GREY4%*/ #cbcfd4;
  }

  ^container-drawer-open {
    max-height: 1000px;
  }

  ^container-handle {
    padding: 0 16px;
    box-sizing: border-box;
    height: 34px;
    border: 1px solid /*%GREY4%*/ #e7eaec;
    border-radius: 0 5px 5px 0;
    background-image: linear-gradient(to bottom, #ffffff, #e7eaec);

    flex: 1 1 20%;
    display: flex;
    align-items: center;
  }

  ^handle-title {
    flex: 1;
    margin: 0;
  }

  ^container-handle:hover {
    cursor: pointer;
    background-image: linear-gradient(to bottom, #ffffff, #d3d6d8);
  }
  
  `,

  properties: [
    {
      name: 'choices',
      factory: function() {
        return [];
      }
    },
    {
      name: 'placeholder',
      factory: function() {
        return undefined;
      }
    },
    {
      name: 'hasSubProperties',
      class: 'Boolean',
      expression: function(currentProperty) {
        if ( currentProperty.cls_.name === 'FObjectProperty' )
          return true;
        return false;
      },
      value: []
    },
    {
      name: 'expanded',
      class: 'Boolean',
      value: false
    },
    {
      name: 'open',
      class: 'Boolean',
      value: false
    },
    'currentProperty',
    {
      name: 'subProperties',
      expression: function(currentProperty) {
        if ( currentProperty.cls_.name === 'FObjectProperty' )
          return currentProperty.cls_.getAxiomsByClass(foam.core.Property);
        return [];
      }
    },
    {
      name: 'selectedProp',
      value: []
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
    {
      name: 'isThisPropSelected',
      class: 'Boolean',
      value: false
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this.isPropertySelected$.sub(function() {
        if ( self.isPropertySelected )
          self.open = !self.open;
      });

      this
      .start()
        .start().addClass(self.myClass('container-handle'))
        .show( this.selectedProp.length === 0 || ( this.selectedProp.length > 0 && this.isThisPropSelected ) )
        //.on('click', self.toggleDrawer)
            .start()
              .start('p').addClass(self.myClass('handle-title')).add(this.currentProperty ? this.currentProperty.name : 'Select property...')
                .start('span')
                  .show(this.hasSubProperties || this.props.length > 0)
                  .style({
                    'margin-right':   '36px',
                    'vertical-align': 'middle',
                    'font-weight':    'bold',
                    'display':        'inline-block',
                    'visibility':     'visible',
                    'font-size':      '16px',
                    'float':          'right',
                    'transform':      this.expanded$.map(function(c) { return c ? 'rotate(180deg)' : 'rotate(90deg)'; })
                  })
                  .add('\u2303')
                .end()
              .end()
              .on('click', this.toggleExpanded)
            .end()
          .end()
          .start()
              .show(this.hasSubProperties && this.expanded)
              .addClass(self.myClass('margin-left'))
              .forEach(this.subProperties, function(p) {
                this
                  .add(self.ColumnView.create({currentProperty: p, selectedProp: this.selectedProp, isPropertySelected$: self.isPropertySelected$}));
              })
          .end()
          .start()
              .show(self.open$)
              .forEach(this.props, function(p) {
                this
                  .start()
                    .add(self.ColumnView.create({currentProperty: p, selectedProp: this.selectedProp, isPropertySelected$: self.isPropertySelected$}))
                  .end();
              })
          .end()
        .end()
      .end();
      
    }
  ],
  listeners: [
    function toggleExpanded(e) {
      if ( !this.open )
        this.open = !this.open;
      else {
        if (this.hasSubProperties )
          this.expanded = !this.expanded;
        else {
          this.isThisPropSelected = true;
          this.selectedProp.shift(this.selectedProp.name);
          this.open = !this.open;
        }
      }
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
  ^ {
    flex: 1;
  }

  ^container-search {
    display: flex;
  }

  ^container-drawer {
    max-height: 0;
    overflow: hidden;

    transition: max-height 0.24s ease-in-out;

    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }

  ^general-field {
    margin: 0;
    flex: 1 1 80%;
  }

  ^general-field .foam-u2-tag-Input {
    width: 100%;
    height: 34px;
    border-radius: 5px 0 0 5px;
    border: 1px solid /*%GREY4%*/ #cbcfd4;
  }

  ^container-drawer-open {
    max-height: 1000px;
  }

  ^container-handle {
    padding: 0 16px;
    box-sizing: border-box;
    height: 34px;
    border: 1px solid /*%GREY4%*/ #e7eaec;
    border-radius: 0 5px 5px 0;
    background-image: linear-gradient(to bottom, #ffffff, #e7eaec);

    flex: 1 1 20%;
    display: flex;
    align-items: center;
  }

  ^handle-title {
    flex: 1;
    margin: 0;
  }

  ^container-handle:hover {
    cursor: pointer;
    background-image: linear-gradient(to bottom, #ffffff, #d3d6d8);
  }

  ^margin-left {
    margin-left: 3px;
  }
  
  `,

  properties: [
    {
      name: 'hasSubProperties',
      class: 'Boolean',
      expression: function(subProperties) {
        if ( !subProperties && subProperties.length !== 0 )
          return true;
        return false;
      }
    },
    'currentProperty',
    {
      name: 'subProperties',
      expression: function(currentProperty) {
        if ( currentProperty.cls_.name === 'FObjectProperty' )
          return currentProperty.cls_.getAxiomsByClass(foam.core.Property);
        return [];
      }
    },
    {
      name: 'selectedProp',
      value: []
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
      name: 'header',
      factory: function() {//function(hasSubProperties, isThisPropSelected, isPropertySelected)'currentProperty'
        return this.ColumnViewHeader.create({hasSubProperties: this.hasSubProperties, isThisPropSelected:this.isThisPropSelected, isPropertySelected:this.isPropertySelected, expanded:this.expanded, currentProperty:this.currentProperty});
      }
    },
    {
      name: 'body',
      factory: function() {//function(hasSubProperties, currentProperty, selectedProp, expanded)
        return this.ColumnViewBody.create({hasSubProperties:this.hasSubProperties, currentProperty:this.currentProperty, selectedProp:this.selectedProp, expanded:this.expanded, subProperties:this.subProperties});
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      self.isThisPropSelected$.sub(function() {
        self.isPropertySelected = true;
      });

      self.selectedProp$.sub(function() {
        self.expanded = false;
      });
      var views = [];
      var specView = {};

      this
        .start()
          .addClass(this.myClass('container-handle'))
          .start()
            .show( this.selectedProp.length === 0 || ( this.selectedProp.length > 0 && this.isThisPropSelected ) )
            .add(this.header)
            .end()
          .end()
          .start()
            .show( this.selectedProp.length === 0 || ( this.selectedProp.length > 0 && this.isThisPropSelected ) )
            .add(this.body)
          .end()
        .end();
    }
  ]
});

foam.CLASS({
  package: 'foam.u2.tag',
  name: 'ColumnViewHeader',
  extends: 'foam.u2.View',
  properties: [
    'hasSubProperties',
    {
      name: 'isPropertySelected',
      class: 'Boolean',
      value: false
    },
    'expanded',
    'currentProperty'
  ],
  methods: [
    function initE() {
      var self = this;
      this.start()
        .on('click', this.toggleExpanded)
        .addClass(self.myClass('handle-title')).add(this.currentProperty.name)
        .start()
          .start('span')
            .show( this.hasSubProperties )
            .style({
              'margin-right':   '36px',
              'vertical-align': 'middle',
              'font-weight':    'bold',
              'display':        'inline-block',
              'visibility':     'visible',
              'font-size':      '16px',
              'float':          'right',
              'transform':      this.expanded$.map(function(c) { return c ? 'rotate(180deg)' : 'rotate(90deg)'; })
            })
            .on('click', this.toggleExpanded)
            .add('\u2303')
          .end()
        .end();
    }
  ],
  listeners: [
    function toggleExpanded(e) {
      if ( this.hasSubProperties )
        this.expanded = !this.expanded;
      else {
        this.isThisPropSelected = true;
        this.selectedProp.push(this.currentProperty.name);
        this.open = !this.open;
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
    'selectedProp',
    'expanded',
    'subProperties'
  ],
  methods: [
    function initE() {
      var self = this;
      this
        .start()
          .addClass(self.myClass('margin-left'))
          .show(this.hasSubProperties.length !== 0 && this.expanded)
          .forEach(this.subProperties, function(p) {
            this
              .add(self.ColumnView.create({currentProperty: p, selectedProp$: this.selectedProp$}));
          })
        .end();
    }
  ]
});