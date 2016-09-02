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
  extends: 'foam.u2.search.FilterController',
  requires: [
    'foam.dao.EasyDAO',
    'foam.dao.MDAO',
    'foam.dao.NullDAO',
    'foam.dao.ProxyDAO',
    'foam.demos.olympics.Medal',
    'foam.graphics.Canvas',
    'foam.graphics.ScrollCView',
    'foam.net.XHRHTTPRequest',
    'foam.u2.TableView'
  ],

  constants: {
    CSS_NAME: 'foam-u2-search-FilterController'
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
    {
      class: 'StringArray',
      name: 'searchFields',
      factory: function() {
        return [
          'color',
          'year',
          'city',
          'discipline',
          'event',
          'country',
          'gender'
        ];
      }
    },
    'scroller_'
  ],

  methods: [
    function tableE(parent) {
      var self = this;
      var canvas = this.Canvas.create(null, parent);

      var scroller = this.ScrollCView.create({
        size: 0,
        //size: 1000,
        extent: 10
      }, canvas);
      canvas.cview = scroller;
      this.scroller_ = scroller;

      parent.on('wheel', function(e) {
        scroller.value += e.deltaY > 0 ? 3 : -3;
      });
      parent.start().cssClass(this.myCls('table-container'))
          .start(this.TableView, {
            data$: this.slot(function(dao, extent, value) {
              return dao.limit(extent).skip(value);
            }, this.filteredDAO$, scroller.extent$, scroller.value$),
            editColumnsEnabled: true,
            title$: this.title$
          })
          .end()
      .end();

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
    }
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          font-family: Roboto, Arial, sans-serif;
        }
        ^results {
          display: flex;
        }
        ^results ^table-container {
          flex-grow: 1;
          overflow-x: auto;
        }
        ^results canvas {
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
      */}
    })
  ]
});
