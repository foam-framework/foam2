/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'MultiChoiceView',
  extends: 'foam.u2.View',
  flags: ['web'],

  implements: [ 'foam.mlang.Expressions' ],

  requires: [ 'foam.u2.view.CardSelectView' ],

  documentation: `
    -takes a faceted CardSelectView - based on each choice[2].cls_

    Wraps a tag that represents multiple choices.

    The choices are in [value, label, isSelected, choiceMode ] quartets.

    However the client can simply pass in [value, label] and it will adapt to a [value, label, isSelected, choiceMode ] format

    Or the client can instead pass in a DAO to the MultiChoiceView.dao and the choices list will
    be automatically generated

    Calling the following methods:

    MultiChoiceView.data will be automatically set to a predicated dao based on the choices selected only if
    the minSelected, maxSelected criteria is respected, it will be foam.dao.NullDAO othrewise
  `,

  css: `
    ^helpTextRow {
      font-size: 14pt;
      padding: 8pt 0;
    }
    ^flexer {
      flex-wrap: wrap;
      align-items: stretch;
      text-align: center;
    }
    ^innerFlexer {
      display: inline-flex;
      padding: 4px;
      box-sizing: border-box;
    }
  `,

  constants: {
    NUM_COLUMNS: 3
  },

  messages: [
    { name: 'OPTIONS_MSG', message: 'options' },
    { name: 'CHOOSE_1_OF_FOLLOWING_OPTIONS', message: 'Choose one of the following options' },
    { name: 'CHOOSE_AT_LEAST_1_OPTION', message: 'Choose at least one option' },
    { name: 'CHOOSE_AT_LEAST', message: 'Choose at least' },
    { name: 'CHOOSE_EXACTLY', message: 'Choose exactly' },
    { name: 'CHOOSE', message: 'Choose' }
  ],

  properties: [
    {
      class: 'Function',
      name: 'onSelect'
    },
    {
      name: 'choices',
      documentation: `
        An array of choices which are single choice is denoted as [value, label, isSelected, choiceMode, isFinal], however the user can
        just pass in [value, label] and the adapt function will turn it into the [value, label, isSelected, choiceMode, isFinal] format
        for processing purposes
      `,
      factory: function() {
        return [];
      },
      adapt: function(_, n) {
        if ( ! Array.isArray(n) ) throw new Error('Please submit an array to choices in the MultiChoiceView');

        if ( n.length > 0 ) {
          n = n.sort();
          var valueLabelChoices = n.filter(choice => choice.length === 2);
          var fullChoices = n.filter(choice => choice.length === 5);

          if ( valueLabelChoices.length === n.length ) return n.map(choice => [choice[0], choice[1], false, this.mode, false]);
          if ( fullChoices.length === n.length ) return n;

          throw new Error('Items in choices array do not have consistent lengths');
        }

        return n;
      },
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao',
      documentation: `
        If the user just wants to pass in a dao, it will be processed to populate the
        choices array instead of manually inputing the choices
      `
    },
    {
      name: 'selectedChoices',
      value: [],
      postSet: function(o, n) {
        if ( this.onSelect ) this.onSelect(o, n);

        if ( this.selectedChoices.length < this.maxSelected ) {
          this.choices.forEach(choice => {
            var isSelected = foam.core.Slot.isInstance(choice[2])
              ? choice[2].get()
              : choice[2];

            var isFinal = foam.core.Slot.isInstance(choice[4])
              ? choice[4].get()
              : choice[4];

            if ( ! isSelected && ! isFinal ) {
              choice[3] = this.mustSlot(choice[3]);
              choice[3].set(foam.u2.DisplayMode.RW);
            }
          });
        } else {
          this.choices.forEach(choice => {
            var isSelected = foam.core.Slot.isInstance(choice[2])
              ? choice[2].get()
              : choice[2];

            var isFinal = foam.core.Slot.isInstance(choice[4])
              ? choice[4].get()
              : choice[4];

            if ( ! isSelected && ! isFinal ) {
              choice[3] = this.mustSlot(choice[3]);
              choice[3].set(foam.u2.DisplayMode.DISABLED);
            }
          });
        }
      }
    },
    {
      class: 'Boolean',
      name: 'showMinMaxHelper',
      value: true
    },
    {
      class: 'Boolean',
      name: 'isValidNumberOfChoices',
      expression: function(minSelected, maxSelected, selectedChoices){
        return selectedChoices.length >= minSelected && selectedChoices.length <= maxSelected;
      }
    },
    {
      class: 'Int',
      name: 'minSelected',
      expression: function(choices) {
        return choices.length > 0 ? 1 : 0;
      }
    },
    {
      class: 'Int',
      name: 'maxSelected',
      value: 2
    },
    {
      class: 'Boolean',
      name: 'isVertical',
      value: false
    },
    {
      class: 'Boolean',
      name: 'isDaoFetched',
      value: false
    },
    {
      name: 'objToChoice',
      class: 'Function',
      value: function(obj) {
        return [obj.id, obj.toSummary()];
      }
    },
    {
      name: 'helpText_',
      expression: function(minSelected, maxSelected) {
        // TODO: Change this when formatted messages are supported
        return ( maxSelected > 0 )
          ? ( minSelected == maxSelected )
            ? ( minSelected == 1 )
              ? this.CHOOSE_1_OF_FOLLOWING_OPTIONS
              : `${this.CHOOSE_EXACTLY} ${minSelected} ${this.OPTIONS_MSG}`
            : `${this.CHOOSE} ${minSelected} - ${maxSelected} ${this.OPTIONS_MSG}`
          : ( minSelected == 1 )
            ? this.CHOOSE_AT_LEAST_1_OPTION
            : `${this.CHOOSE_AT_LEAST} ${minSelected} ${this.OPTIONS_MSG}`
          ;
      }
    }
  ],

  methods: [
    function initE() {
      var self = this;

      this.onDAOUpdate();

      this
        .start()
          .add(self.slot(function(showMinMaxHelper, helpText_) {
            return self.E().callIf(showMinMaxHelper, function() {
              this
              .start(foam.u2.layout.Rows)
                .start()
                  .addClass(self.myClass('helpTextRow'))
                  .add(self.helpText_)
                .end()
              .end();
            });
          }))
        .end()
        .start(self.isVertical ? foam.u2.layout.Rows : foam.u2.layout.Cols)
          .addClass(self.myClass('flexer'))
          .add( // TODO isDoaFetched and simpSlot0 aren't used should be clean up
            self.isDaoFetched$.map(isDaoFetched => {
              var newChoices = [];

              var toRender = self.choices.map(function(choice) {
                var simpSlot0 = self.mustSlot(choice[0]);
                var simpSlot1 = self.mustSlot(choice[1]);
                var simpSlot2 = self.mustSlot(choice[2]);
                var simpSlot3 = self.mustSlot(choice[3]);
                var simpSlot4 = self.mustSlot(choice[4]);

                newChoices = [
                  ...newChoices,
                  [choice[0], simpSlot1, simpSlot2, simpSlot3, simpSlot4]
                ];
                var cap = choice[2] && choice[2].obj && choice[2].obj.capability;
                var cls =  cap && cap.cls_.id;
                return self.E()
                  .addClass(self.myClass('innerFlexer'))
                  // NOTE: This should not be the way we implement columns.
                  .style({
                    'width': `${100 / self.NUM_COLUMNS}%`
                  })
                  .tag(self.CardSelectView, {
                      data$: simpSlot2,
                      label$: simpSlot1,
                      mode$: simpSlot3,
                      of: cls,
                      obj: cap
                    });
              });

              this.choices = newChoices;

              self.selectedChoices$ = foam.core.ArraySlot.create({
                slots: newChoices.map(choice => {
                  return this.mustSlot(choice[2]);
                })
              }).map(v => {
                var selectedChoices = [];
                v.forEach((w, i) => {
                  if ( w ) {
                    selectedChoices.push(this.choices[i]);
                  }
                });
                return selectedChoices;
              });
              return toRender;
            })
          )
        .end();
    },

    function mustSlot(v) {
      return foam.core.Slot.isInstance(v) ?
        v :
        foam.core.SimpleSlot.create({ value: v });
    }
  ],

  listeners: [
    {
      name: 'onDAOUpdate',
      isFramed: true,
      code: function() {
        if ( ! this.dao || ! foam.dao.DAO.isInstance(this.dao) ) return;

        var of = this.dao.of;
        if ( of._CHOICE_TEXT_ ) {
          this.dao.select(this.PROJECTION(of.ID, of._CHOICE_TEXT_)).then(s => {
            this.choices      = s.projection;
            this.isDaoFetched = true;
          });
          return;
        }
        console.warn('Inefficient ChoiceView. Consider creating transient _choiceText_ property on ' + of.id + ' DAO, prop: ' + this.prop_);

        /* Ex.:
        {
          class: 'String',
          name: '_choiceText_',
          transient: true,
          javaGetter: 'return getName();',
          getter: function() { return this.name; }
        }
        */
        var p = this.mode === foam.u2.DisplayMode.RW ?
          this.dao.select().then(s => s.array) :
          this.dao.find(this.data).then(o => o ? [o] : []);

        p.then(a => {
          var choices = a.map(this.objToChoice);
          var choiceLabels = a.map(o => this.objToChoice(o)[1]);
          Promise.all(choiceLabels).then(resolvedChoiceLabels => {
            for ( let i = 0; i < choices.length; i++ ) {
              choices[i][1] = resolvedChoiceLabels[i];
            }
            this.choices = choices;
            this.isDaoFetched = true;
          });
        });
      }
    }
  ]
});
