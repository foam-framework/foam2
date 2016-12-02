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



// Run FBE Exemplars in browser
var oldContext;
var oldConsole = console;
foam.async.repeat(FBE.length, function runExemplar(index) {
  var ex = FBE[index];

  // TODO: make log output pretty, put in a div
  var output = [];
  var logger = function() {
    var strArgs = Array.prototype.slice.call(arguments);
    strArgs.map(function(o) {
      return
        foam.Undefined.isInstance(o) ? 'undefined' :
        foam.Null.isInstance(o) ? 'null' : o.toString();
    });
    output.push(strArgs.join(' '));
  };
  var writeOutput = function() {
    // write log output
    var pre = document.createElement('pre');
    pre.innerHTML = output.join('\n');
    document.getElementById(domID).appendChild(pre);
  }
  // TODO: settle on logging strategy. Probably not using console but may want to
  //   override it to catch unfixed calls.
  console = {
    __proto__: oldConsole,
    log: logger,
    warn: logger,
    error: logger,
    debug: logger,
    assert: function(cond) {
      if ( ! cond ) {
        var args = Array.prototype.slice.call(arguments);
        args[0] = "Assertion failed: ";
        logger.apply(null, args);
      }
    }
  }

  // TODO: this should all be views :P
  // prep iframe for document output
  var domID = ex.name.replace(/\s/g, '_') + "_Output";
  var domFrame = document.createElement('div');
  domFrame.id = domID;
  domFrame.style.width = '90%';
  document.body.appendChild(domFrame);

  // Note: eval() for each exemplar may be async, so don't
  // nuke the context without waiting for the promise to resolve
  if ( oldContext) foam.__context__ = oldContext;

  // TODO: iframe-window class?
  oldContext = foam.__context__;
  foam.__context__ = foam.createSubContext({
    log: console.log,
    warn: console.warn,
    error: console.error,
    debug: console.debug,
    assert: console.assert,
    getElementById: function(id) { return this.document.getElementById(id); },
    getElementsByClassName: function(cls) { return this.document.getElementsByClassName(cls); },
  });
  foam.__context__ = { __proto__: foam.__context__ }; //unseal

  // construct iFrame lazily
  function getIFrameDoc() {
    var iFrame = document.getElementById(domID + "_frame");
    if ( ! iFrame ) {        
      iFrame = document.createElement('iframe');
      iFrame.id = domID + "_frame";
      iFrame.src = "about:blank";
      iFrame.style.float = 'right';
      iFrame.style.width = '50%';
      iFrame.style.height = '50%';
      oldConsole.log("Adding iFrame for ", domID);
      var domContainer = document.getElementById(domID);
      domContainer.insertBefore(iFrame, domContainer.firstElementChild);
    }
    return iFrame.contentDocument;
  }
  var iFrameSlot;
  function getIFrameSlot() {
    if ( ! iFrameSlot ) {
      iFrameSlot = foam.core.ConstantSlot.create({ value: getIFrameDoc() });
    }
    return iFrameSlot;
  }

  Object.defineProperty(foam.__context__, 'document$', {
    get: function() {
      return getIFrameSlot();
    }
  });
  Object.defineProperty(foam.__context__, 'document', {
    get: function() {
      return getIFrameDoc();
    }
  });
  
  var code = ex.generateExample();
  // TODO: offer expandable view of complete dependencies
  // Write the code with deps omitted
  var exampleHTML = document.createElement('div');
  exampleHTML.innerHTML = ("<hr><code>" + ex.generateExample(true) + "</code>");
  document.getElementById(domID).appendChild(exampleHTML);
  try {
    var result = eval("(function runExemplar___() { " + code + " })();");
    // TODO: if using an iframe, can pass document this way: var result = eval("function runExemplar___(document) { " + code + " }")(foam.__context__.document);
  } catch(e) {
    console.error("Exception thrown: ", e);
  }

  // if async
  if ( result && result.then ) {
    return result.then(writeOutput);
  } else {
    writeOutput();
    return result;
  }
})();
