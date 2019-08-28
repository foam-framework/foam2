/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.graphics',
  name: 'Graph',
  extends: 'foam.graphics.CView',

  properties: [
    [ 'align', 'left' ],
    [ 'axisColor', 'black' ],
    [ 'axisLineWidth', 2 ],
    [ 'borderColor', 'black' ],
    [ 'borderTextColor', '#ffffff' ],
    [ 'bgTextColor', '#ffffff' ],
    {
      name: 'dataSource',
      required: true
    },
    [ 'fontLabel', '12px Roboto' ],
    [ 'fontValue', '14px Roboto' ],
    [ 'h', 0 ],
    [ 'height', 500 ],
    [ 'lengthY', 0 ],
    [ 'lengthX', 0 ],
    [ 'symbol' ],
    [ 'textColor', 'black' ],
    [ 'w', 0 ],
    [ 'width', 500 ]
  ]
});
