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
      margin-left: 180px;
      margin-bottom: 10px;
    }
    ^ .property-verified {
      margin-left: 20px;
      margin-bottom: 10px;
    }
    ^ .property-structure {
      margin-left: 215px;
      margin-bottom: 10px;
    }
    ^ .property-streetNumber {
      width: 110px;
      margin-bottom: 10px;
    }
    ^ .property-streetName {
      width: 160px;
      margin-left: 114px;
      margin-bottom: 10px;
    }
    ^ .property-address {
      width: 200px;
      margin-bottom: 10px;
    }
    ^ .property-address2 {
      width: 200px;
      margin-left: 23px;
      margin-bottom: 10px;
    }
    ^ .property-suite {
      width: 90px;
      margin-left: 60px;
      margin-bottom: 10px;
    }
    ^ .property-city {
      width: 110px;
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
      margin-left: 110px;
      margin-bottom: 10px;
    }
    ^ .frequency-div {
      display: inline-block;
      margin: 0 36px 20px 0;
    }
  `,

  methods: [
    function initE() {
      this.SUPER();

      this.
        addClass(this.myClass()).
        start().
          start().
            start('p').style({'display': 'inline', 'margin-top': '10px'}).add('Country').end().
            start('p').style({'display': 'inline', 'margin-top': '10px', 'margin-left': '170px'}).add(this.data.TYPE.label).end().
          end().
          start().
            add(this.data.COUNTRY_ID).add(this.data.TYPE).
          end().
          start().
            start('p').style({'display': 'inline', 'margin-top': '10px'}).add(this.data.VERIFIED.label).end().
            start('p').style({'display': 'inline', 'margin-left': '170px', 'margin-top': '10px'}).add(this.data.STRUCTURE.label).end().
          end().
          start().
            add(this.data.VERIFIED).add(this.data.STRUCTURE).
          end().
          startContext({data: this.data}).
            start().hide(this.data.structure$).
              start().
                start('p').style({'display': 'inline'}).add('Address1').end().
                start('p').style({'display': 'inline', 'margin-left': '158px'}).add(this.data.ADDRESS2.label).end().
              end().
              start().
                add(this.data.ADDRESS).add(this.data.ADDRESS2).
              end().
            end().

            start().show(this.data.structure$).
              start().
                start('p').style({'display': 'inline'}).add(this.data.STREET_NUMBER.label).end().
                start('p').style({'display': 'inline', 'margin-left': '120px'}).add(this.data.STREET_NAME.label).end().
                start('p').style({'display': 'inline', 'margin-left': '125px'}).add(this.data.SUITE.label).end().
              end().
              start().
                add(this.data.STREET_NUMBER).add(this.data.STREET_NAME).add(this.data.SUITE).
              end().
            end().
          endContext().
          start().
            start('p').style({'display': 'inline'}).add(this.data.CITY.label).end().
            start('p').style({'display': 'inline', 'margin-left': '195px'}).add('Province/State').end().
          end().
          start().
            add(this.data.CITY).add(this.data.REGION_ID).
          end().
        end()
    }
  ]
});
