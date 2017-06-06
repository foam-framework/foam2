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
        class: 'FObjectArray',
        of: 'foam.core.Property',
          name: 'selectedProperties'
      },
      {
          class: 'Boolean',
          name: 'displaySorted',
          value: false
      }
  ],
  
  methods: [
    function selectedMap() {
      var selected = {};
      for (var i = 0; i < this.selectedProperties.length; i++) {
        selected[this.selectedProperties[i].name] = true;
      }

      return selected;
    },

    function initE() {
      var selected = this.selectedMap();
      var props = this.properties;

      if ( this.displaySorted ) {
        props = this.properties.slice();
        props.sort(function(a, b) {
          return a.label.toLowerCase().compareTo(b.label.toLowerCase());
        });
      }

      for (let i = 0; i < props.length; i++) {
        var cb = this.CheckBox.create({
          label: props[i].label,
          data: selected[props[i].name]
        });

        cb.attrSlot('checked').element.on('change', 
          this.onPropChange.bind(this, props[i], cb));

      // TODO: this:
      // cb.data$.sub(function() {this.onPropChange.bind(this, props[i], cb)}.bind(this));



        this.add(cb);
      }
    }
  ],

  listeners: [
    function onPropChange(prop, _, cb, old, nu) {
      var selected = this.selectedMap();

      var out = [];

      if ( this.displaySorted ) {
        out = this.selectedProperties.slice();
        if ( nu && !selected[prop.name] ) {
          out.push(prop);
        }
        if ( !nu && selected[prop.name] ) {
          out.splice(out.indexOf(prop), 1);
        }
      } else {
        for (var i = 0; i < this.properties.length; i++) {
          var p = this.properties[i];

          // Push under two conditions: selected and not just removed,
          // or not selected but just added.
          // TODO: Handle newly added columns dynamically
          if ((p === prop && cb.target.checked) || (selected[p.name] && (p !== prop || cb.target.checked))) {
            out.push(p);
          }
        }
      }

      this.selectedProperties = out;
      this.propertyChange.pub('selectedProperties');      
    }
  ]
});
