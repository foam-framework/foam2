// TODO: move somewhere reusable, just prototyping here

var els = document.getElementsByTagName('foam');

for ( var i = els.length-1 ; i >= 0 ; i-- ) {
  var el = els[i];
  var modelName = els[i].getAttribute('model');
  var cls = foam.lookup(modelName, true);
  if ( cls ) {
    var view = cls.create(null, foam.__context__);
    if ( view.toE ) {
      view = view.toE(foam.__context__);
    } else if ( ! foam.u2.Element.isInstance(view) )  {
      view = foam.u2.DetailView.create({data: view, showActions: true});
    }
//     console.log('Installing view: ', modelName, view);
    el.outerHTML = view.outerHTML;
    view.load();
  } else {
    console.error('Unknow class: ', modelName);
  }
}
