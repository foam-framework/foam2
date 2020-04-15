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
      visibility: function(choices) {
        return choices.length > 1 ?
          foam.u2.DisplayMode.RW :
          foam.u2.DisplayMode.HIDDEN;
      },
      view: function(args, X) {
        return {
          class: 'foam.u2.view.ChoiceView',
          choices$: X.data.choices$,
          defaultValue$: X.data.choices$.map((choices) => {
            return Array.isArray(choices) && choices.length > 0 ? choices[0][0] : '';
          })
        };
      },
      postSet: function(oldValue, newValue) {
        if ( newValue !== oldValue && oldValue !== '') {
          if ( this.data && this.data.cls_.name === newValue ) return;
          var m = this.__context__.lookup(newValue, true);
          if ( m ) {
            this.data = m.create(null, this);
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
      },
      // We need to override the default view, otherwise we end up with a
      // circular definition where FObjectView has an FObjectProperty which gets
      // rendered as an FObjectView, which leads to infinite recursion.
      view: function(args, X) {
        return X.data.dataView || { class: 'foam.u2.detail.SectionedDetailView' }
      }
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'dataView',
      documentation: 'Set this to change the view of the FObject being created.'
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
      this.onDetach(this.of$.sub(this.updateChoices));
      this.updateChoices();
    },

    function updateChoices() {
      if ( this.of == null ) {
        this.choices = [];
        return;
      }

      // 'found' is set to true if the current data's objectClass is one
      // of the valid choices. If it isn't, then the objectClass is set
      // to the first choice to cause a new 'data' to be created.
      var found = false;
      var data  = this.data;
      // If this view is being used in a nanos application, then use the
      // strategizer service to populate the list of choices. Otherwise
      // populate the list of choices using models related to 'of' via the
      // implements and extends relations.
      if ( this.strategizer != null ) {
        this.strategizer.query(null, this.of.id).then((strategyReferences) => {
          if ( ! Array.isArray(strategyReferences) || strategyReferences.length === 0 ) {
            this.choices = [[this.of.id, this.of.model_.label]];
            found = data && data.cls_.name == this.of.id;
            return;
          }

          var choices = strategyReferences
            .reduce((arr, sr) => {
              if ( ! sr.strategy ) {
                console.warn('Invalid strategy reference: ' + sr.id);
                return arr;
              }

              if ( data && data.cls_.name === sr.strategy.id ) found = true;
              return arr.concat([[sr.strategy.id, sr.label || sr.strategy.model_.label]]);
            }, [])
            .filter(x => x);

          // Sort choices alphabetically by label.
          choices.sort((a, b) => a[1] > b[1] ? 1 : -1);

          if ( ! found && choices.length ) this.objectClass = choices[0][0];

          this.choices = choices;
        }).catch(err => console.warn(err));
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
