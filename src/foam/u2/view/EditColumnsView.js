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

      console.log('selected: ')
      console.log(selected)
      return selected;
    },

    function initE() {
      var selected = this.selectedMap();
      console.log('selected')
      console.log(selected)
      var props = this.properties;

      if ( this.displaySorted ) {
        props = this.properties.slice();
        props.sort(function(a, b) {
          return a.label.toLowerCase().compareTo(b.label.toLowerCase());
        });
      }

      for (var i = 0; i < props.length; i++) {
        var cb = this.CheckBox.create({
          //label: props[i].label,
          data: selected[props[i].name]
        });

        // TODO: Determine link
        // cb.data$.linkTo(this.onPropChange.bind(this, props[i]));
        this.add(cb);
      }
    }
  ],

  listeners: [
    function onPropChange(prop, _, __, old, nu) {
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
          if ((p === prop && nu) || (selected[p.name] && (p !== prop || nu))) {
            out.push(p);
          }
        }
      }

      this.selectedProperties = out;
    }
  ]
});
