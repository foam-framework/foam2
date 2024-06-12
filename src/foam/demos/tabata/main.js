/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

var d = Tabata.create();
foam.u2.DetailView.create({ data: d, showActions: true }).write();
//      TabataBarCView.create({ data: d }).write();

document.write('<br>');

TabataCView.create({ data: d }).write();
TabataSoundView.create({ data: d });
/*
foam.u2.DetailView.create({ data: Beep.create(), showActions: true }).write();

var d2 = Tabata.create({rounds: 16});
foam.u2.DetailView.create({ data: d2, showActions: true }).write();
TabataCView.create({ data: d2 }).write();
*/
