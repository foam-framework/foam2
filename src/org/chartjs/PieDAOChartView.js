/**
* @license
* Copyright 2019 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'org.chartjs',
  name: 'PieDAOChartView',
  extends: 'org.chartjs.AbstractChartView',
  requires: [
    'foam.nanos.analytics.Candlestick',
  ],
  implements: [
    'foam.mlang.Expressions'
  ],
  properties: [
    {
      name: 'config',
      factory: function () {
        return {
          type: 'pie'
        };
      }
    },
    {
      class: 'foam.mlang.ExprProperty',
      name: 'keyExpr'
    },
    {
      class: 'foam.mlang.ExprProperty',
      name: 'valueExpr'
    },
    {
      name: 'palette',
      value: ['#E3170D', '#AF4035', '#CC1100', '#FFE4E1', '#FF6347', '#FF6600'],
      documentation: `
        Takes array/map/function. Function must take two params (keys, data) and
        returns an array of colors.
      `
    }
  ],

  listeners: [
    {
      name: 'dataUpdate',
      isFramed: true,
      code: function() {
        var self = this;
        self.data
          .select(this.GROUP_BY(this.keyExpr, this.SUM(this.valueExpr)))
          .then(function(sink) {
            // Clear data before cloning because we'll be clobbering
            // it below anyway and cloning it can sometimes result in
            // a stack overflow.
            self.config.data = { datasets: [] };
            var config = foam.Object.clone(self.config);

            var keys = Object.keys(sink.groups);
            var data = [];
            var backgroundColors = [];
            keys.forEach(key => {
              data.push(sink.groups[key].value);
              if ( foam.Object.isInstance(self.palette) ) {
                // Color has a key associated with it
                var color = self.palette[key];
                var unsupportedKeyColor = self.palette['default'] ? self.palette['default'] : 'lightgray';
                color ? backgroundColors.push(color) : backgroundColors.push(unsupportedKeyColor);
              }
            });

            if ( Array.isArray(self.palette) && self.palette.length > 0 ) {
              // Cycle through palette
              data.forEach(function(_, index) {
                backgroundColors.push(self.palette[index % self.palette.length]);
              });
            } else if (typeof self.palette === 'function' ) {
              // Pass keys and data in their correct order to method passed to be
              // processed
              backgroundColors = self.palette(keys, data);
            } else if ( backgroundColors.length === 0 ) {
              // Fallback if all else fails. Should never be the case.
              data.forEach(function(_, index) {
                backgroundColors.push('lightgray');
              });
            }

            config.data = {
              datasets: [{
                data: data,
                backgroundColor: backgroundColors
              }],
              labels: keys
            };
            self.config = config;
          });
      }
    }
  ]
});
