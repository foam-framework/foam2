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

   Normally intended as an intermediate form for functional language
   compilers, Continuation Passing Style is a style of writing code,
   where methods never return, but instead are passed a "continuation"
   as an argument, where the "continuation" represents what code to
   jump to next.  See the wikipedia article for a more detailed
   explanation. https://en.wikipedia.org/wiki/Continuation-passing_style

   In JavaScript we can use Continuation Passing Style as a style of
   writing functions that allows us to "unify" asynchronous and
   synchronous functions.

   Since the continuation is passed as a parameter, a CPS function is
   free to call that continuation synchronously when it is done its
   work, or it can hold on to it and call it asynchronously at a later
   time, the calling convention remains the same when dealing with
   synchronous or asynchronous functions.

   By convention CPS functions take two special arguments before their
   remaining arguments.  The first parameter named "then" is the
   continutation to run when the function completes successfully.  The
   second parameter named "abort" is the continuation to run when an
   exception occurs.  These are analogous to "return" and "throw" in a
   typical synchronous function.

   A detailed walkthrough of the CPS library and how to use it is given below.

  // A simple CPS-style function which greets the given name
  // and then runs the continuation.
  function greet(then, abort, name) {
    var message = document.createTextNode("Hello " + name + "!");
    var container = document.createElement("div");

    container.appendChild(message);
    document.body.appendChild(container);

    then();
  }

  // To call a CPS function we have to provide the "then" and "abort" continuations.
  greet(function(){}, //then
        function(){}, //abort
        "Adam");

  // foam.cps provides foam.cps.nop as a shortcut for function(){}.
  // "nop" stands for No Operation.
  greet(foam.cps.nop, foam.cps.nop, "Adam");

  // Still a fair amount of typing, so by convention we usuall use
  // "with" to save typing foam.cps.* over and over.
  with ( foam.cps ) {
    greet(nop, nop, "Adam");
  }

  // A slightly more complex CPS style function which
  // retrieves a value from the user by creating an input
  // field and calling the continuation when input
  // is supplied.
  function prompt(then, abort) {
    var e = document.createElement("input");
    e.setAttribute("type", "text");
    e.addEventListener("change", function() {
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

  // The foam.cps library provides combinators to combine CPS
  // functions in useful ways, we can write the example above more
  // idiomatically as such.
  with ( foam.cps ) {
    // "compose" combintes two CPS functions into a single CPS
    // function.  The continuation of the second parameter is the
    // first paramter.  As a result, calls to prog(nop, nop) now
    // prompt for a name and then greet that name.

    let prog = compose(greet, prompt);
    prog(nop, nop);
  }

  // As we saw above CPS functions can take arguments in addition to
  // the continuations.  Let's write a more complete prompt function
  // that labels the input.
  function prompt2(then, abort, prompt) {
    var container = document.createElement("div");
    var label = document.createElement("label");

    var input = document.createElement("input");
    input.setAttribute("type", "text");

    // If no prompt was provided, choose a default.
    if ( arguments.length < 3 )
      prompt = "Enter text";

    var e = document.createTextNode(prompt);
    label.appendChild(e);
    label.appendChild(input);
    container.appendChild(label);

    input.addEventListener("change", function() {
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

  // "value" constructs a CPS function which always passes the given value
  // to its continuation.  This is useful for composing constant versions of
  // parameterized functions.

  // Let's compose a greeter that always greets adam.
  with ( foam.cps ) {
    // CPS function which always returns "Enter your name: "
    let question = value("Enter your name: ");

    // Compose a prompt which always asks "Enter your name: "
    let asker = compose(prompt2, question)

    let prog = compose(greet, asker);

    prog(nop, nop);
  }

  // "bind" is similar to the native JavaScript Function.bind.  It
  // takes a CPS function and does a partial appliation of that
  // function such that some of its arguments always appear as fixed
  // values.
  with ( foam.cps ) {
    // Bind the first argument of greet to "Adam"
    let prog = bind(greet, "Adam");

    prog(nop, nop);
  }

  // Let's make a more generic function to output messages.
  function message(then, abort, ...args) {
    var message = document.createTextNode(args.join(" "));
    var container = document.createElement("div");

    container.appendChild(message);
    document.body.appendChild(container);

    then();
  }

  // And here's a CPS function that always returns the current timestamp.
  function now(then, abort) {
    then(new Date().toString());
  }

  // Using our generic "message" function, let's compose methods for
  // logging warnings and errors
  with ( foam.cps ) {
    // Simple binding to add a prefix to the message.
    let warn = bind(message, "Warning:");

    warn(nop, nop, "A warning!");

    // If we want to build an outputter that prepends the current
    // timestamp then we need to be a bit more clever.  We have the
    // function "now" which just results in the current timestamp, but
    // a simple "compose" will result in a function that _only_
    // outputs the timestamp.

    let errorBroken = compose(bind(message, "ERROR @ "), now);

    // In this case "Hello?" is passed as a parameter to "now" which
    // just drops it on the floor and returns the timestamp.
    errorBroken(nop, nop, "Hello?");

    // What we need to do instead is transform our "now" function to
    // forward all the arguments it received.  We could write a more
    // complex "now" to achieve this, something like:
    // function now(then, abort, ...args) {
    //   then(new Date().toString(), ...args);
    // }
    // But that means re-writing a useful function we already had defined.
    // Instead we can use the "curry" transform to do this for us.

    let error = compose(bind(message, "ERROR @ "), curry(now));

    // Now we get the output we expected.
    error(nop, nop, "An error occured!");
  }

  // "join" can be used to compose two or more CPS functions to run in
  // parallel and share a common continuation that will be entered
  // when all the functions have finished.  The continuation will
  // receive the values from all the joined functions.

  // Here's a function which takes two names and builds a message
  // suitable for greeting both of them.
  function greetTwo(then, abort, a, b) {
    then("Hello to both " + a + " and " + b);
  }

  with ( foam.cps ) {
    // First compose a greeter than receives two names and outputs the greeting.
    let greeter = compose(message, greetTwo);

    // Next compose a prompt to ask for a name.
    let getName = compose(prompt2, value("Enter a name:"));

    // Finally compose a program with prompts for two names and greets
    // them both once given.
    let prog = compose(greeter,
                       join(getName, getName));

    // And execute our program.
    prog(nop, nop);
  }

  // In addition to "join" foam.cps also provides "sequence" for
  // composes functions into a linear sequence.

  // To demonstrate let's first add a "delay" function which waits a
  // given timeout before running the continuation.
  function delay(then, abort, time) {
    window.setTimeout(then, time);
  }

  with ( foam.cps ) {
    let sequentialProg = sequence(bind(message, 'One'),
                                  sequence(bind(delay, 2000), bind(message, 'Two')),
                                  bind(message, 'Three'));

    let parallelProg = join(bind(message, 'One'),
                            sequence(bind(delay, 2000), bind(message, 'Two')),
                            bind(message, 'Three'));

    // Will output One Two Three
    sequentialProg(nop, nop);

    // Will output One Three Two
    parallelProg(nop, nop);
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
      var container = document.createElement("div");
      var label = document.createElement("label");

      var input = document.createElement("input");
      input.setAttribute("type", "text");

      var e = document.createTextNode(prompt);
      label.appendChild(e);
      label.appendChild(input);
      container.appendChild(label);

      input.addEventListener("change", function() {
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
    // Adapt the Promised based prompt into a CPS function
    let cpsprompt = awrap(promisedPrompt);

    // Adapt the synchronous mul function into a CPS function
    let cpsmul = wrap(mul);

    // Adapt the native parseFloat into a CPS function
    let toFloat = wrap(parseFloat);

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

    // It's important here that we put the "then(n)" call in the
    // "else" condition.  Otherwise if we had written:
    //
    // if ( Number.isNaN(n) ) abort("Failed to parse float.");
    // then(n);
    //
    // and the number failed to parse, then our program would actually
    // run the "abort" continuation follow by the "then" continuation.
    //
    // This is a common mistake when writing CPS functions
  }

  // Now that we have a toFloat() CPS function which aborts on invalid
  // messages, we can use the "handle" transform to attach an error
  // handler to a CPS function. This is similar to adding a try {}
  // catch {} block around some typical synchronous code.

  with ( foam.cps ) {
    // Again, compose a prompt for a number.  This new prompt will
    // abort on invalid numbers thanks to our updated toFloat.
    let myPrompt = compose(toFloat, bind(prompt2, "Enter a number:"));

    // An error handler that will log messages.
    let errorHandler = bind(message, "ERROR:");

    // First compose our program like we did previously.
    let prog = compose(bind(message, "Product: "),
                       compose(wrap(mul), join(myPrompt, myPrompt)));

    // Finally add error handling to our program with "handle"
    prog = handle(prog, errorHandler);

    prog(nop, nop);
  }

  // This program has validation, but we can do better than just
  // aborting the whole program, let's actually recover from the error
  // and ask again.

  with ( foam.cps ) {
    // Our validating prompt from before.
    let myPrompt = compose(toFloat, bind(prompt2, "Enter a number:"));

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
                 // make the reference to retryPrompt be resolved after
                 // it has been defined.
                 retryPrompt(then, abort);
               }));

    // Now compose our program, using our new retry prompt.
    let prog = compose(bind(message, "Product:"),
                       compose(wrap(mul), join(retryPrompt, retryPrompt)));

    prog(nop, nop);
  }

  // You may have noticed that the definition of a CPS function looks
  // very similar to the function that is provided to a Promise
  // constructor.  Typically promises are constructed by doing
  // "new Promise(function(resolve, reject) {... });"
  // and a CPS function is defined as "function(then, abort, ...) { ... }"
  //
  // "then" and "abort" sure do look a lot like "resolve" and "reject"
  //
  // In fact we can take advantage of this to adapt CPS functions to
  // promises if needed to interface with existing libraries.

  // First imagine we're using some logging utility library provides code like this
  function promiseLogger(promise) {
    promise.then(function(value) {
      var message = document.createTextNode("Logged value of promise: " + value);
      var container = document.createElement("div");

      container.appendChild(message);
      document.body.appendChild(container);
    });
  }

  // If we have some complex CPS program that produces a value we wish
  // to just pass to this logger, we can do so as follows

  with ( foam.cps ) {
    // First let's build a multiplication program like we did in the
    // previous example.

    let validatingPrompt = compose(toFloat, bind(prompt2, "Enter a number:"));

    let retryPrompt = handle(validatingPrompt,
                             sequence(bind(message, "ERROR: Please enter a valid number"),
                                      function(then, abort) { retryPrompt(then, abort); }));

    // Now compose our program which computes and returns a product.
    let prog = compose(wrap(mul), join(retryPrompt, retryPrompt));

    // Finally we can pass the result of our program to a Promise based library like so
    promiseLogger(new Promise(prog));

    // This works because "prog" has the same signature as the
    // function(resolve, reject) { ... }, that a Promise constructor
    // expects.
  }

  // The CPS library also provides some convenience methods for
  // mapping, iterating and reducing arrays with CPS functions.

  with ( foam.cps ) {
    let data = [ 1, 2, 3, 4, 5 ];

    function log(then, abort, element) {
      message(then, abort, element)
    }

    // "forEach" takes a CPS function and composes it into a function
    // which takes an array and will iterate all values.
    let logger = forEach(log);
    logger(nop, nop, data);

    // We can use "wrap" from before to let us write our iteration
    // function as a normal synchronous function.
    let timestwo = wrap(function(v) {
      return v * 2;
    });

    // Use "map" to builder a mapping function from our doubler
    // defined above.
    let doubler = map(timestwo);

    let prog = compose(logger, doubler);
    prog(nop, nop, data);

    // Finally let's sum our array using the CPS "reduce" function.

    function adder(then, abort, a, b) {
      then(a + b);
    }

    prog = compose(bind(message, "Your sum is: "), reduce(adder));
    prog(nop, nop, data);
  }

 */
foam.LIB({
  name: "foam.cps",

  methods: [
    // Transform f into a function which forwards its results as
    // arguments to its continunation.
    // TODO: Is this really currying?
    function curry0(f) {
      return function(then, abort, ...curried) {
        f(function(...args) {
          then(...args, ...curried);
        }, abort);
      };
    },

    function compose(a, b) {
      if ( ! a || ! b ) throw new Error("Compose requires two functions.");

      return function(then, abort, ...args) {
        b(function(...args) { a(then, abort, ...args); }, abort, ...args);
      };
    },

    function bind(f, ...bound) {
      return function(then, abort, ...args) {
        f(then, abort, ...bound, ...args);
      };
    },

    // Compose a set of CPS functions into a single CPS function which
    // runs each given function in sequence.
    function sequence(...fs) {
      return fs.reduce(function(a, b) {
        return function(then, abort) {
          a(function() { b(then, abort); }, abort);
        };
      });
    },

    // Compose a set of CPS functions into a single CPS function that runs
    // all given functions in "parallel" and waits for them all to complete.
    // Similar to "join" but doesn't collect resulting values.
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
          f(joinThen, joinAbort, ...args);
        });
      };
    },

    // Decorate a CPS function with a separate CPS function as an error handler.
    function handle(f, c) {
      return function(then, abort, ...args) {
        f(then, function(...args) { c(then, abort, ...args); }, ...args);
      };
    },

    // Wrap a standard synchronous function into a CPS function
    function wrap(f) {
      return function(then, abort, ...args) {
        var v;
        try {
          v = f(...args);
        } catch(e) {
          abort(e);
        }
        then(v);
      }
    },

    // Wraps an asynchronous Promise returning asynchronous function
    // into a CPS function.
    function awrap(f) {
      return function(then, abort, ...args) {
        f(...args).then(function(v) {
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
          f(
            function(v) {
              pending--;
              values[i] = v;
              if ( pending == 0 ) then(...values);
            },
            joinAbort, ...args)
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

        if ( array.length == 0 ) abort("Cannot reduce an empty array");
        else if ( array.length == 1 ) then(array[0]);
        else loop(then, abort, array[0], 1);
      };
    },

    // Generates a CPS function that always aborts with the given value.
    function abort(v) {
      return function(then, abort) { abort(v); };
    },

    // Handy NO-OP function to pass for "then" and "abort" when
    // we don't care what happens when they are reached.
    function nop() {},

    function when(p, f) {
      return function(then, abort, ...args) {
        p(function(b) { if ( b ) f(then, abort, ...args); else then(); },
          abort,
          ...args);
      }
    },

    // Decorates a function to log its activity to console.  Can be
    // used as trace('foo', f); or just trace(f) if f has a suitable
    // name.
    function trace(name, f) {
      if ( typeof name == 'function' ) {
        f = name;
        name = f.name;
      }

      return function(then, abort, ...args) {
        console.log("ENTER", name, ...args);
        f(function(...args) { console.log("EXIT", name, ...args); then(...args); }, abort, ...args);
      };
    }
  ]
});
