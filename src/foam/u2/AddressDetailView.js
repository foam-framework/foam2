/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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
  package: 'foam.u2',
  name: 'AddressDetailView',
  extends: 'foam.u2.View',

  documentation: 'Address Detail View',

  requires: [ 'foam.nanos.auth.Address' ],

  css: `
    ^ {
      height: auto;
    }
    ^ .property-type {
      width: 120px;
      margin-bottom: 10px;
    }
    ^ .property-verified {
      margin-left: 100px;
      margin-bottom: 10px;
    }
    ^ .property-buildingNumber {
      width: 120px;
      margin-bottom: 10px;
    }
    ^ .property-address {
      width: 250px;
      margin-left: 100px;
      margin-bottom: 10px;
    }
    ^ .property-suite {
      width: 120px;
      margin-bottom: 10px;
    }
    ^ .property-city {
      width: 120px;
      margin-left: 100px;
      margin-bottom: 10px;
    }
    ^ .property-postalCode {
      width: 120px;
      margin-bottom: 10px;
    }
    ^ .property-countryId {
      display: inline;
      margin-bottom: 10px;
    }
    ^ .property-regionId {
      display: inline;
      margin-left: 180px;
      margin-bottom: 10px;
    }
  `,

  methods: [
    function initE() {
      this.SUPER();

      this.
        addClass(this.myClass()).
        start().
          start().
            start('p').style({'display': 'inline', 'margin-top': '10px'}).add(this.data.TYPE.label).end().
            start('p').style({'display': 'inline', 'margin-left': '185px', 'margin-top': '10px'}).add(this.data.VERIFIED.label).end().
          end().
          start().
            add(this.data.TYPE).add(this.data.VERIFIED).
          end().
          start().
            start('p').style({'display': 'inline'}).add(this.data.BUILDING_NUMBER.label).end().
            start('p').style({'display': 'inline', 'margin-left': '98px'}).add(this.data.ADDRESS.label).end().
          end().
          start().
            add(this.data.BUILDING_NUMBER).add(this.data.ADDRESS).
          end().
          start().
            start('p').style({'display': 'inline'}).add(this.data.SUITE.label).end().
            start('p').style({'display': 'inline', 'margin-left': '180px'}).add(this.data.CITY.label).end().
          end().
          start().
            add(this.data.SUITE).add(this.data.CITY).
          end().
          start().
            start('p').style({'display': 'inline'}).add(this.data.POSTAL_CODE.label).end().
          end().
          start().
            add(this.data.POSTAL_CODE).
          end().
          start().
            start('p').style({'display': 'inline'}).add('Country').end().
            start('p').style({'display': 'inline', 'margin-left': '165px'}).add('Province/State').end().
          end().
          start().
            add(this.data.COUNTRY_ID).add(this.data.REGION_ID).
          end().
        end()
    }
  ]
});
