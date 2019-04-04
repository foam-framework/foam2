var d = Tabata.create();
foam.u2.DetailView.create({ data: d, showActions: true }).write();
//      TabataBarCView.create({ data: d }).write();
TabataCView.create({ data: d }).write();
TabataSoundView.create({ data: d });
/*
foam.u2.DetailView.create({ data: Beep.create(), showActions: true }).write();

var d2 = Tabata.create({rounds: 16});
foam.u2.DetailView.create({ data: d2, showActions: true }).write();
TabataCView.create({ data: d2 }).write();
*/
