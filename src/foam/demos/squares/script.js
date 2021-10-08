/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

var ss = foam.demos.squares.Squares.create();
ss.write();
foam.u2.DetailView.create({data: ss, showActions: true}).write();
