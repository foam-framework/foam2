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
      justify-content:flex-start;
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
        An array of choices which are single choice is denoted as [value, label, isFinal]

      `,
      factory: function() {
        return [];
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao',
      documentation: `
        If the user wants to be able to export data as a dao, then this needs to be filled out.

        If the user just wants to pass in a dao and no choices array, useDao should be true as well and it will be processed to populate the
        choices array instead of manually inputing the choices
      `
    },
    {
      class: 'Boolean',
      name: 'useDao'
    },
    {
      class: 'Boolean',
      name: 'showMinMaxHelper',
      value: true
    },
    {
      class: 'Boolean',
      name: 'isValidNumberOfChoices',
      expression: function(minSelected, maxSelected, data){
        return data.length >= minSelected && data.length <= maxSelected;
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
    },
    {
      name: 'data',
      value: []
    }
  ],

  methods: [
    function outputSelectedChoicesInDAO() {
      if ( ! this.isValidNumberOfChoices || ! this.dao ) {
        console.warn("Please select a valid number of choices");
        return foam.dao.NullDAO;
      }

      var of = this.dao.of

      return this.dao.where(this.IN(of.ID, this.data));
    },

    function isChoiceSelected(data, choice){
      for ( var i = 0 ; i < data.length ; i++ ) {
        if ( foam.util.equals(data[i], choice) ) return true;
      }
      return false;
    },

    function getIndexOfChoice(data, choice){                          
      for ( var i = 0 ; i < data.length ; i++ ) {
        if ( foam.util.equals(data[i], choice) ) return i;
      }
      return -1;
    },

    function getSelectedSlot(choice) {
      var slot = foam.core.SimpleSlot.create();
      slot.sub(() => {
        var arr = [
          ...this.data,
        ];
        arr = arr.filter(o => ! foam.util.equals(o, choice));
        if ( slot.get() ) { 
          arr.push(choice); 
        }
        this.data = arr;
      });
      this.data$.sub(()=> slot.set(this.isChoiceSelected(this.data, choice)));
      slot.set(this.isChoiceSelected(this.data, choice));
      return slot;
    },

    function initE() {
      var self = this;

      this.onDAOUpdate();

      this
        .start()
          .add(this.slot(function(showMinMaxHelper, helpText_) {
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
        .start(this.isVertical ? foam.u2.layout.Rows : foam.u2.layout.Cols)
          .addClass(this.myClass('flexer'))
          .add( // TODO isDoaFetched and simpSlot0 aren't used should be clean up
            this.isDaoFetched$.map(isDaoFetched => {
              var toRender = this.choices.map((choice, index) => {
                var valueSimpSlot = this.mustSlot(choice[0]);
                var labelSimpSlot = this.mustSlot(choice[1]);

                var isFinal = choice[2];
                
                var isSelectedSlot = self.slot(function(choices, data) {
                  try {
                    var isSelected = self.isChoiceSelected(data, choices[index][0]);
                    return !! isSelected;
                  } catch(err) {
                    console.error('isSelectedSlot', err)
                    return false;
                  }
      
                });

                var isDisabledSlot = self.slot(function(choices, data, maxSelected) {
                  try {
                      if ( isFinal ) {
                        return true;
                      }
  
                      var isSelected = self.isChoiceSelected(data, choices[index][0]);
  
                      return !! (! isSelected && data.length >= maxSelected);
                  } catch(err) {
                    console.error('isDisabledSlot', err);
                    return false;
                  }
                });
                
                var cls =  choice[0] && choice[0].cls_.id;

                var selfE = self.E();

                return selfE
                  .addClass(self.myClass('innerFlexer'))
                  // NOTE: This should not be the way we implement columns.
                  .style({
                    'width': `${100 / self.NUM_COLUMNS}%`
                  })
                  .start(self.CardSelectView, {
                    data$: valueSimpSlot,
                    label$: labelSimpSlot,
                    isSelected$: isSelectedSlot,
                    isDisabled$: isDisabledSlot, 
                    of: cls
                  })
                    .call(function () {
                      selfE.onDetach(
                        this.clicked.sub(() => {
                          var array;
                          var indexDataToAdd = self.getIndexOfChoice(self.data, valueSimpSlot.get());
                          if ( indexDataToAdd === -1 ){
                            if ( self.data.length >= self.maxSelected ){
                              return;
                            }

                            array = [
                              ...self.data,
                              valueSimpSlot.get()
                            ];
                          } else {
                            array = [
                              ...self.data
                            ]

                            array.splice(indexDataToAdd, 1);
                          }
                          self.data = array;
                        })
                      )
                    })
                  .end()

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
        if ( ! this.useDao && ! this.dao || ! foam.dao.DAO.isInstance(this.dao) ) return;

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
