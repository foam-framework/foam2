  // TODO: move somewhere reusable, just prototyping here

var els = document.getElementsByTagName('foam');

for ( var i = 3 ; i < 4 ; i++ ) {
  var el = els[i];
  var modelName = els[i].getAttribute('model');
  var cls = foam.lookup(modelName, true);
  if ( cls ) {
    var view = cls.create(null, foam.__context__);
    console.log('Installing view: ', modelName, view);
    el.outerHTML = view.outerHTML;
    view.load();
  } else {
    console.error('Unknow class: ', modelName);
  }
}
