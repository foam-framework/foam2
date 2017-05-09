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

// TODO: This content should be modelled, with a special context setup to run
// each example and views for code and output formatting. Example code will also
// be exportable on its own as unit tests or standalone examples, so changes that
// require users to write their examples a certain way (such as logging style and
// root context access) must be compatible with different output modes.

// Hack up Model.create() to not be lazy with foam.__context__ lookup,
// which is vital for this runner where foam.__context__ changes for
// each example.


var oldInitArgs = foam.core.FObject.prototype.initArgs;
foam.CLASS({
    refines: 'foam.core.FObject',

    methods: [
      function initArgs(args, ctx) {
        // Lock in the current default context, if needed
        ctx = ctx || foam.__context__;
        return oldInitArgs.call(this, args, ctx);
      }
    ]
});


// Run FBE Exemplars in browser
var oldContext;
var oldConsole = console;
foam.async.repeat(FBE.length, function runExemplar(index) {
  var ex = FBE[index];
  if ( ! ex.platforms.web ) return Promise.resolve();

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
    var consDiv = document.createElement('div');
    consDiv.className = 'example-console';
    var pre = document.createElement('pre');
    pre.innerHTML = output.join('\n');
    document.getElementById(domOutputID).appendChild(consDiv);
    consDiv.appendChild(pre);
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
  var domID = ex.name.replace(/\s/g, '_') + "_Container";
  var domFrame = document.createElement('div');
  domFrame.id = domID;
  domFrame.className = 'example-container';
  document.body.appendChild(domFrame);

  var domOutputID = ex.name.replace(/\s/g, '_') + "_Output";
  var domOutputFrame = document.createElement('div');
  domOutputFrame.id = domOutputID;
  domOutputFrame.className = 'example-output-container';
  domFrame.appendChild(domOutputFrame);

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
      iFrame.className = 'example-iframe';
      domOutputFrame.appendChild(iFrame);
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
  // TODO: define a slot to use its get() to return the doc,
  //  then put the slot into the subContext directly without 'unsealing'
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

  // output the code
  var code = ex.generateExample();
  // TODO: offer expandable view of complete dependencies
  // Write the displayed code with deps omitted
  var exampleHTML = document.createElement('div');
  exampleHTML.className = 'example-code-view';
  exampleHTML.innerHTML = ex.generateExampleHTML(true);
  domFrame.insertBefore(exampleHTML, domFrame.firstElementChild);

  // Create a download link with the full code
  var downloadableCode =
    "// include 'src/foam.js' and this code in your test page:\n" +
    "// <html>\n" +
    "//   <head>\n" +
    "//     <script src='../../src/foam.js'></script> \n" +
    "//     <script src='thisExample.js'></script> \n" +
    "//   </head>\n" +
    "//   ...\n" +
    "// </html>\n" +
    code;

  var downloadButton = document.createElement('a');
  downloadButton.href = URL.createObjectURL(
    new Blob([downloadableCode], { type: 'application/javascript' })
  );
  downloadButton.textContent = 'Download Full Javascript';
  downloadButton.className = 'example-download-link';
  exampleHTML.appendChild(downloadButton);

  // execute the example
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
})().then(function() {
  // reverting logging strategy performed during async calls
  console = {
    __proto__: oldConsole,
    log: oldConsole.log,
    warn: oldConsole.warn,
    error: oldConsole.error,
    debug: oldConsole.debug,
    assert: oldConsole.assert
  }
});
