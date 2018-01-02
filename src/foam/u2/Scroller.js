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
  package: 'foam.u2',
  name: 'Scroller',
  extends: 'foam.u2.Element',

  /**
   * Wraps a TableView or similar and adds a ScrollView to it.
   * Configure the table view with the tableView property, and the scrollbar
   * with the scrollView property.
   * Set data to the DAO, and the tableView will receive that DAO with skip
   * applied correctly.
   *
   * This view needs to know the size of its container, in order to size the
   * tableView and scrollbar accordingly. Therefore it needs a fixed row height
   * to use for the table. Set rowHeight to the number of pixels per row.
   */
  requires: [
    'foam.graphics.Canvas',
    'foam.graphics.ScrollCView',
    'foam.mlang.sink.Count',
    'foam.u2.TableView',
    'foam.u2.ViewSpec'
  ],

  imports: [
    'window'
  ],

  css: `
    ^ {
      display: flex;
      flex-grow: 1;
      overflow: hidden;
    }
    ^container {
      flex-grow: 1;
      overflow-x: auto;
      overflow-y: hidden;
    }
    ^ canvas {
      align-self: flex-start;
      flex-grow: 0;
      flex-shrink: 0;
    }
  `,

  properties: [
    {
      name: 'of',
      expression: function(data) { return data.of; }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'data',
      required: true
    },
    {
      class: 'Int',
      name: 'rowHeight',
      value: 36
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'tableView',
      value: { class: 'foam.u2.TableView' }
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'scrollView',
      value: { class: 'foam.graphics.ScrollCView' }
    },
    {
      /** The actual TableView instance. */
      name: 'table'
    },
    {
      /** The actual ScrollCView instance. */
      name: 'scrollBar'
    },
    'scrollValue_',
    'scrollHeight_',
    'scrollExtent_',
    'pointer'
  ],

  methods: [
    function initE() {
      var self = this;

      this.data$proxy.sub('on', this.onDAOUpdate);
      this.onDAOUpdate();

      this.scrollBar = this.createChild_(this.scrollView, {
        value$:  this.scrollValue_$,
        extent$: this.scrollExtent_$,
        height$: this.scrollHeight_$
      });

      this.addClass(this.myClass())
          .start()
              .addClass(this.myClass('container'))
              .call(function() { self.table = this; })
              .start(this.tableView, {
                of: this.of,
                data$: this.slot(function(dao, extent, value) {
                  return dao.limit(extent).skip(value);
                }, this.data$, this.scrollExtent_$, this.scrollValue_$)
              }).end()
          .end()
          .start(this.Canvas)
              .attrs({ height: this.scrollHeight_$ })
              .call(function() { this.cview = self.scrollBar; })
          .end()
          .on('wheel', function(e) {
            var negative = e.deltaY < 0;
            // Convert to rows, rounding up. (Therefore minumum 1.)
            var rows = Math.ceil(Math.abs(e.deltaY) / self.rowHeight);
            self.scrollValue_ += negative ? -rows : rows;
          });

      this.onload.sub(function() {
        self.onResize();
        self.window.addEventListener('resize', self.onResize);
      });

      this.onunload.sub(function() {
        self.window.removeEventListener('resize', self.onResize);
      });
    }
  ],

  listeners: [
    {
      name: 'onResize',
      isFramed: true,
      code: function() {
        if ( ! this.el() ) return;

        // Determine the height of the table's space.
        var height = this.el().getBoundingClientRect().height;
        this.scrollHeight_ = height;
        this.scrollExtent_ = Math.floor(height / this.rowHeight);
      }
    },
    {
      name: 'onDAOUpdate',
      isFramed: true,
      code: function() {
        var self = this;
        this.data.select(this.Count.create()).then(function(c) {
          self.scrollBar.size = c.value;
        });
      }
    }
  ]
});
