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
    'of',
    {
      name: 'choices',
      expression: function(of) {
        if ( ! of ) return [];
        var models = Object.keys(foam.USED)
          .map(id => foam.lookup(id, true))
          .filter(cls => cls)
          .map(cls => cls.model_);
        
        var choices = {};
        choices[of.id] = of.model_;
        while ( true ) {
          var prev = Object.keys(choices).length;
          models.forEach(m => {
            if ( choices[m.extends] || ( m.implements && m.implements.find(i => choices[i.path] ) ) ) {
              choices[m.id] = m;
            }
          })
          if ( prev == Object.keys(choices).length ) break;
        }
        models = Object.values(choices);

        return models
          .filter(m => ! foam.core.InterfaceModel.isInstance(m))
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