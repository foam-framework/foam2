/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'UnstyledChooseNView',
  extends: 'foam.u2.View',

  requires: [
    'foam.core.SimpleSlot'
  ],

  properties: [
    foam.u2.view.ChoiceView.DYNAMIC_SIZE,
    foam.u2.view.ChoiceView.MAX_SIZE,
    foam.u2.view.ChoiceView.CHOICES,
    {
      name: 'n',
      class: 'Int'
    },
    {
      name: 'booleanView',
      class: 'foam.u2.ViewSpec',
      value: {
        class: 'foam.u2.CheckBox'
      }
    },
    {
      name: 'data',
      class: 'Map',
      value: {},
      factory: function () {
        return {};
      },
      adapt: function (_, n) {
        var set = n;
        if ( Array.isArray(n) ) {
          set = {};
          n.forEach(v => { set[n] = true; })
        }
        return set;
      },
    }
  ],

  methods: [
    function initE() {
      var self = this;
      this
        .addClass(this.myClass())
        .add(this.slot(function (choices) {
          return this.E()
            .forEach(choices, function (choice) {
              var valueSlot = self.SimpleSlot.create({
                value: false
              });
              this.tag(self.booleanView, {
                label: choice[1],
                data$: valueSlot
              });
              this.onDetach(valueSlot.sub(() => {
                isOn = valueSlot.get();
                console.log('choice', choice[0], isOn);
                if ( isOn ) {
                  if ( Object.keys(self.data).length >= self.n ) {
                    valueSlot.set(false);
                    return;
                  }
                  self.data$set(choice[0], true);
                } else {
                  self.data$remove(choice[0]);
                  delete self.data[choice[0]];
                }
              }))
            })
        }))
        ;
    }
  ]
});