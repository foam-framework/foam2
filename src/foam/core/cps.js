/**
 * @license
 * Copyright 2018 The FOAM Contributors
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

/**
   Continuation Passing Style (CPS) function combinators and
   support library.

   Continuation Passing Style is a means of unifying asynchronous and
   synchronous functions by passing the work to do next (the
   continuatiuon) as a parameter to the function in question, rather
   than returning from that function.

   Since the next computation is passed as a parameter, a CPS style
   function is free to call that continuation synchronously when it is
   done its work, or it can hold on to it and call it asynchronously
   at a later time, the calling convention remains the same when
   dealing with synchronous or asynchronous functions.

   By convention CPS style functions take a first parameter 'then'
   which is the next work to do after being completed.  The second
   parameter 'abort' is called when an exception occurs.


  Examples:
  // A simple CPS-style function which greets the given name
  // and then runs the continuation.
  function greet(then, abort, name) {
    var message = document.createTextNode("Hello " + name + "!");
    var container = document.createElement('div');

    container.appendChild(message);
    document.body.appendChild(container);

    then();
  }

  // Use 'with' to save typing foam.cps.* over and over.
  with ( foam.cps ) {
    // nop is a contination which does nothing.
    greet(nop, nop, "Adam");
  }

  // A slightly more complex CPS style function which
  // retrieves a value from the user by creating an input
  // field and calling the continuation when input
  // is supplied.
  function prompt(then, abort) {
    var e = document.createElement('input');
    e.setAttribute('type', 'text');
    e.addEventListener('change', function() {
      var value = e.value;
      e.remove();
      then(value);
    });
    document.body.appendChild(e);
  }
  with ( foam.cps ) {
    // Here we call prompt and the continuation we pass it is
    // a call to greet().
    prompt(function(name) { greet(nop, nop, name); }, nop);
  }

  // The foam.cps library provides combinators to make examples like
  // the one above more conventional looking
  with ( foam.cps ) {
    // 'compose' combintes two CPS-style functions into a single CPS-style function.
    // The continuation of the second parameter is the first paramter.
    // As a result, calls to prog(nop, nop) now prompt for a name and then
    // greet that name.
    let prog = compose(greet, prompt);
    prog(nop, nop);
  }

  // As we say above CPS-style functions can take arguments in
  // addition to the continuations.  Let's write a more complete
  // prompt function that labels the input.
  function prompt2(then, abort, prompt) {
    var container = document.createElement('div');
    var label = document.createElement('label');

    var input = document.createElement('input');
    input.setAttribute('type', 'text');

    // If no prompt was provided, choose a default.
    if ( arguments.length < 3 )
      prompt = "Enter text";

    var e = document.createTextNode(prompt);
    label.appendChild(e);
    label.appendChild(input);
    container.appendChild(label);

    input.addEventListener('change', function() {
      var value = input.value;
      container.remove();
      then(value);
    });
    document.body.appendChild(container);

    // Focus the input for our user.
    input.focus();
  }

  // Now lets use our new prompt to make it clear we're asking for a name.
  with ( foam.cps ) {
    let prog = compose(greet, prompt2);
    prog(nop, nop, "Enter your name: ");
  }

  // 'value' constructs a CPS-style function which always passes the given value
  // to its continuation.  This is useful for composing constant versions of
  // parameterized functions.

  // Let's compose a greeter that always greets adam.
  with ( foam.cps ) {
    // CPS-style function which always returns "Adam"
    let name = value('Adam');

    // Compose a greeter that always greets "Adam"
    let prog = compose(greet, name);

    prog(nop, nop);
  }

  // 'bind' is similar to the native JavaScript Function.bind.  It takes a
  // CPS-style function and does a partial appliation of that function
  // to fix any number of its arguments.
  with ( foam.cps ) {
    // Bind the first argument of greet to 'Adam'
    let prog = bind(greet, 'Adam');

    prog(nop, nop);
  }

  // Let's make a more generic function to output messages.
  function message(then, abort) {
    var message = document.createTextNode(Array.from(arguments).slice(2).join(' '));
    var container = document.createElement('div');

    container.appendChild(message);
    document.body.appendChild(container);

    then();
  }

  function now(then, abort) {
    then(new Date().toString());
  }

  // Now we can bind our message function to prepend output to every line.
  with ( foam.cps ) {
    // Simple binding to add a prefix to the message.
    let warn = bind(message, "Warning:");

    warn(nop, nop, "A warning!");

    // If we want to build an outputter that prepends the current
    // timestamp then we need to be a bit more clever.  We have the
    // function 'now' which just results in the timestamp, but a
    // simple 'compose' will result in a function that _only_ outputs
    // the timestamp.

    let errorBroken = compose(bind(message, "ERROR @ "), now);

    // In this case "Hello?" is passed as a parameter to 'now' which
    // just drops it on the floor and returns the timestamp.
    errorBroken(nop, nop, "Hello?");

    // What we need to do instead is transform our 'now' function to
    // forward all the arguments it received.  We could write a more
    // complex 'now' to achieve this, something like:
    // function now(then, abort) {
    //   then.apply(null, [new Date().toString()].concat(Array.from(arguments)));
    // }
    // But that means re-writing a useful function we already had defined.
    // Instead we can use the 'curry' transform to do this for us.

    let error = compose(bind(message, "ERROR @ "), curry(now));

    // Now we get the output we expected.
    error(nop, nop, "An error occured!");
  }

  // Similarly we can compose a prompt that always asks for a name.
  with ( foam.cps ) {
    let getName = compose(prompt2, value("Enter your name:"));

    // And now compose our program to ask for the name.
    let prog = compose(greet, getName);
    prog(nop, nop);
  }

  // 'join' can be used to compose two CPS-style functions to run in "parallel"
  // and share a common continuation that will be entered when all the
  // functions have finished.  The continuation will receive the values
  // from all the joined functions.

  // Here's a function which takes two names and builds a message
  // suitable for greeting both of them.
  function greetTwo(then, abort, a, b) {
    then("Hello to both " + a + " and " + b);
  }

  with ( foam.cps ) {
    let greeter = compose(message, greetTwo);
    let getName = compose(prompt2, value("Enter a name:"));

    // Compose a program with prompts for two names and greets them
    // both once given.
    let prog = compose(greeter,
                       join(getName, getName));

    // And execute our program.
    prog(nop, nop);
  }


  // foam.cps provides wrappers for interfacing with existing
  // synchronous functions and Promise based asynchronous functions.

  // Let's build a little multiplication program using these facilities and others.

  // First here's a prompt function built using promises.
  function promisedPrompt(prompt) {
    // If no prompt was provided, choose a default.
    if ( arguments.length < 1 )
      prompt = "Enter text";

    return new Promise(function(resolve, reject) {
      var container = document.createElement('div');
      var label = document.createElement('label');

      var input = document.createElement('input');
      input.setAttribute('type', 'text');

      var e = document.createTextNode(prompt);
      label.appendChild(e);
      label.appendChild(input);
      container.appendChild(label);

      input.addEventListener('change', function() {
        var value = input.value;
        container.remove();
        resolve(value);
      });
      document.body.appendChild(container);

      // Focus the input for our user.
      input.focus();
    });
  }

  // And here's a typical synchronous multiplication function
  function mul(a, b) { return a * b; }

  with ( foam.cps ) {
    // Adapt the native parseFloat to CPS-style.
    let toFloat = wrap(parseFloat);

    // Adapt the Promised based prompt into a CPS-style function
    let cpsprompt = awrap(promisedPrompt);

    // Adapt the synchronous mul function into a CPS-style function
    let cpsmul = wrap(mul);

    // Build a prompt which asks specifically for numbers and turns
    // the input into a float
    let myPrompt = compose(toFloat,
                           compose(cpsprompt, value("Enter a number:")));

    let myMessage = bind(message, "Your product is:");

    let prog = compose(myMessage,
                       compose(cpsmul, join(myPrompt, myPrompt)));

    // And run it
    prog(nop, nop);
  }

  // Our program has some limitations however, if the user doesn't
  // enter a valid number, then they get NaN as a result.  We should
  // add some validation and error handling to enforce proper input
  // and give the user a chance to recover

  // First a toFloat that aborts on NaN
  function toFloat(then, abort, s) {
    var n = parseFloat(s);
    if ( Number.isNaN(n) ) abort("Failed to parse float.");
    else then(n);
  }

  with ( foam.cps ) {
    // Again, compose a prompt for the number.  This new prompt will
    // abort on invalid numbers thanks to our updated toFloat.
    let myPrompt = compose(toFloat, bind(prompt2, "Enter a number:"));

    // An error handler that will log messages.
    let errorHandler = bind(message, "ERROR:");

    // Finally compose our multiplication program with a our error handler.
    let prog = handle(compose(bind(message, "Product:"),
                              compose(wrap(mul), join(myPrompt, myPrompt))),
                      errorHandler);

    prog(nop, nop);
  }

  // This program has validation, but we can do better than just
  // aborting the whole program, let's actually recover from the error
  // and ask again.

  with ( foam.cps ) {
    // Our validating prompt from before.
    let myPrompt = compose(toFloat, bind(prompt2, 'Enter a number:'));


    // Now we decorate the prompt with an error handler that will
    // notify the user of their mistake and prompt them again.
    let retryPrompt = handle(
      myPrompt,
      sequence(bind(message, "ERROR: Please enter a valid number"),
               function(then, abort) {
                 // This function is what allows us to loop the
                 // prompt. After messaging the user of their mistake
                 // we want to enter retryPrompt again.
                 //
                 // It's tempting to try to write:
                 //
                 // let retryPrompt = sequence(bind(...),
                 //                            retryPrompt);
                 //
                 // But that actually won't work.  We can't just refer to
                 // retryPrompt while we're in the process of
                 // definining it.
                 //
                 // Instead we have to use this wrapper function to
                 // make the reference to retryPrompt be resolved at
                 // runtime.
                 retryPrompt(then, abort);
               }));

    // We'll leave our top level error handler in case any other abort happens.
    let errorHandler = bind(message, "ERROR:");

    // Again compose our program, using our new retry prompt.
    let prog = handle(compose(bind(message, "Product:"),
                              compose(wrap(mul), join(retryPrompt, retryPrompt))),
                      errorHandler);

    prog(nop, nop);
  }

  // The CPS library also provides some convenience methods for
  // mapping, iterating and reducing arrays with CPS functions.

  with ( foam.cps ) {
    let data = [ 1, 2, 3, 4, 5 ];

    function log(then, abort, element) {
      message(then, abort, element)
    }

    // 'forEach' takes a CPS function and composes it into a function
    // which takes an array and will iterate all values.
    let logger = forEach(log);
    logger(nop, nop, data);

    // We can use 'wrap' from before to let us write our iteration
    // function as a normal synchronous function.
    let timestwo = wrap(function(v) {
      return v * 2;
    });

    // Use 'map' to builder a mapping function from our doubler
    // defined above.
    let doubler = map(timestwo);

    let prog = compose(logger, doubler);
    prog(nop, nop, data);

    // Finally let's sum our array using the CPS 'reduce' function.

    function adder(then, abort, a, b) {
      then(a + b);
    }

    prog = compose(bind(message, 'Your sum is: '), reduce(adder));
    prog(nop, nop, data);
  }

 */
foam.LIB({
  name: 'foam.cps',

  methods: [
    function apply(then, abort, f, args) {
      f.apply(null, [
        then, abort
      ].concat(args));
    },

    // Transform f into a function which forwards its results as
    // arguments to its continunation.
    // TODO: Is this really currying?
    function curry(f) {
      return function(then, abort, ...curried) {
        f(function(...args) {
          then.apply(null, args.concat(curried));
        });
      };
    },

    function compose(a, b) {
      return function(then, abort, ...args) {
        b.apply(null, [
          function(...args) { a.apply(null, [then, abort].concat(args)); },
          abort,
        ].concat(args));
      };
    },

    function bind(f, ...bound) {
      return function(then, abort, ...args) {
        f.apply(null, [
          then,
          abort
        ].concat(bound, args));
      };
    },

    function apply(then, abort, f, args) {
      f.apply(null, [
        then, abort
      ].concat(args));
    },

    // Compose a set of CPS functions into a single CPS function which
    // runs each given function in sequence.
    function sequence(...fs) {
      return fs.reduce(function(a, b) {
        return function(then, abort) {
          a.apply(null, [
            function() { b.apply(null, [then, abort]); },
            abort
          ]);
        };
      });
    },

    // Compose a set of CPS functions into a single CPS function that runs
    // all given functions in "parallel" and waits for them all to complete.
    // Similar to 'join' but doesn't collect resulting values.
    function parallel(...fs) {
      return function(then, abort, ...args) {
        var pending = fs.length;

        function joinThen() {
          pending--;
          if ( pending == 0 ) then();
        }

        function joinAbort() {
          if ( pending > 0 ) {
            pending = -1;
            abort();
          }
        }

        fs.forEach(function(f) {
          f.apply(null, [
            joinThen,
            joinAbort
          ].concat(args));
        });
      };
    },

    // Decorate a CPS function with a separate CPS function as an error handler.
    function handle(f, c) {
      return function(then, abort, ...args) {
        f.apply(null, [
          then,
          function(...args) {
            c.apply(null, [then, abort].concat(args));
          }
        ].concat(args));
      };
    },

    // Wrap a standard synchronous function into a CPS-style function
    function wrap(f) {
      return function(then, abort, ...args) {
        var v;
        try {
          v = f.apply(null, args);
        } catch(e) {
          abort(e);
        }
        then(v);
      }
    },

    // Wraps an asynchronous Promise returning asynchronous function
    // into a CPS-style function.
    function awrap(f) {
      return function(then, abort, ...args) {
        f.apply(null, args).then(function(v) {
          then(v);
        }, function(e) {
          abort(e);
        });
      };
    },

    // Compose a function which runs all the given functions in "parallel"
    // and combines their return values as arguments the shared continuation.
    function join(...fs) {
      return function(then, abort, ...args) {
        var pending = fs.length
        var values = new Array(fs.length);

        var joinAbort = function(e) {
          if ( pending > 0 ) {
            pending = -1;
            abort(e);
          }
        };

        fs.forEach(function(f, i) {
          f.apply(null, [
            function(v) {
              pending--;
              values[i] = v;
              if ( pending == 0 ) then.apply(null, values);
            },
            joinAbort
          ].concat(args));
        });
      }
    },

    // Generates a CPS function that always returns the same value.
    function value(v) {
      return function(then, abort) { then(v); };
    },

    function forEach(f) {
      return function(then, abort, array) {
        function loop(then, abort, i) {
          if ( i < array.length )
            f(function() { loop(then, abort, i + 1); },
              abort,
              array[i],
              i,
              array);
          else
            then();
        }
        loop(then, abort, 0);
      };
    },

    function map(f) {
      return function(then, abort, array) {
        var ret = new Array(array.length);

        function loop(then, abort, i) {
          if ( i < array.length )
            f(function(v) { ret[i] = v; loop(then, abort, i + 1); },
              abort,
              array[i],
              i,
              array);
          else
            then(ret);
        }

        loop(then, abort, 0);
      };
    },

    function reduce(f) {
      return function(then, abort, array) {
        function loop(then, abort, acc, i) {
          if ( i < array.length )
            f(function(v) { loop(then, abort, v, i + 1); },
              abort,
              acc,
              array[i],
              i,
              array);
          else
            then(acc);
        }

        if ( array.length == 0 ) abort('Cannot reduce an empty array');
        else if ( array.length == 1 ) then(array[0]);
        else loop(then, abort, array[0], 1);
      };
    },

    // Generates a CPS function that always aborts with the given value.
    function abort(v) {
      return function(then, abort) { abort(v); };
    },

    // Handy NO-OP function to pass for 'then' and 'abort' when
    // we don't care what happens when they are reached.
    function nop() {}
  ]
});
