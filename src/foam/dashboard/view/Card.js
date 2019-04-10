/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dashboard.view',
  name: 'Card',
  extends: 'foam.u2.View',
  requires: [
    'foam.u2.view.SimpleAltView'
  ],
  imports: [
    'dashboardController'
  ],
  exports: [
    'contentWidth as visualizationWidth',
    'contentHeight as visualizationHeight',
    'data.colors as visualizationColors',
    'data.dao.of as of'
  ],
  constants: [
    {
      name: 'SIZES',
      value: {
        TINY:   [176, 358],
        SMALL:  [312, 358],
        MEDIUM: [624, 528],
        LARGE:  [936, 528],
        XLARGE: [1580, 698],
      }
    }
  ],
  properties: [
    {
      name: 'width',
      expression: function(data$size) {
        return this.SIZES[data$size.name][0];
      }
    },
    {
      name: 'height',
      expression: function(data$size) {
        return this.SIZES[data$size.name][1];
      }
    },
    {
      name: 'contentWidth',
      expression: function(width) {
        return width;
      }
    },
    {
      name: 'contentHeight',
      expression: function(height) {
        // 70 is height of header as dictated by the ^header CSS class
        return height - 60;
      }
    }
  ],
  css: `
    ^ {
      border: 2px solid #dae1e9;
      border-radius: 2px;
      background: white;
      margin: 8px;
      padding-bottom: 20px;
    }

    ^header {
      padding-left: 24px;
      padding-right: 16px;
      padding-top: 20px;
      padding-bottom: 20px;
      margin-bottom: 16px;
      border-bottom: 1px solid #ccc;
      font-weight: bold;
      height: 20px;
      font-size: 20px;
    }
  `,
  methods: [
    function initE() {
      this.onDetach(this.dashboardController.sub('dashboard', 'update', function() {
        this.data.update();
      }.bind(this)));
      this.data.update();

      var view = this;

      this.
        style({
          width: this.slot(function(data$mode, width) {
            return data$mode == 'config' ? 'initial' : ( width + 'px' );
          }),
          height: this.slot(function(data$mode, height) {
            return data$mode == 'config' ? 'initial' : ( height + 'px' );
          })
        }).
        addClass(this.myClass()).
        // addClass(this.dot('data').dot('mode').map(function(m){
        //   return m == 'config' ?
        //     view.myClass('config') :
        //     view.myClass('display');
        // })).
        // addClass(this.dot('data').dot('size').map(function(s) {
        //   return view.myClass(s.name);
        // })).
        start('div').
        addClass(this.myClass('header')).
        start().
          style({ float: 'left' }).
          add(this.data.label$).
        end().
        start().
          style({ float: 'right' }).
          add(this.data.configView$).
        end().
        end('div').
        start('div').
        addClass(this.myClass('content')).
        tag(this.slot(function(data$currentView) {
          return foam.u2.ViewSpec.createView(data$currentView, null, this, this.__subSubContext__);
        })).
        end('div');
//        tag(this.SimpleAltView, {
//          choices$: this.dot('data').dot('views'),
//        });
    }
  ]
});
