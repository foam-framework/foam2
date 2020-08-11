/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'MultiChoiceView',
  extends: 'foam.u2.View',

  documentation: `
    Wraps a tag that represents multiple choices. 

    The choices are in [value, label, isSelected, choiceMode ] quartets.

    However the client can simply pass in [value, label] and it will adapt to a [value, label, isSelected, choiceMode ] format

    Adds flexibility incase the client wants to have preselected options for the user or a choice disabled from the start

    Calling the method, this.outputSelectedChoicesInValueLabelFormat() will return an array containing the selected choices in [ value, label ] format only if the minSelected, maxSelected criteria is respected

    For now choices can only be provided as an array (this.choices)

    this.booleanView is a ViewSpec for each choice. It defaults to foam.u2.CheckBox
  `,

  properties: [
    {
      name: 'choices',
      documentation: `
        An array of choices which are single choice is denoted as [value, label, isSelected, choiceMode], however the user can
        just pass in [value, label] and 
      `,
      factory: function() {
        return [["test1", "test1", false, this.mode], ["test2", "test2", false, this.mode], ["test3", "test3", false, this.mode]];
      },
      postSet: function(_,n){
        var selectedChoices = n.filter(choice => choice[2] );

        if ( selectedChoices.length >= this.minSelected && selectedChoices.length <= this.maxSelected ){
          this.isValidNumberOfChoices = true;
        } else {
          this.isValidNumberOfChoices = false;
        }

        if ( selectedChoices.length < this.maxSelected ) {
          n.forEach((choice) => {
            if ( ! choice[2] ){
              choice[3] = this.mode
            }
          })
        } else {
          n.forEach((choice) => {
            if ( ! choice[2] ){
              choice[3] = foam.u2.DisplayMode.DISABLED
            }
          })
        }
      },
    },
    {
      class: 'Boolean',
      name: 'isValidNumberOfChoices',
      value: this.minSelected === 0 ? true : false
    },
    {
      class: 'Boolean',
      name: 'showMinMaxHelper',
      value: false
    },
    {
      class: 'Boolean',
      name: 'showValidNumberOfChoicesHelper',
      value: false
    },
    {
      class: 'Int',
      name: 'minSelected',
      value: 1
    },
    {
      class: 'Int',
      name: 'maxSelected',
      factory: function () {
        return this.choices.length;
      }
    },
    {
      class: 'foam.u2.ViewSpecWithJava',
      name: 'booleanView',
      value: { class: 'foam.u2.CheckBox' }
    },
  ],

  methods: [
    function initE() {
      var self = this;
      var arraySlotForChoices = foam.core.ArraySlot.create({
        slots: []
      });
      this
        .start()
          .add(self.slot(function(showMinMaxHelper, minSelected, maxSelected) {
            return self.E().callIf(showMinMaxHelper, function() {
              this
              .start(foam.u2.layout.Rows)
                .start()
                  .add(`Min number of choices: ${minSelected}`)
                .end()
                .start()
                  .add(`Max number of choices: ${maxSelected}`)
                .end()
              .end()
            })
          }))
        .end()
        .start()
          .add(
            this.choices.map(function (choice) {
              var simpSlot0 = foam.core.SimpleSlot.create({ value: choice[0] });
              var simpSlot1 = foam.core.SimpleSlot.create({ value: choice[1] });
              var simpSlot2 = foam.core.SimpleSlot.create({ value: choice[2] });
              var simpSlot3 = foam.core.SimpleSlot.create({ value: choice[3] });

              var arraySlotForChoice = foam.core.ArraySlot.create({
                slots: [ simpSlot0, simpSlot1, simpSlot2, simpSlot3 ]
              })

              arraySlotForChoices.slots.push(arraySlotForChoice);

              return self.E()
                .tag(self.booleanView, {
                  data$: simpSlot2,
                  label$: simpSlot1,
                  mode$: simpSlot3
                });
            })
          )
        .end()
        .start()
          .add(
            self.slot(function(showValidNumberOfChoicesHelper ,isValidNumberOfChoices) {
              return self.E().callIf(! isValidNumberOfChoices && showValidNumberOfChoicesHelper, function() {
                this
                  .add("Please select a valid number of choices")
              })
            })
          )
        .end()

      this.choices$ = arraySlotForChoices;
    },

    function outputSelectedChoicesInValueLabelFormat() {
      if ( this.isValidNumberOfChoices ) console.warn("Please select a valid number of choices");
      else return this.choices.map(choice => [choice[0], choice[1]]);
    }
  ]
});
