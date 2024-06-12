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
foam.ENUM({
  package: 'foam.demos.olympics',
  name: 'MedalColor',
  values: [
    {
      name: 'GOLD',
      label: 'Gold'
    },
    {
      name: 'SILVER',
      label: 'Silver'
    },
    {
      name: 'BRONZE',
      label: 'Bronze'
    }
  ]
});

foam.CLASS({
  package: 'foam.demos.olympics',
  name: 'Medal',

  properties: [
    { name: 'id', hidden: true },
    { class: 'Int', name: 'year', shortName: 'y' },
    {
      class: 'Enum',
      of: 'foam.demos.olympics.MedalColor',
      name: 'color',
      shortName: 'c',
      aliases: [ 'colour', 'medal' ],
      tableCellView: function(medal, e) {
        return e.E('span').addClass(medal.color.label).add(medal.color.label);
      },
      searchView: {
        class: 'foam.u2.search.GroupBySearchView',
        viewSpec: {
          class: 'foam.u2.view.ChoiceView',
          selectSpec: {
            class: 'foam.u2.tag.Select',
            size: 4
          }
        }
      }
    },
    { name: 'city', shortName: 'cy' },
    { name: 'country', shortName: 'cn' },
    { name: 'discipline', shortName: 'd', hidden: true },
    { name: 'sport', shortName: 's' },
    { name: 'event', shortName: 'e' },
    { name: 'eventGender', shortName: 'eg', value: 'M', hidden: true },
    {
      name: 'gender',
      shortName: 'g',
      aliases: [ 'sex' ],
      value: 'Men',
      searchView: {
        class: 'foam.u2.search.GroupBySearchView',
        viewSpec: {
          class: 'foam.u2.view.ChoiceView',
          selectSpec: {
            class: 'foam.u2.tag.Select',
            size: 3
          }
        }
      }
    },
    { name: 'firstName', shortName: 'f', aliases: [ 'fname', 'fn', 'first' ] },
    { name: 'lastName', shortName: 'l', aliases: [ 'lname', 'ln', 'last' ] }
  ]
});
