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
  name: 'Test',

  properties: [
    {
      class: 'Int',
      label: 'How wide would you like your text field?',
      name: 'width',
      value: 30
    },
    {
      class: 'String',
      name: 'stringValue',
      view: function(_, X) {
        return X.data.slot(function(width) {
          return foam.u2.TextField.create({size: width, data$: this.stringValue$, placeholder: width});
        });
      }
    },
    {
      name: 'typeOfDays',
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: [
          'All',
          'Week Days',
          'Weekends'
        ]
      }
    },
    {
      name: 'daysOfWeek',
      view: function(_, X) {
        return X.data.slot(function(typeOfDays) {
          var map = {
            All: [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ],
            'Week Days': [ 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday' ],
            Weekends: [ 'Sunday', 'Saturday' ],
          };
          return foam.u2.view.ChoiceView.create({choices: map[typeOfDays], data$: this.daysOfWeek$});
        });
      }
    }
  ]
});


var t = Test.create({stringValue: 'This is a test!', typeOfDays: 'All'});
foam.u2.DetailView.create({data: t}).write();
