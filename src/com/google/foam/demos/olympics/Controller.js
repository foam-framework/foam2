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
  package: 'com.google.foam.demos.olympics',
  name: 'Controller',
  extends: 'foam.u2.search.FilterController',
  requires: [
    'com.google.foam.demos.olympics.Medal',
    'foam.dao.EasyDAO',
    'foam.dao.MDAO',
    'foam.dao.NullDAO',
    'foam.dao.ProxyDAO',
    'foam.graphics.Canvas',
    'foam.graphics.ScrollCView',
    'foam.net.XHRHTTPRequest',
    'foam.u2.TableView'
  ],

  imports: [
    'window'
  ],

  constants: {
    CSS_NAME: 'foam-u2-search-FilterController',
    ROW_HEIGHT: 36
  },

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

        var xhr = this.XHRHTTPRequest.create({
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
          self.onPredicateChange();
          self.updateCount();
          proxy.delegate = dao;
        });

        return proxy;
      }
    },
    [ 'allowAddingFilters', false ],
    [ 'textSearch', true ],
    [ 'addingSpec', 'paper-material' ],
    [ 'filterAreaSpec', 'paper-material' ],
    {
      class: 'StringArray',
      name: 'searchFields',
      factory: function() {
        return [
          'color',
          'year',
          'city',
          'sport',
          'event',
          'country',
          'gender'
        ];
      }
    },
    'scroller_',
    'container_',
    'scrollExtent',
    'scrollHeight'
  ],

  methods: [
    function tableE(parent) {
      var self = this;
      var canvas = this.Canvas.create(null, parent);
      canvas.attrs({ height: this.scrollHeight$ });

      var scroller = this.ScrollCView.create({
        borderColor: '#e0e0e0',
        handleColor: '#3f51b5',
        size: 0,
        extent$: this.scrollExtent$,
        height$: this.scrollHeight$
      }, canvas);
      canvas.cview = scroller;
      this.scroller_ = scroller;

      this.window.addEventListener('resize', this.onResize);

      parent.on('wheel', function(e) {
        var negative = e.deltaY < 0;
        // Convert to rows, rounding up. (Therefore minumum 1.)
        var rows = Math.ceil(Math.abs(e.deltaY) / self.ROW_HEIGHT);
        scroller.value += negative ? -rows : rows;
      });
      this.container_ = parent.start().cssClass(this.myCls('table-container'));
      this.container_.start(this.TableView, {
            of: this.data.of,
            data$: this.slot(function(dao, extent, value) {
              return dao.limit(extent).skip(value);
            }, this.filteredDAO$, scroller.extent$, scroller.value$),
            editColumnsEnabled: true,
            title$: this.title$
          })
          .end()
      .end();

      this.onload.sub(this.onResize);

      parent.add(canvas);
    }
  ],

  listeners: [
    {
      // This overrides the method in the parent class, and does its work as
      // well as my own.
      name: 'onPredicateChange',
      isFramed: true,
      code: function() {
        this.filteredDAO.select(this.Count.create()).then(function(c) {
          this.count = c.value;
          this.scroller_.size = c.value;
        }.bind(this));
      }
    },
    {
      name: 'onResize',
      isFramed: true,
      code: function() {
        // Determine the size of the results area.
        var height = this.container_.el().getBoundingClientRect().height;
        this.scrollHeight = height;
        this.scrollExtent = Math.floor(height / this.ROW_HEIGHT);
      }
    }
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          font-family: Roboto, Arial, sans-serif;
          flex-grow: 1;
          width: 100%;
        }

        ^adding {
          border: none !important;
          flex-shrink: 0;
          flex-grow: 0;
        }
        ^filter-area {
          flex-grow: 1;
          overflow-y: auto;
        }
        ^filters {
        }

        ^filter-container {
          margin: 6px 8px 0px !important;
        }

        ^results ^table-container {
          flex-grow: 1;
          overflow-x: auto;
          overflow-y: hidden;
        }
        ^results canvas {
          align-self: flex-start;
          flex-grow: 0;
          flex-shrink: 0;
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
      */}
    })
  ]
});
