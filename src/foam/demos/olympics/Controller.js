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
  package: 'foam.demos.olympics',
  name: 'Controller',
  extends: 'foam.u2.Element',

  requires: [
    'foam.demos.olympics.Medal',
    'foam.dao.EasyDAO',
    'foam.dao.MDAO',
    'foam.dao.NullDAO',
    'foam.dao.ProxyDAO',
    'foam.net.web.XMLHTTPRequest',
    'foam.u2.Scroller',
    'foam.u2.search.FilterController'
  ],

  imports: [
    'window'
  ],

  properties: [
    {
      name: 'data',
      factory: function() {
        var dao = this.EasyDAO.create({
          of: this.Medal,
          seqNo: true,
          autoIndex: true,
          daoType: this.MDAO
        });

        var proxy = this.ProxyDAO.create({
          of: this.Medal,
          delegate: this.NullDAO.create({ of: this.Medal })
        });

        var xhr = this.XMLHTTPRequest.create({
          responseType: 'json',
          method: 'GET'
        });
        xhr.fromUrl('https://raw.githubusercontent.com/foam-framework/foam/' +
                    'master/js/foam/demos/olympics/MedalData.json');
        var self = this;
        xhr.send().then(function(res) {
          return res.payload;
        }).then(function(json) {
          for ( var i = 0; i < json.length; i++ ) {
            dao.put(self.Medal.create(json[i]));
          }
          proxy.delegate = dao;
        });

        return proxy;
      }
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'filterController',
      value: {
        class: 'foam.u2.search.FilterController',
        textSearch: true,
        rowHeight: 64,
        allowAddingFilters: false,
        tableView: { class: 'foam.u2.Scroller' },
        searchFields: [
          'color',
          'year',
          'city',
          'sport',
          'event',
          'country',
          'gender'
        ]
      }
    }
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass());
      this.start(this.filterController, { data: this.data }).end();
    }
  ],

  axioms: [
    foam.u2.CSS.create({
      code: `
        ^ {
          display: flex;
          flex-grow: 1;
          font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
          width: 100%;
        }

        .Gold {
          color: #c98910;
        }
        .Silver {
          color: #a8a8a8;
        }
        .Bronze {
          color: #965a38;
        }

        td {
          padding: 8px;
        }
      `
    })
  ]
});
