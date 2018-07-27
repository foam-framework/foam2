/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
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
  name: 'MNRowFormatter',
  implements: [ 'foam.u2.RowFormatter' ],

  css: `
    .mn-row {
      height: 100%;
      display: flex;
    }
    .mn-row .row-id {
      flex-grow: 1;
    }
    .mn-row .row-data {
      display: flex;
      flex-grow: 3;
    }
    .mn-row .row-value {
      flex-grow: 1;
      background-color: #ddd;
      justify-content: center;
      align-items: center;
      display: flex;
    }
    .mn-row .row-value.yes {
      background-color: #0f0;
    }
    .mn-row .row-value.no {
      background-color: #f00;
    }
    .mn-row .row-value * {
      background-color: inherit;
    }
  `,

  methods: [
    function format(data) {
      // TODO(markdittmer): Sanitize data with HTML lib escapeString().
      if ( ! data ) {
        console.log('Render missing data');
        return `<div class="mn-row"></div>`;
      }
      var dataMarkup = '';
      var innerData = data.data;
      for ( var i = 0; i < innerData.length; i++ ) {
        var datum = innerData[i];
        dataMarkup += `<div class="row-value ${datum ? 'yes' : 'no'}">
          ${datum ? '&#10003;' : '&#215;'}
        </div>`;
      }
      return `<div class="mn-row">
        <div class="row-id">${data.id}</div>
        <div class="row-data">
          ${dataMarkup}
        </div>
      </div>`;
    }
  ]
});
