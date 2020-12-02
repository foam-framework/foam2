/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'StrategizerChoiceView',
  extends: 'foam.u2.view.ChoiceView',

  documentation: 'A choice view that gets its choices array from Strategizer.',

  imports: [
    'strategizer'
  ],

  properties: [
    {
      class: 'String',
      name: 'desiredModelId',
      required: true
    },
    {
      class: 'String',
      name: 'target'
    }
  ],

  methods: [
    function init() {
      this.SUPER();
      this.onDetach(this.desiredModelId$.sub(this.updateChoices));
      this.onDetach(this.target$.sub(this.updateChoices));
      this.updateChoices();
    }
  ],

  listeners: [
    {
      name: 'updateChoices',
      code: function() {
        var self = this;
        self.strategizer.query(null, self.desiredModelId, self.target).then((strategyReferences) => {
          self.choices = strategyReferences
            .reduce((arr, sr) => {
              if ( ! sr.strategy ) {
                console.warn('Invalid strategy reference: ' + sr.id);
                return arr;
              }

              return arr.concat([[sr.strategy, sr.strategy.name]]);
            }, [[null, 'Select...']])
            .filter(x => x);
        });
      }
    }
  ]
});
