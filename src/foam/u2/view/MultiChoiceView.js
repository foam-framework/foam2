/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 // TODO: DAO Support make it do an IN QUERY where value is the ID

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

  css: `
    ^boolean-wrapper{
      width: 100%;
      height: 100%;
    }
  `,

  properties: [
    {
      name: 'choices',
      documentation: `
        An array of choices which are single choice is denoted as [value, label, isSelected, choiceMode], however the user can
        just pass in [value, label] and the adapt function will turn it into the [value, label, isSelected, choiceMode] format
        for processing purposes
      `,
      factory: function() {
        return [];
      },
      adapt: function(_, n) {
        if ( ! Array.isArray(n) ) throw new Error("Please submit an array to choices in the MultiChoiceView");

        if ( n.length > 0 ){
          var valueLabelChoices = n.filter(choice => choice.length === 2)
          var fullChoices = n.filter(choice => choice.length === 4)

          if ( valueLabelChoices.length === n.length ) return n.map(choice => [ choice[0], choice[1], false, this.mode ])
          if ( fullChoices.length === n.length  ) return n;

          throw new Error("Items in choices array do not have consistent lengths")
        }

        return n;
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
      }
    },
    {
      class: 'Boolean',
      name: 'isValidNumberOfChoices',
      value: this.minSelected === 0 ? true : false
    },
    {
      class: 'Boolean',
      name: 'showMinMaxHelper',
      value: true
    },
    {
      class: 'Boolean',
      name: 'showValidNumberOfChoicesHelper',
      value: true
    },
    {
      class: 'Int',
      name: 'minSelected',
      factory: function() {
        return this.choices.length > 0 ? 1 : 0
      }
    },
    {
      class: 'Int',
      name: 'maxSelected',
      factory: function () {
        return 2;
      }
    },
    {
      class: 'foam.u2.ViewSpecWithJava',
      name: 'booleanView',
      value: { class: 'foam.u2.CheckBox' }
    },
    {
      class: 'Boolean',
      name: 'isVertical',
      value: true
    }
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
        .start(self.isVertical ? foam.u2.layout.Rows : foam.u2.layout.Cols)
          .add(
            self.choices.map(function (choice) {
              var simpSlot0 = foam.core.SimpleSlot.create({ value: choice[0] });
              var simpSlot1 = foam.core.SimpleSlot.create({ value: choice[1] });
              var simpSlot2 = foam.core.SimpleSlot.create({ value: choice[2] });
              var simpSlot3 = foam.core.SimpleSlot.create({ value: choice[3] });

              var arraySlotForChoice = foam.core.ArraySlot.create({
                slots: [ simpSlot0, simpSlot1, simpSlot2, simpSlot3 ]
              })

              arraySlotForChoices.slots.push(arraySlotForChoice);

              return self.E().addClass(self.myClass("boolean-wrapper"))
                .tag(self.booleanView, {
                    data$: simpSlot2,
                    label$: simpSlot1,
                    mode$: simpSlot3
                  })
            })
          )
        .end()
        .start()
          .add(
            self.slot(function(showValidNumberOfChoicesHelper ,isValidNumberOfChoices, choices) {
              return self.E()
              .callIf(! isValidNumberOfChoices && showValidNumberOfChoicesHelper, function() {
                this
                  .add("Please select a valid number of choices")
              })
              .callIf(isValidNumberOfChoices && showValidNumberOfChoicesHelper, function() {
                this
                  .start()
                    .add("Here are your valid selected choices using the outputSelectedChoicesInValueLabelFormat() function:")
                  .end()
                  .start()
                    .add(
                      self.outputSelectedChoicesInValueLabelFormat().map(function(choice){
                        return self.E().add(`[${choice[0]},${choice[1]}]`)
                      })
                    )
                  .end()
              })
            })
          )
        .end()

      this.choices$ = arraySlotForChoices;
    },

    function outputSelectedChoicesInValueLabelFormat() {
      if ( ! this.isValidNumberOfChoices ) {
        console.warn("Please select a valid number of choices");
        return [];
      }

      var filteredChoices = this.choices.filter(choice => choice[2]);

      return filteredChoices.map(choice => [choice[0], choice[1]]);
    }
  ]
});
