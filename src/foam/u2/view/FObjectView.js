/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'FObjectView',
  extends: 'foam.u2.View',
  documentation: 'View for editing FObjects.',
  properties: [
    {
      class: 'String',
      name: 'objectClass',
      label: '',
      visibilityExpression: function(choices) {
        return choices.length > 1 ?
          foam.u2.Visibility.RW :
          foam.u2.Visibility.HIDDEN;
      },
      view: function(_, x) {
        return foam.u2.view.ChoiceView.create({
          choices: x.data.choices
        }, x);
      },
      postSet: function(oldValue, newValue) {
        if ( newValue !== oldValue ) {
          var m = this.__context__.lookup(newValue, true);
          if ( m ) {
            var n = m.create(null, this);
            n.copyFrom(this.data);
            this.data = n;
          }
        }
      }
    },
    {
      class: 'FObjectProperty',
      name: 'data',
      label: '',
      postSet: function(_, data) {
        if ( ! data ) {
          this.objectClass = undefined;
        } else if ( data.cls_.id != this.objectClass ) {
          this.objectClass = data.cls_.id;
        }
      }
    },
    {
      class: 'Class',
      name: 'of'
    },
    {
      name: 'choices',
      expression: function(of) {
        if ( ! of ) return [];
        var modelIdToDeps = Object.values(foam.USED)
          .concat(Object.values(foam.UNUSED))
          .reduce((map, m) => {
            var deps = m.implements ? m.implements.map(imp => {
              return foam.String.isInstance(imp) ? imp : imp.path;
            }) : [];
            if ( m.extends ) deps.push(m.extends);
            var id = m.id || m.package + '.' + m.name;
            map[id] = deps;
            return map;
          }, {});
        
        var choices = {};
        choices[of.id] = true;
        while ( true ) {
          var prev = Object.keys(choices).length;
          for ( var [id, deps] of Object.entries(modelIdToDeps) ) {
            if ( deps.filter(d => choices[d]).length ) choices[id] = true;
          }
          if ( prev == Object.keys(choices).length ) break;
        }

        return Object.keys(choices)
          .map(id => foam.lookup(id).model_)
          .filter(m => ! foam.core.InterfaceModel.isInstance(m))
          .filter(m => ! m.abstract )
          .map(m => [ m.id, m.label ]);
      }
    }
  ],
  methods: [
    function initE() {
      this.SUPER();
      this
        .tag(foam.u2.detail.VerticalDetailView, {
          data: this,
          sections: [{
            properties: [this.OBJECT_CLASS, this.DATA]
          }]
        })
    }
  ]
});
