/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'MultiChoiceView',
  extends: 'foam.u2.View',

  requires:  [
    'foam.core.ArraySlot',
  ],

  documentation: `
    Wraps a tag that represents multiple choices. 

    The choices are [value, label, isSelected ] triplets. this.choice is the current
    pair, this.data the current value. this.text is the current label,
    this.label is the label for the whole view (eg. "Medal Color", not
    "Gold", false).
    For now choices can only be provided as an array (this.choices)

    this.booleanView is a ViewSpec for each choice. It defaults to
    foam.u2.CheckBox
  `,

  properties: [
    {
      name: 'choices',
      documentation: `
        An array of choices which are single choice is denoted as [value, label, isSelected]
      `,
      factory: function() {
        return [["test1", "test1", false], ["test2", "test2", false], ["test3", "test3", true]];
      },
      postSet: function(o,n){
        console.log("hit");
        console.log(n);
      },
    },
    {
      class: 'Int',
      name: 'minSelected',
      value: 1
    },
    {
      class: 'Int',
      name: 'maxSelected',
      expression: function (choices) {
        return choices.length;
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
        .add(
          this.choices.map(function (choice) {
            var simpSlot1 = foam.core.SimpleSlot.create({ value: choice[2] });
            var simpSlot2 = foam.core.SimpleSlot.create({ value: choice[1] });

            arraySlotForChoices.slots.push(simpSlot1);
            arraySlotForChoices.slots.push(simpSlot2);

            return self.E()
              .tag(self.booleanView, {
                data$: simpSlot1,
                label$: simpSlot2
              });
          })
        )

      this.choices$.follow(arraySlotForChoices);
    }
  ]
});
