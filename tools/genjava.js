/**
* @license
* Copyright 2016 Google Inc. All Rights Reserved.
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

// enable FOAM java support.
global.FOAM_FLAGS = { 'java': true, 'debug': true };

require('../src/foam.js');

if ( process.argv.length != 4 ) {
 console.log("USAGE: genjava.js input-path output-path");
 process.exit(1);
}

var indir = process.argv[2];
indir = require('path').resolve(require('path').normalize(indir));

var externalFile = require(indir);
var classes = externalFile.classes;
var abstractClasses = externalFile.abstractClasses;
var skeletons = externalFile.skeletons;
var proxies = externalFile.proxies;

var outdir = process.argv[3];
outdir = require('path').resolve(require('path').normalize(outdir));

function ensurePath(p) {
 var i = 1 ;
 var parts = p.split(require('path').sep);
 var path = '/' + parts[0];

 while ( i < parts.length ) {
   try {
     var stat = require('fs').statSync(path);
     if ( ! stat.isDirectory() ) throw path + 'is not a directory';
   } catch(e) {
     require('fs').mkdirSync(path);
   }

   path += require('path').sep + parts[i++];
 }
}

function loadClass(c) {
 if ( ! foam.lookup(c, true) ) require('../src/' + c.replace(/\./g, '/') + '.js');
 return foam.lookup(c);
}

function generateClass(cls) {
 if ( typeof cls === 'string' )
   cls = foam.lookup(cls);

 var outfile = outdir + require('path').sep +
   cls.id.replace(/\./g, require('path').sep) + '.java';

 ensurePath(outfile);

 require('fs').writeFileSync(outfile, cls.buildJavaClass().toJavaSource());
}

function generateAbstractClass(cls) {
 cls = foam.lookup(cls);

 var outfile = outdir + require('path').sep +
   cls.id.replace(/\./g, require('path').sep) + '.java';

 ensurePath(outfile);

 var javaclass = cls.buildJavaClass();
 javaclass.abstract = true;

 require('fs').writeFileSync(outfile, javaclass.toJavaSource());
}

function generateSkeleton(cls) {
 cls = foam.lookup(cls);

 var outfile = outdir + require('path').sep +
   cls.package.replace(/\./g, require('path').sep) +
   require('path').sep + cls.name + 'Skeleton.java';

 ensurePath(outfile);

 require('fs').writeFileSync(
   outfile,
   foam.java.Skeleton.create({ of: cls }).buildJavaClass().toJavaSource());
}

function generateProxy(intf) {
 intf = foam.lookup(intf);

 var existing = foam.lookup(intf.package + '.Proxy' + intf.name, true);

 if ( existing ) {
   generateClass(existing.id);
   return;
 }

 var proxy = foam.core.Model.create({
   package: intf.package,
   name: 'Proxy' + intf.name,
   implements: [intf.id],
   properties: [
     {
       class: 'Proxy',
       of: intf.id,
       name: 'delegate'
     }
   ]
 });

 generateClass(proxy.buildClass());
}

classes.forEach(loadClass);
abstractClasses.forEach(loadClass);
skeletons.forEach(loadClass);
proxies.forEach(loadClass);


classes.forEach(generateClass);
abstractClasses.forEach(generateAbstractClass);
skeletons.forEach(generateSkeleton);
proxies.forEach(generateProxy);
