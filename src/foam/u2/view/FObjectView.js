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

  imports: [
    'strategizer'
  ],

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
          placeholder: '--',
          choices$: x.data.choices$
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
      class: 'Array',
      name: 'choices',
      documentation: `
        A list of choices for a ChoiceView containing models related to the
        model in the 'of' property. The user can choose to create an instance
        of one of the models in this list.
      `
    }
  ],

  methods: [
    function init() {
      this.of$.sub(this.updateChoices);
      this.updateChoices();
    },

    function updateChoices() {
      if ( this.of == null ) {
        this.choices = [];
        return;
      }

      // If this view is being used in a nanos application, then use the
      // strategizer service to populate the list of choices. Otherwise
      // populate the list of choices using models related to 'of' via the
      // implements and extends relations.
      if ( this.strategizer != null ) {
        this.strategizer.query(null, this.of.id).then((strategyReferences) => {
          this.choices = strategyReferences.map((sr) => [sr.strategy.id, sr.strategy.name]);
        });
      } else {
        this.choices = this.choicesFallback(this.of);
      }
    },

    function initE() {
      this.SUPER();
      this
        .tag(foam.u2.detail.VerticalDetailView, {
          data: this,
          sections: [{
            properties: [this.OBJECT_CLASS, this.DATA]
          }]
        });
    },

    function choicesFallback(of) {
      /**
       * Return a list of choices for a ChoiceView containing models related to
       * 'of' via the implements and extends relations. Does not include
       * interfaces or abstract models in the list of choices.
       */
      if ( ! of ) return [];

      var modelIdToDeps = Object.values(foam.USED)
        .concat(Object.values(foam.UNUSED))
        .reduce((map, m) => {
          // QUESTION: If we're filtering out instances of InterfaceModel
          // below, why do we care about getting the list of things the model
          // implements? Won't they all be interfaces? Or are some of them
          // mixins?
          var deps = m.implements
            ? m.implements.map((imp) => {
              return foam.String.isInstance(imp) ? imp : imp.path;
            })
            : [];
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
          if ( deps.filter((d) => choices[d]).length ) choices[id] = true;
        }
        if ( prev == Object.keys(choices).length ) break;
      }

      return Object.keys(choices)
        .map((id) => foam.lookup(id).model_)
        .filter((m) => ! foam.core.InterfaceModel.isInstance(m))
        .filter((m) => ! m.abstract )
        .map((m) => [m.id, m.label]);
    }
  ]
});
