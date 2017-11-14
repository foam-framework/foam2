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
    ^ .foam-u2-TextField {
      width: 400px;
    }
    ^ .property-countryId {
      display: inline;
      margin-left: 10px;
    }
    ^ .property-regionId {
      display: inline;
      margin-left: 10px;
    }
  `,

  methods: [
    function initE() {
      this.SUPER();

      this.
        addClass(this.myClass()).
        start('table').
        start('tr').start('td').add(this.data.TYPE.label, this.data.TYPE).end().end().
        start('tr').start('td').add(this.data.VERIFIED.label, this.data.VERIFIED).end().end().
        start('tr').start('td').add(this.data.DELETED.label, this.data.DELETED).end().end().
        start('tr').start('td').add(this.data.BUILDING_NUMBER.label, this.data.BUILDING_NUMBER).end().end().
        start('tr').start('td').add(this.data.ADDRESS.label, this.data.ADDRESS).end().end().
        start('tr').start('td').add(this.data.SUITE.label, this.data.SUITE).end().end().
        start('tr').start('td').add(this.data.CITY.label, this.data.CITY).end().end().
        start('tr').start('td').add(this.data.POSTAL_CODE.label, this.data.POSTAL_CODE).end().end().
        start('tr').start('td').add(this.data.COUNTRY_ID.label, this.data.COUNTRY_ID).end().end().
        start('tr').start('td').add(this.data.REGION_ID.label, this.data.REGION_ID).end().end().
        start('tr').start('td').add(this.data.ENCRYPTED.label, this.data.ENCRYPTED).end().end().
        end()
    }
  ]
});
