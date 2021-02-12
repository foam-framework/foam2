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
  package: 'foam.u2.view',
  name: 'ScrollDAOView',
  extends: 'foam.u2.Element',
  implements: [ 'foam.mlang.Expressions' ],

  documentation: 'A DOM-based native scrolling view over for a DAO.',

  css: `
    ^ {
      margin: 0;
      padding: 0;
      overflow-x: hidden;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      width: 100%;
      height: 100%;
      position: absolute;
      box-sizing: border-box;
      contain: layout;
      will-change: transform;
    }
  `,

  requires: [
    'foam.dao.QuickSink',
    'foam.u2.ViewSpec'
  ],

  imports: [
    'selection as importedSelection',
    'selectionEnabled as importedSelectionEnabled'
  ],

  // Provide most state to inner controller and views.
  exports: [
    'anchorDAOIdx_',
    'anchorRowIdx_',
    'batchSize',
    'count_',
    'data',
    'modNumRows_',
    'negativeRunway',
    'numRows',
    'positiveRunway',
    'rows_',
    'rowFormatter',
    'selection',
    'selectionEnabled'
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'data',
      documentation: 'The DAO to the full set of data visible to this view.',
      postSet: function(old, nu) {
        if ( old === nu ) return;
        this.listenSub_ && this.listenSub_.detach();
        if ( ! nu ) return;

        var self = this;
        self.listenSub_ = nu.listen(this.QuickSink.create({
          // TODO(markdittmer): Model this?
          resetFn: function() { self.countRecords_(); }
        }));
        self.countRecords_();
      },
      required: true
    },
    {
      class: 'FObjectProperty',
      of: 'foam.u2.RowFormatter',
      name: 'rowFormatter',
      documentation: `data => HTML-markup-string formatter for individual rows.
          This strategy is used instead of Elements to maximize scroll
          performance.`,
      preSet: function(_, nu) {
        return nu && nu.clone ? nu.clone(this) : nu;
      },
      required: true
    },
    {
      class: 'Int',
      name: 'rowHeight',
      documentation: 'Fixed of pixels per row.',
      value: 40,
      required: true,
      final: true
    },
    {
      class: 'Int',
      name: 'numRows',
      documentation: 'Fixed number of rows to recycle within this view.',
      value: 20,
      required: true,
      final: true
    },
    {
      class: 'Int',
      name: 'negativeRunway',
      documentation: 'Number of records to load before anchor row.',
      value: 500
    },
    {
      class: 'Int',
      name: 'positiveRunway',
      documentation: 'Number of records to load after+including anchor row.',
      value: 500
    },
    {
      class: 'Int',
      name: 'rowOffset',
      expression: function(numRows) { return Math.floor(numRows * 0.4); }
    },
    {
      class: 'Int',
      name: 'batchSize',
      documentation: `Size for batch of data to fetch from DAO. This view will
          keep fetching batches until it fills out all rows, but requesting
          batches limits the number of rows to be processed per animation
          frame.`,
      value: 25
    },
    {
      class: 'Boolean',
      name: 'selectionEnabled',
      factory: function() {
        return !! this.importedSelectionEnabled;
      }
    },
    {
      class: 'Array',
      name: 'selection',
      adapt: function(_, nu) {
        if ( foam.Null.isInstance(nu) || foam.Undefined.isInstance(nu) )
          return [];

        return foam.Array.isInstance(nu) ? nu : [nu];
      },
    },
    {
      class: 'FObjectProperty',
      // of: 'DAOController',
      name: 'daoController_',
      documentation: `Private component responsible for fetching batches of data
          and efficiently rendering in-view data as it arrives.`,
      factory: function() { return this.DAOController.create(); }
    },
    {
      name: 'listenSub_',
      documentation: 'Subscription used to listen for DAO reset.',
      value: null,
      transient: true
    },
    {
      class: 'Int',
      name: 'anchorRowIdx_',
      documentation: 'Anchor index in "rows_" array.',
      factory: function() { return this.negativeRunway; },
      transient: true
    },
    {
      class: 'Int',
      name: 'anchorDAOIdx_',
      documentation: `Anchor index relative to top of view (i.e., to first
          record in "dao").`,
      transient: true
    },
    {
      class: 'Int',
      name: 'count_',
      documentation: 'Count of records to display in this view.'
    },
    {
      class: 'FObjectArray',
      of: 'foam.u2.Element',
      name: 'rows_',
      documentation: 'Direct child views of this view to recycle.',
      factory: function() {
        var rows = new Array(this.numRows);
        for ( var i = 0; i < rows.length; i++ ) {
          rows[i] = this.Row.create();
        }
        return rows;
      },
      transient: true
    },
    {
      class: 'FObjectProperty',
      of: 'foam.u2.Element',
      name: 'sentinel_',
      documentation: `Absolutely positioned single pixel that establishes the
          height of the scroll container.`,
      factory: function() {
        return this.E('div').style({
          width: '1px',
          height: '1px',
          'font-size': '1px',
          position: 'absolute',
          transform: this.sentinelTransform_$
        }).entity('nbsp');
      },
      transient: true
    },
    {
      class: 'Int',
      name: 'sentinelY_',
      documentation: `Y-index (in pixels) of "sentinel_", relative to top of
          this view (the scroll container).`,
      expression: function(rowHeight, count_) {
        return ( count_ * rowHeight ) - 1;
      },
      transient: true
    },
    {
      class: 'String',
      name: 'sentinelTransform_',
      documentation: 'CSS transform for "sentinel_".',
      expression: function(sentinelY_) {
        return 'translate(0px, ' + sentinelY_ + 'px)';
      },
      transient: true
    },
    {
      class: 'Boolean',
      name: 'anchorLock_',
      documentation: `A synchronization variable to prevent unhandled scroll
          events from firing when "count_" (and therefore "sentinel_" location)
          changes.`,
      transient: true
    },
    {
      class: 'Int',
      name: 'fetchId_',
      documentation: `A synchronization variable to prevent halt batch fetching
          of results if fetching from a new starting point has already
          commenced.`,
      transient: true
    },
    {
      class: 'Function',
      name: 'modNumRows_',
      documentation: `Helper function for row arithmetic. A property rather than
          a method for easy export to inner class instances that use it.`,
      value: function(num) {
        if ( this.numRows === 0 ) return 0;
        var ret = num % this.numRows;
        if ( ret < 0 ) ret = ret + this.numRows;
        return ret;
      },
      transient: true
    }
  ],

  classes: [
    {
      name: 'Row',
      extends: 'foam.u2.Element',

      documentation: `Recycled DOM rows. The "view" ViewSpec is used to manually
          tear down and rebuild row contents whenever "data" changes. Scroll
          performance is optimized by using an inner view with no dynamic
          bindings so that the only DOM operation is the row completely
          replacing its contents.`,

      imports: [
        'columns?',
        'rowFormatter',
        'selection',
        'selectionEnabled'
      ],

      css: `
        ^ {
          display: block;
          contain: layout;
          will-change: transform;
          padding: 5px;
          box-sizing: border-box;
          -webkit-user-select: none;
          -khtml-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
        ^selectable:hover {
          filter: opacity(0.8);
          cursor: pointer;
        }
        ^selected {
          filter: opacity(0.7) !important;
        }
      `,

      properties: [
        [ 'nodeName', 'li' ],
        {
          name: 'data',
          postSet: function(old, nu) {
            if ( this.state !== this.LOADED ) return;
            const htmlStr = this.rowFormatter.format(
              nu, this.columns);
            this.el().innerHTML = htmlStr;
          }
        }
      ],

      methods: [
        function init() {
          this.onload.sub(this.render);
        },
        function initE() {
          var self = this;
          this.addClass(this.myClass());
          this.enableClass(this.myClass('selectable'), this.selectionEnabled$);
          this.enableClass(
              this.myClass('selected'),
              this.slot(function(selectionEnabled, data, selection) {
                if ( ! data || ! selectionEnabled ||
                     selection.length === 0 ) {
                  return false;
                }

                return selection.some(function(d) {
                  return d.id === data.id;
                });
              }, this.selectionEnabled$, this.data$, this.selection$));
          this.on('click', function(evt) {
            if ( ! self.data ) return;
            if ( self.selection.some(function(d) {
                   return d.id === self.data.id;
                 }) ) {
              foam.Array.remove(self.selection, self.data);
            } else {
              self.selection.push(self.data);
            }
            self.selection = Array.from(self.selection);
          });
          this.columns$ && this.columns$.sub(this.render);
        }
      ],

      listeners: [
        function render() {
          this.el().innerHTML = this.rowFormatter.format(this.data,
                                                         this.columns);
        }
      ]
    },
    {
      name: 'DAOController',

      documentation: `Controller responsible for fetching batches of data for
          ScrollDAOView. Data are fetched in multiple small batch to avoid
          blocking the main thread to parse large amounts of data.

          Data are fetched in a window around the current scroll position and
          inserted into row views as soon as they are available. Since the user
          may "jump" to a far away scroll position, this controller keeps track
          of a list of ranges, and only fetches missing data in the current
          scroll window. The onReset() listener throws away data and ranges.

          A smaller window (the "buffer") must contain gaps to trigger a data
          fetch. When a fetch is triggered a larger window (the "runway")
          defines which records to fetch:

                    anchorDAOIdx_ ----v
                                      <-- numRows -->
                  <- negativeBuffer ->               <- positiveBuffer ->
            <------- negativeRunway ->               <-- positiveRunway ------->
            |||||||||||||||| records filled after batched fetch ||||||||||||||||
          `,

      // ScrollDAOView state needed for data fetching and immediate row
      // insertion.
      imports: [
        'anchorDAOIdx_',
        'anchorRowIdx_',
        'batchSize',
        'count_',
        'data as dao',
        'modNumRows_',
        'negativeRunway',
        'numRows',
        'positiveRunway',
        'rows_'
      ],

      properties: [
        {
          class: 'Int',
          name: 'negativeBuffer',
          documentation: `The area behind the current anchor where a gap may
              trigger a data fetch`,
          expression: function(negativeRunway, numRows) {
            return Math.max(Math.ceil(negativeRunway / 5, numRows));
          }
        },
        {
          class: 'Int',
          name: 'positiveBuffer',
          documentation: `The area in front of the current anchor where a gap
              may trigger a data fetch`,
          expression: function(positiveRunway, numRows) {
            return Math.max(Math.ceil(positiveRunway / 5, numRows));
          }
        },
        {
          name: 'data',
          factory: function() { return {}; }
        },
        {
          class: 'Array',
          name: 'ranges'
        }
      ],

      methods: [
        function init() {
          this.anchorDAOIdx_$.sub(this.onMove);
          this.negativeRunway$.sub(this.onMove);
          this.numRows$.sub(this.onMove);
          this.positiveRunway$.sub(this.onMove);
          this.onMove();
          this.SUPER();
        },

        function missingData_(start, end) {
          var ranges = this.ranges;
          var iterAfterRange = true;
          var i;
          for ( i = this.ranges.length - 1; i >= 0; i-- ) {
            if ( ranges[i][0] <= end ) break;
          }
          if ( i < 0 ) return [ [ start, end ] ];
          if ( ranges[i][0] <= start && ranges[i][1] >= end ) return null;
          var foundGaps = ranges[i][1] < end ? [ [ ranges[i][1], end ] ] : [];
          var gapEnd = ranges[i][0];
          for ( i--; i >= 0; i-- ) {
            var range = ranges[i];
            if ( range[1] < start ) {
              foundGaps.push([ start, gapEnd ]);
              break;
            }
            foundGaps.push([ range[1], gapEnd ]);
            gapEnd = range[0];
          }
          return foundGaps;
        },

        function fetchData_(start, end, gaps) {
          var viewStart = this.anchorDAOIdx_;
          var viewEnd = viewStart + this.numRows;
          var runwayStart = Math.max(0, viewStart - this.negativeRunway);
          var runwayEnd = Math.min(this.count_, viewEnd + this.positiveRunway);

          if ( runwayStart < start ) {
            var before = this.missingData_(runwayStart, gaps[0][1]);
            gaps = before ? before.concat(gaps.slice(1)) : gaps;
          }
          if ( runwayEnd > end ) {
            var after = this.missingData_(gaps[gaps.length - 1][0], runwayEnd);
            gaps = after ? gaps.slice(0, -1).concat(after) : gaps;
          }

          this.fetchChunks_(gaps);

          var a = this.ranges;
          var b = gaps;
          var i = 0;
          var j = 0;
          while ( i < a.length || j < b.length ) {
            if ( j >= b.length ) break;
            if ( i >= a.length ) {
              a = a.concat(b.slice(j));
              break;
            }
            if ( a[i][0] <= b[j][0] ) {
              if ( b[j][0] <= a[i][1] ) {
                a[i][1] = Math.max(a[i][1], b[j][1]);
                j++;
              }
            } else {
              if ( a[i][0] <= b[j][1] ) {
                a[i][0] = b[j][0];
                a[i][1] = Math.max(a[i][1], b[j][1]);
              }
              j++;
            }
            for ( var k = i + 1; k < a.length; k++ ) {
              if ( a[i][1] < a[k][0] ) break;
              a[i][1] = a[k][1];
            }
            i = k;
          }

          this.ranges = a;
        },

        function fetchChunks_(chunks) {
          for ( var i = 0; i < chunks.length; i++ ) {
            this.fetchBatches_(chunks[i][0], chunks[i][1]);
          }
        },

        function fetchBatches_(start, end) {
          var self      = this;
          var batchSize = self.batchSize;
          var skip      = start;
          var limit     = Math.min(start + self.batchSize, end);

          var fetchBatch = function() {
            self.dao.skip(skip).limit(limit).
              select().then(function(sink) {
                while ( ! sink.array ) {
                  sink = sink.delegate;
                }
                var array = sink.array;
                var daoStart = self.anchorDAOIdx_;
                var daoEnd = Math.min(self.count_,
                                      self.anchorDAOIdx_ + self.numRows);
                for ( var i = 0; i < array.length; i++ ) {
                  var daoIdx = skip + i;
                  self.data[daoIdx] = array[i];
                  if ( daoIdx >= daoStart && daoIdx < daoEnd ) {
                    var anchorRelativeIdx = daoIdx - daoStart;
                    var rowIdx = self.modNumRows_(self.anchorRowIdx_ +
                                                  anchorRelativeIdx);
                    var row = self.rows_[rowIdx];
                    row.data = array[i];
                  }
                }

                skip += batchSize;
                limit = Math.min(batchSize, end - skip);
                // TODO(markdittmer): Import rAF.
                if ( limit > 0 ) window.requestAnimationFrame(fetchBatch);
              });
          };
          fetchBatch();
        }
      ],

      listeners: [
        function onMove() {
          var viewStart = this.anchorDAOIdx_;
          var viewEnd = viewStart + this.numRows;
          var bufferStart = Math.max(0, viewStart -
                                     ( this.negativeRunway / 4 ));
          var bufferEnd = Math.min(this.count_,
                                   viewEnd + ( this.positiveRunway / 4 ));

          var gaps = this.missingData_(bufferStart, bufferEnd);
          if ( ! gaps ) return;
          this.fetchData_(bufferStart, bufferEnd, gaps);
        },
        function onReset() {
          this.data = {};
          this.ranges = [];
          this.onMove();
        }
      ]
    }
  ],

  methods: [
    function init() {
      if ( this.importedSelection$ ) {
        this.selection$.linkFrom(this.importedSelection$);
      }
      if ( this.data ) this.countRecords_();
      this.SUPER();
    },

    function initE() {
      this.addEventListener('scroll', this.onScroll);
      this.
        setNodeName('ul').
        add(this.sentinel_).
        addClass(this.myClass()).
        forEach(this.rows_, function(row, idx) {
          this.add(row);
          // Lay out row either:
          // (1) Where it belongs in positive runway,
          // or
          // (2) Just above first record.
          var y = idx < this.count_ ?
                ( idx - this.negativeRunway ) * this.rowHeight :
                -this.rowHeight;
          row.style({
            position: 'absolute',
            transform: 'translateY(' + y +'px)',
            height: this.rowHeight + 'px',
            width: '100%'
          });
        });
    },

    {
      name: 'moveAnchor_',
      documentation: `Layout rows according to new anchor "DAO idx" (i.e.,
          idx relative to first record in view).`,
      code: function(anchorDAOIdx) {
        var daoIdxDelta = anchorDAOIdx - this.anchorDAOIdx_;
        if ( Math.abs(daoIdxDelta) >= this.numRows )
          return this.resetAnchor_(anchorDAOIdx);

        if ( daoIdxDelta >= 0 ) return this.moveAnchorForward_(anchorDAOIdx);
        return this.moveAnchorBackward_(anchorDAOIdx);
      }
    },
    {
      name: 'resetAnchor_',
      documentation: `Layout all rows according to new anchor DAO idx. Generally
          used when scroll jump exceeds row window size or on data reset.`,
      code: function(anchorDAOIdx) {
        var baseDAOIdx = anchorDAOIdx;
        for ( var i = 0; i < this.numRows; i++ ) {
          var row = this.rows_[i];
          var idx = baseDAOIdx + i;
          row.data = this.daoController_.data[idx] || null;
          this.translateRowTo_(idx < this.count_ ? idx : -1, row);
        }

        this.anchorDAOIdx_ = anchorDAOIdx;
        this.anchorRowIdx_ = 0;
      }
    },
    {
      name: 'moveAnchorForward_',
      documentation: `Layout necessary rows for anchor moving forward within row
          window.`,
      code: function(anchorDAOIdx) {
        var delta = anchorDAOIdx - this.anchorDAOIdx_;
        var daoStart = this.anchorDAOIdx_ + this.numRows;
        for ( var i = 0; i < delta; i++ ) {
          var rowIdx = this.modNumRows_(this.anchorRowIdx_ + i);
          var row = this.rows_[rowIdx];
          var idx = daoStart + i < this.count_ ? daoStart + i : -1;
          row.data = this.daoController_.data[idx] || null;
          this.translateRowTo_(idx, row);
        }
        this.anchorDAOIdx_ = anchorDAOIdx;
        this.anchorRowIdx_ = this.modNumRows_(this.anchorRowIdx_ + delta);
      }
    },
    {
      name: 'moveAnchorBackward_',
      documentation: `Layout necessary rows for anchor moving backward within
          row window.`,
      code: function(anchorDAOIdx) {
        var delta = this.anchorDAOIdx_ - anchorDAOIdx;
        var rowStart = this.anchorRowIdx_ + this.numRows;
        for ( var i = 1; i <= delta; i++ ) {
          var rowIdx = this.modNumRows_(rowStart - i);
          var row = this.rows_[rowIdx];
          var idx = this.anchorDAOIdx_ - i >= 0 ?
              this.anchorDAOIdx_ - i : -1;
          row.data = this.daoController_.data[idx] || null;
          this.translateRowTo_(idx, row);
        }
        this.anchorDAOIdx_ = anchorDAOIdx;
        this.anchorRowIdx_ = this.modNumRows_(this.anchorRowIdx_ - delta);
      }
    },
    {
      name: 'translateRowTo_',
      documentation: 'Helper to change row CSS transform to a new DAO idx.',
      code: function(daoIdx, row) {
        row.style({
          transform: 'translateY(' + ( daoIdx * this.rowHeight ) + 'px)'
        });
      }
    },
    {
      name: 'countRecords_',
      documentation: `Count records in "dao", then update view accordingly.
          Assume that a (re)count implies any data may change (and therefore
          data should be re-fetched). Any change in the location of "count_"
          within the row window triggers layout of all rows.`,
      code: function() {
        var self = this;
        return self.data.select(self.COUNT()).then(function(count) {
          // Prevent unhandled scroll events from firing and potentially laying
          // out rows past the new "sentinel_" location.
          self.anchorLock_ = true;

          var oldCount = self.count_;
          var newCount = self.count_ = count.value;
          var endIdx = self.anchorDAOIdx_ + self.numRows;

          // Choose a reasonable anchor for new count.
          var anchorDAOIdx = Math.min(
            self.anchorDAOIdx_,
            Math.max(0, self.count_ - self.numRows));

          // Update scroll-indicating state first, then reset DAOController.
          self.anchorDAOIdx_ = anchorDAOIdx;
          self.anchorRowIdx_ = 0;
          self.daoController_.onReset();

          // Like resetAnchor_, but lay out all rows.
          var baseDAOIdx = anchorDAOIdx;
          for ( var i = 0; i < self.numRows; i++ ) {
            var row = self.rows_[i];
            var idx = baseDAOIdx + i;
            row.data = self.daoController_.data[idx] || null;
            self.translateRowTo_(idx < self.count_ ? idx : -1, row);
          }
        });
      }
    }
  ],

  listeners: [
    {
      name: 'onScroll',
      documentation: 'Respond to scroll: Move the anchor.',
      isFramed: true,
      code: function(domEvt) {
        if ( this.anchorLock_ ) {
          this.anchorLock_ = false;
          return;
        }

        var top = domEvt.target.scrollTop;
        var recordTop = Math.floor(top / this.rowHeight);

        // Situate anchor with 40% of rows scrolled above. This makes any lag
        // from fast scrolling roughly symmetrical on scroll-up/scroll-down.
        var rowsAbove = 0.4 * this.numRows;
        var anchorDAOIdx;
        if ( recordTop < rowsAbove ) {
          anchorDAOIdx = 0;
        } else {
          anchorDAOIdx = recordTop - rowsAbove;
        }
        if ( anchorDAOIdx === this.anchorDAOIdx_ ) return;

        this.moveAnchor_(anchorDAOIdx);
      }
    }
  ]
});
