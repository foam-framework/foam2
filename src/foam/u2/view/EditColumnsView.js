/** 
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'EditColumnsView',
  extends: 'foam.u2.Element',

  requires: [
      'foam.u2.CheckBox'
  ],

  properties: [
      {
          name: 'properties'
      },
      {
          class: 'Boolean',
          name: 'displaySorted',
          value: false
      }
  ],
  
  methods: [
    function init() {
      console.log('init***************************************')
      var props = [];

      for (var i = 0; i < this.properties.length; ++i) {
        props.push({prop: this.properties[i], visible: true})
      }

      this.properties = props;
    },
    
    function initE() {
      if ( this.displaySorted ) {
        // TODO: How should this block be tested?
        var props = this.properties;
        props = this.properties.slice();
        props.sort(function(a, b) {
          return a.label.toLowerCase().compareTo(b.label.toLowerCase());
        });
      }

      for (let i = 0; i < this.properties.length; i++) {
        this.properties[i].visible = true;

        var cb = this.CheckBox.create({
          label: this.properties[i].prop.label,
          data: this.properties[i].visible
        });

        // Subscribes onPropChange listener to checkbox data
        cb.data$.sub(this.onPropChange.bind(this, this.properties[i].prop, cb));

        this.add(cb);

        if (i != this.properties.length - 1) this.start('br').end();
      }
    }
  ],

  listeners: [
    function onPropChange(changedProp, cb, _, old, nu) {
      console.log('onPropChange ------------------------')

      if ( this.displaySorted ) {
        // TODO: How should this block be tested?
        out = this.selectedProperties.slice();
        if ( nu && !selected[changedProp.name] ) {
          out.push(changedProp);
        }
        if ( !nu && selected[changedProp.name] ) {
          out.splice(out.indexOf(changedProp), 1);
        }
      } else {
        for (var i = 0; i < this.properties.length; i++) {
          var p = this.properties[i];
          
          p.visible = ((p.prop === changedProp && cb.data) || 
                        (p.visible && (p.prop !== changedProp || cb.data)));
        }
      }

      this.propertyChange.pub('properties')
    }
  ]
});
