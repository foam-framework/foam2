/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'FObjectView',
  extends: 'foam.u2.Controller',

  documentation: 'View for editing FObjects.',

  imports: [
    'setTimeout',
    'strategizer?'
  ],

  requires: [
    'foam.core.Latch'
  ],

  messages: [
    { name: 'PLACEHOLDER_TEXT', message: 'select...' }
  ],

  properties: [
    {
      class: 'foam.core.FObjectProperty',
      of: 'foam.core.Latch',
      name: 'choicesLoaded',
      documentation: 'A latch used to wait on choices loaded.',
      factory: function() { return this.Latch.create(); }
    },
    {
      class: 'String',
      name: 'objectClass',
      label: '',
      visibility: function(allowCustom, classIsFinal, choices, data, placeholder) {
        if ( ! allowCustom && choices.length <= 1 && ! this.hasOwnProperty('placeholder') ) return foam.u2.DisplayMode.HIDDEN;
        if ( classIsFinal && this.dataWasProvided_ ) return foam.u2.DisplayMode.HIDDEN;
        return foam.u2.DisplayMode.RW;
      },
      view: function(args, X) {
        return {
          class: X.data.allowCustom ? 'foam.u2.TextField' : 'foam.u2.view.ChoiceView',
          displayWidth: 60,
          placeholder: X.data.placeholder,
          header: X.data.header,
          choices$: X.data.choices$
        };
      }
    },
    {
      name: 'config'
      // Map of property-name: {map of property overrides} for configuring properties
      // values include 'label', 'units', and 'view'
    },
    {
      class: 'FObjectProperty',
      name: 'data',
      label: '',
      // We need to override the default view, otherwise we end up with a
      // circular definition where FObjectView has an FObjectProperty which gets
      // rendered as an FObjectView, which leads to infinite recursion.
      preSet: function(o, n) { return n || o; },
      view: 'foam.u2.detail.SectionedDetailView'
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
      class: 'Boolean',
      name: 'skipBaseClass',
      documentation: 'If true, skips of base-class as a choice when no strategies fetched.',
      value: false
    },
    {
      class: 'Boolean',
      name: 'allowCustom',
      expression: function(choices) {
        return choices.length == 0;
      }
    },
    {
      class: 'Function',
      name: 'copyOldData',
      documentation: `
        Function to copy data from old object to new object when objectClass changes.
        The default implementation copies all properties with the same name, but
        if you don't want this behaviour, then implement your own copy method.
        Ex. if we only wanted to copy two fields:
          copyOldData: function(o) { return {
            field1: o.field1,
            field2: o.field2
        }; }
        You do not need to handle the case where the old object is null.
      `,
      value: function(o) { return o; }
    },
    {
      class: 'Boolean',
      name: 'classIsFinal',
      documentation: 'If true, objectClass cannot be changed if data is provided.'
    },
    {
      class: 'Boolean',
      name: 'dataWasProvided_',
      documentation: 'Set to true if data was initially provided. Used to implement classIsFinal.'
    },
    {
      class: 'String',
      name: 'placeholder',
      expression: function() {
        return this.PLACEHOLDER_TEXT;
      },
      documentation: 'If no placeholder, the choiceView will select the first element',
    },
    {
      class: 'String',
      name: 'header',
      documentation: 'The heading text for the choices',
    },
    {
      class: 'Array',
      name: 'choices',
      documentation: `
        A list of choices for a ChoiceView containing models related to the
        model in the 'of' property. The user can choose to create an instance
        of one of the models in this list.
      `
    },
    {
      name: 'predicate',
      documentation: `
        Predicate to pass into strategizer query request. Used to define results from strategizer query.
        Example use of strategizer predicate on FObjectView from property view:

        name: 'exampleProp',
        view: function(_, X) {
          let predicate = expr.AND(
              expr.EQ(foam.strategy.StrategyReference.DESIRED_MODEL_ID, 'foam.nanos.auth.User'),
              expr.IN(
                foam.strategy.StrategyReference.STRATEGY,
                [foam.lookup('foam.nanos.auth.SomeUserClass'), foam.lookup('foam.nanos.auth.AnotherUserClass') ]
              )
          );
          return foam.u2.view.FObjectView.create({
            data: X.data.exampleProp,
            of: foam.nanos.auth.User,
            predicate: predicate
          }, X);
        }
      `
    }
  ],

  methods: [
    function updateChoices() {
      if ( this.of == null ) {
        this.choices = [];
        this.choicesLoaded.resolve();
        return;
      }

      // If this view is being used in a nanos application, then use the
      // strategizer service to populate the list of choices. Otherwise
      // populate the list of choices using models related to 'of' via the
      // implements and extends relations.
      if ( this.strategizer != null ) {
        this.strategizer.query(null, this.of.id, null, this.predicate).then((strategyReferences) => {
          if ( ! Array.isArray(strategyReferences) || strategyReferences.length === 0 ) {
            this.choices = this.skipBaseClass ? [] : [[this.of.id, this.of.model_.label]];
            this.choicesLoaded.resolve();
            return;
          }

          var choices = strategyReferences
            .reduce((arr, sr) => {
              if ( ! sr.strategy ) {
                console.warn('Invalid strategy reference: ' + sr.id);
                return arr;
              }

              return arr.concat([[sr.strategy.id, sr.strategy.model_.label]]);
            }, [])
            .filter(x => x);

          // Sort choices alphabetically by label.
          choices.sort((a, b) => a[1] > b[1] ? 1 : -1);

          this.choices = choices;
          this.choicesLoaded.resolve();
        }).catch(err => console.warn(err));
      } else {
        this.choices = this.choicesFallback(this.of);
      }
    },

    async function initE() {
      this.SUPER();

      function dataToClass(d) {
        return d ? d.cls_.id : '';
      }

      var classToData = (c) => {
        if ( ! c ) return undefined;
        var m = c && this.__context__.lookup(c, true);
        return m.create(this.data ? this.copyOldData(this.data) : null, this);
      };

      this.dataWasProvided_ = !! this.data;

      if ( ! this.data && this.objectClass )
        this.data = classToData(this.objectClass);

      if ( ! this.choices.length ) {
        this.onDetach(this.of$.sub(this.updateChoices));
        this.updateChoices();
        await this.choicesLoaded;
        if ( this.state == this.UNLOADED ) return;
        if ( this.state == this.OUTPUT ) {
          await new Promise(resolve => this.onload.sub(resolve))
        }
      }

      this.onDetach(this.data$.relateTo(
        this.objectClass$,
        dataToClass,
        classToData
      ));

      if ( this.data ) { this.objectClass = dataToClass(this.data); }
      if ( ! this.data && ! this.objectClass && this.choices.length && ! this.hasOwnProperty('placeholder') ) this.objectClass = this.choices[0][0];

      this.
        start(this.OBJECT_CLASS).
          // If we were using a DetailView, this would be done for us, but since
          // we aren't, we need to connect the 'visibility' property ourself.
          show(this.OBJECT_CLASS.createVisibilityFor(foam.core.SimpleSlot.create({value: this}), this.controllerMode$).map(function(m) {
            return m != foam.u2.DisplayMode.HIDDEN;
          })).
        end().
        start().
          show(this.objectClass$).
          tag(foam.u2.detail.VerticalDetailView, {
            data$: this.data$,
            config: this.config
          }).
        end();
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
