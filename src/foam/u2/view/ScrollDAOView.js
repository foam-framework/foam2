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

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
          overflow-y: scroll;
          -webkit-overflow-scrolling: touch;
          width: 100%;
          height: 100%;
          position: absolute;
          box-sizing: border-box;
          contain: layout;
          will-change: transform;
        }
    */}
    })
  ],

  requires: [
    'foam.dao.QuickSink',
    'foam.u2.ViewSpec'
  ],
  exports: [
    'anchorDAOIdx_',
    'anchorRowIdx_',
    'modNumRows_',
    'negativeRunway',
    'numRows',
    'rows_'
  ],

  classes: [
    {
      name: 'Row',
      extends: 'foam.u2.Element',

      axioms: [
        foam.u2.CSS.create({
          code: function CSS() {/*
            ^ {
              display: block;
              contain: layout;
              will-change: transform;
              padding: 5px;
              box-sizing: border-box;
            }
            ^ * {
              background-color: #dddddd;
            }
        */}
        })
      ],

      properties: [
        [ 'nodeName', 'li' ],
        {
          class: 'FObjectProperty',
          of: 'foam.u2.Element',
          name: 'view'
        }
      ],

      methods: [
        function initE() { this.addClass(this.myClass()).add(this.view$); }
      ]
    },
    {
      name: 'FetchSink',
      extends: 'foam.dao.AbstractSink',

      imports: [
        'anchorDAOIdx_',
        'anchorRowIdx_',
        'modNumRows_',
        'negativeRunway',
        'numRows',
        'rows_'
      ],

      properties: [
        {
          class: 'Int',
          name: 'skip'
        },
        {
          class: 'Int',
          name: 'limit'
        },
        {
          class: 'Int',
          name: 'i'
        }
      ],

      methods: [
        function put(obj, sub) {
          var idx = this.skip + this.i;
          // Record index relative to current anchor record index.
          var recordDelta = idx - this.anchorDAOIdx_;

          // Early return: idx is no longer in rows window.
          if ( this.anchorDAOIdx_ - this.negativeRunway > idx ||
               this.anchorDAOIdx_ + this.positiveRunway <= idx ) {
            this.i++;
            return;
          }

          // Compute row idx for record, and fill it.
          var rowIdx = this.modNumRows_(this.anchorRowIdx_ + recordDelta);
          this.rows_[rowIdx].view.data = obj;
          this.i++;
        }
      ]
    }
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao',
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
      },
      required: true
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'rowView',
      documentation: `Spec for creating rows within this view. This view will
          construct "numRows" rows and set their "data" to items from "dao"
          or undefined (when row is not populated).`,
      // TODO(markdittmer): ViewSpec should adapt default value here, instead of
      // needing factory.
      factory: function() {
        return 'foam.u2.CitationView';
      }
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
      value: 200,
      required: true,
      final: true
    },
    {
      class: 'Int',
      name: 'negativeRunway',
      documentation: 'Number of rows before anchor row.',
      expression: function(numRows) {
        return Math.floor(numRows / 3);
      },
      transient: true
    },
    {
      class: 'Int',
      name: 'positiveRunway',
      documentation: 'Number of rows after and including anchor row.',
      transient: true,
      expression: function(numRows, negativeRunway) {
        return numRows - negativeRunway;
      }
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
      class: 'Int',
      name: 'skip_',
      documentation: 'Number of records to skip when fetching data from "dao".',
      expression: function(negativeRunway, rowHeight, anchorDAOIdx_) {
        return Math.max(
          0,
          anchorDAOIdx_ - negativeRunway);
      },
      transient: true
    },
    {
      class: 'Int',
      name: 'limit_',
      documentation: 'Limit on number of records to fetch from "dao".',
      expression: function(count_, skip_, numRows) {
        return Math.min(count_ - skip_, numRows);
      },
      transient: true
    },
    {
      class: 'FObjectArray',
      of: 'foam.u2.Element',
      name: 'rows_',
      documentation: 'Direct child views of this view to recycle.',
      factory: function() {
        var rows = new Array(this.numRows);
        for ( var i = 0; i < rows.length; i++ ) {
          rows[i] = this.Row.create({
            view: this.rowView
          });
        }
        return rows;
      },
      transient: true
    },
    {
      class: 'FObjectProperty',
      of: 'foam.u2.Element',
      name: 'sentinel_',
      documentatin: `Absolutely positioned single pixel that establishes the
          height of the scroll container.`,
      factory: function() {
        return this.E('div').style({
          width: '1px',
          height: '1px',
          position: 'absolute',
          transform: this.sentinelTransform_$
        });
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

  methods: [
    function init() {
      this.countRecords_();
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
        var baseDAOIdx = anchorDAOIdx - this.negativeRunway;
        for ( var i = 0; i < this.numRows; i++ ) {
          var row = this.rows_[i];
          var idx = baseDAOIdx + i;
          row.view.data = undefined;
          if ( idx >= this.count_ ) break;
          if ( idx >= 0 )
            this.translateRowTo_(idx, row);
        }

        this.anchorDAOIdx_ = anchorDAOIdx;
        this.anchorRowIdx_ = this.negativeRunway;
      }
    },
    {
      name: 'moveAnchorForward_',
      documentation: `Layout necessary rows for anchor moving forward within row
          window.`,
      code: function(anchorDAOIdx) {
        var anchorDAOIdxDelta = anchorDAOIdx - this.anchorDAOIdx_;
        var windowEndDAOIdx = this.anchorDAOIdx_ + this.positiveRunway;
        var rowIdxStart = this.modNumRows_(this.anchorRowIdx_ -
                                           this.negativeRunway);
        var rowIdxEnd = this.modNumRows_(this.anchorRowIdx_ +
                                         anchorDAOIdxDelta);
        var numRows = anchorDAOIdxDelta;

        for ( var i = 0; i < numRows; i++ ) {
          var row = this.rows_[this.modNumRows_(rowIdxStart + i)];
          var idx = windowEndDAOIdx + i;
          row.view.data = undefined;
          if ( idx >= this.count_ ) break;
          if ( idx >= 0 )
            this.translateRowTo_(idx, row);
        }

        this.anchorDAOIdx_ = anchorDAOIdx;
        this.anchorRowIdx_ = rowIdxEnd;
      }
    },
    {
      name: 'moveAnchorBackward_',
      documentation: `Layout necessary rows for anchor moving backward within
          row window.`,
      code: function(anchorDAOIdx) {
        var afterWindowRowIdx = this.anchorRowIdx_ + this.positiveRunway;
        var anchorDAOIdxDelta = this.anchorDAOIdx_ - anchorDAOIdx;
        var rowIdxStart = this.modNumRows_(afterWindowRowIdx);
        var rowIdxEnd = this.modNumRows_(afterWindowRowIdx - anchorDAOIdxDelta);
        var windowStartDAOIdx = this.anchorDAOIdx_ - this.negativeRunway;
        var numRows = anchorDAOIdxDelta;

        for ( var i = 0; i < numRows; i++ ) {
          var row = this.rows_[this.modNumRows_(rowIdxStart - i)];
          var idx = windowStartDAOIdx - i;
          row.view.data = undefined;
          if ( idx < 0 ) break;
          if ( idx < this.count_ )
            this.translateRowTo_(idx, row);
        }

        this.anchorDAOIdx_ = anchorDAOIdx;
        this.anchorRowIdx_ = this.modNumRows_(this.anchorRowIdx_ - numRows);
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
        return self.dao.select(self.COUNT()).then(function(count) {
          self.fetchData();

          // Prevent unhandled scroll events from firing and potentially laying
          // out rows past the new "sentinel_" location.
          self.anchorLock_ = true;

          var oldCount = self.count_;
          var newCount = self.count_ = count.value;
          var endIdx = self.anchorDAOIdx_ + self.positiveRunway;

          // If the current window isn't affected by count change, nothing else
          // to be done.
          if ( endIdx < Math.min(oldCount, newCount) ) return;

          // Choose a reasonable anchor for new count.
          var anchorDAOIdx = Math.min(
            self.anchorDAOIdx_,
            Math.max(0, self.count_ - self.positiveRunway));
          // Like resetAnchor_, but lay out all rows.
          var baseDAOIdx = anchorDAOIdx - self.negativeRunway;
          for ( var i = 0; i < self.numRows; i++ ) {
            var row = self.rows_[i];
            var idx = baseDAOIdx + i;
            row.view.data = undefined;
            if ( idx < 0 || idx >= self.count_ )
              self.translateRowTo_(-1, row);
            else
              self.translateRowTo_(idx, row);
          }

          self.anchorDAOIdx_ = anchorDAOIdx;
          self.anchorRowIdx_ = self.negativeRunway;
        });
      }
    },
    {
      name: 'fetchData_',
      documentation: `Fetch data aligned with current row window from "dao" in
          batches of size "batchSize".`,
      code: function() {
        var batchSize = this.batchSize;
        var skip = this.skip_;
        var limit = Math.min(batchSize, this.limit_);
        var fetchId = ++this.fetchId_;
        var fetchBatch = function() {
          if ( this.fetchId_ !== fetchId ) return;
          this.dao.skip(skip).limit(limit)
            .select(this.FetchSink.create({
              skip: skip,
              limit: limit
            }));

          skip += batchSize;
          limit = Math.min(limit, this.skip_ + this.limit_ - skip);
          if ( limit > 0 ) window.requestAnimationFrame(fetchBatch);
        }.bind(this);
        fetchBatch();
      }
    }
  ],

  listeners: [
    {
      name: 'onScroll',
      documentation: 'Respond to scroll: Move the anchor and fetch new data.',
      isFramed: true,
      code: function(domEvt) {
        if ( this.anchorLock_ ) {
          this.anchorLock_ = false;
          return;
        }

        var top = domEvt.srcElement.scrollTop;
        var anchorTop = this.anchorDAOIdx_ * this.rowHeight;
        var scrollDelta = top - anchorTop;
        var recordDelta = Math.floor(scrollDelta / this.rowHeight);

        if ( Math.abs(recordDelta) < ( this.negativeRunway / 2 ) ) return;

        this.moveAnchor_(this.anchorDAOIdx_ + recordDelta);
        this.fetchData();
      }
    },
    {
      name: 'fetchData',
      documentation: `Fetch data aligned with current row window from "dao".
          This should be the only caller of "fetchData_()" to ensure that
          rapid fetch requests are merged.`,
      isMerged: true,
      mergeDelay: 500,
      code: function() { this.fetchData_(); }
    }
  ]
});
