/**
 * @license Copyright 2019 The FOAM Authors. All Rights Reserved.
 *          http://www.apache.org/licenses/LICENSE-2.0
 */

//this code will generate, in the console, the input for uml class diagram.
//https://yuml.me/diagram/scruffy/class/draw

//to run, just you need to run the function in the console
//for example: printElement(foam.box.Box)

var printElementProp = function(cls){
  var res =''; 
  var lImpl, lreq, lexp, limp;
  var l =[]; 
  var arrayModel = [];

  if ( cls == undefined || cls == 'FObject' || (Object.keys(cls).length === 0 && cls.constructor === Object))
    return '' ;

  if ( cls.model_== undefined )
    cls = eval(cls);

  res+= '['+ (cls.id != undefined ? cls.id : cls.path);

  if ( cls.model_ && cls.model_.properties!= undefined ){
    res+= '|' + cls.model_.properties.map(function(r){
      return r.name;
    }).join(';');
  }

  if ( cls.model_ && cls.model_.methods!= undefined ){
    res+= '|' + cls.model_.methods.map(function(r){
      return r.name+'()';
    }).join(';');
  }
  res+='],';

  var copyCls; 
  if ( cls.model_ && cls !='FObject' && cls.model_.extends!= undefined ){
    copyCls = cls.model_.extends;
    if (copyCls == cls) return '';
    if ( copyCls != 'FObject' && copyCls != foam.core.FObject ) {
      res+= printElementProp(copyCls);
    }
  }

  if ( cls.model_ && cls !='FObject' && cls.model_.implements!= undefined ){
    copyCls = cls.model_.implements;
    if (copyCls == cls) return '';
    var lImpl = copyCls.map(function(cls,i){
      if ( copyCls != foam.core.FObject ) {
        res = res + printElementProp(eval(copyCls[i].path));
      }
      return cls
    });
  }

  if ( cls.model_ && cls.model_.requires!= undefined ){
    lreq= cls.model_.requires.map(function(r){
      if (cls.id == r.path) return '';
      if (cls.isSubClass(eval(r.path))) return '';
      return r.path
    })
  }

  l = [];
  l =  l.concat(lImpl,lreq);
  return res + ( l != undefined ? l.map(function(cls,i){
    printElementProp(eval(cls));
  }) : '');
}

var printElementRel = function(cls){
  var lImpl, lreq,lexp,limp;res =''; 
  var l =[]; 
  var ele ='';
  var pro = '';

  if ( cls == undefined || cls =='FObject' || (Object.keys(cls).length === 0 && cls.constructor === Object))
    return '' ;

  if ( cls.model_== undefined )
    cls = eval(cls);

  ele= '['+cls.id; 

  if ( cls.model_ && cls.model_.properties!= undefined ){
    ele+='|';
    pro+= cls.model_.properties.map(function(r){
      return r.name+';';})
  }
  ele+=pro+']';
  
  var copyCls; 
  if ( cls.model_ && cls !='FObject' && cls.model_.extends!= undefined ){
    copyCls = cls.model_.extends;
    if (copyCls == cls) return '';
    if ( copyCls != 'FObject' && copyCls != foam.core.FObject ) {
      res+=ele+'-^['+copyCls+']'+',';
      res+= printElementRel(copyCls);
    }
  }

  if ( cls.model_ && cls !='FObject' && cls.model_.implements!= undefined ){
    copyCls = cls.model_.implements;
    if (copyCls == cls) return '';
    var lImpl = copyCls.map(function(cls,i){ 
      if ( copyCls != foam.core.FObject ) { 
        res+=ele+'-^['+copyCls[i].path+']'+',';
      }
      return cls});
  }

  if ( cls.model_ && cls.model_.requires!= undefined ){
    lreq= cls.model_.requires.map(function(r){
      if (cls.id == r.path) return '';
      if (cls.isSubClass(eval(r.path))) return '';
      res+=ele+'-requires >['+r.path+']'+',';
      return r.path})
  }

  if ( cls.model_ && cls.model_.exports!= undefined ){
    lexp= cls.model_.exports.map(function(r){
      res+=ele+'-exports >['+r.exportName+']'+',';
      return cls})
  }

  if ( cls.model_ && cls.model_.imports!= undefined ){
    limp=cls.model_.imports.map(function(r){
      res+=ele+'-imports >['+r.name+']'+',';
      return cls })
  }

  l =  l.concat(lImpl,lreq);
  return res + ( l != undefined ? l.map(function(cls,i){
    printElementRel(eval(cls));
  }) : '');
}

var printElement = function(cls){
  var r;
  r = printElementProp(cls);
  r+= printElementRel(cls);
  return r;
}