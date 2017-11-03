/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
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

describe('mixed registry types', function() {
  // TODO(markdittmer): Come up with a non-manual test that will confirm all
  // registries clean up properly.

  it('should appropriately manage mixed registry types', function(done) {
    // Load code shared with forks.
    require(`${__dirname}/../../ipc/box_mixed_shared.js`);

    var stubFactory = foam.core.StubFactorySingleton.create();

    // Constructor for foam.box.Context'ualized BoxRegistry.
    function createRegistry(name, Cls, argsFactory) {
      var context = foam.box.Context.create({ myname: name });
      context.registry = Cls.create(argsFactory(context), context);
      return context.registry;
    }

    // Constructor for remote (forked) worker BoxRegistry.
    function createWorkerRegistry(ctx, name) {
      return stubFactory.get(foam.box.BoxRegistry).create({
        delegate: foam.box.node.ForkBox.create({
          childScriptPath: `${__dirname}/../../ipc/box_mixed_forkScript.js`
        }, ctx)
      }, ctx);
    }

    // Create registry for service setup.
    var container = foam.box.Context.create({ myname: '/container' });

    // Worker info for two services that each have a "dedicated worker".
    var a = createWorkerRegistry(container, '/aWorker');
    var aPid = a.delegate.child_.pid;
    var b = createWorkerRegistry(container, '/bWorker');
    var bPid = b.delegate.child_.pid;

    // Worker info for "shared workers".
    var numWorkers = 4;
    var workers = new Array(numWorkers);
    var workerPids = new Array(numWorkers);
    for ( var i = 0; i < numWorkers; i++ ) {
      workers[i] = createWorkerRegistry(container, `/worker${i}`);
      workerPids[i] = workers[i].delegate.child_.pid;
    }

    // Local registry strategies for dedicated and shared workers.
    var aRegistry = createRegistry(
        '/a', foam.box.SelectorRegistry, function(ctx) {
          return {
            selector: foam.box.test.SkeletonClassRegistrySelector.create({
              cls: foam.box.test.ServiceA,
              clsRegistry: a
            }, ctx)
          };
        });
    var bRegistry = createRegistry(
        '/b', foam.box.SelectorRegistry, function(ctx) {
          return {
            selector: foam.box.test.SkeletonClassRegistrySelector.create({
              cls: foam.box.test.ServiceB,
              clsRegistry: b
            }, ctx)
          };
        });
    var workerBroadcastRegistry = createRegistry(
        '/broadcast', foam.box.BroadcastRegistry, function(ctx) {
          return {
            delegates: workers
          };
        });

    // Unify registry: Delegate A Selector => B Selector => Shared Workers.
    aRegistry.selector.delegate = bRegistry;
    bRegistry.selector.delegate = workerBroadcastRegistry;
    var registry = aRegistry;

    // Register ServiceA, ServiceB, and WorkerService.
    var aService = stubFactory.get(foam.box.test.ServiceA).create({
      delegate: registry.register('a', null, foam.box.SkeletonBox.create({
        data: foam.box.test.ServiceA.create()
      }))
    }, container);
    var bService = stubFactory.get(foam.box.test.ServiceB).create({
      delegate: registry.register('b', null, foam.box.SkeletonBox.create({
        data: foam.box.test.ServiceB.create()
      }))
    }, container);
    var workerService = stubFactory.get(foam.box.test.WorkerService).create({
      delegate: registry.register('workers', null, foam.box.SkeletonBox.create({
        data: foam.box.test.WorkerService.create()
      }))
    }, container);

    // Create expectations for PIDs reported by each service call.
    var promises = [
      aService.report().then(function(pid) { expect(pid).toBe(aPid); }),
      bService.report().then(function(pid) { expect(pid).toBe(bPid); }),
    ];
    for ( var i = 0; i < 2 * numWorkers; i++ ) {
      promises.push(workerService.report().then(function(i, pid) {
        expect(pid).toBe(workerPids[i % numWorkers]);
      }.bind(this, i)));
    }

    // Kill all workers.
    function cleanup() {
      a.delegate.child_.kill();
      b.delegate.child_.kill();
      for ( var i = 0; i < workers.length; i++ ) {
        workers[i].delegate.child_.kill();
      }
    }

    // Wait on expectations; kill workers, then done.
    Promise.all(promises).then(function() {
      cleanup();
      done();
    }, function() {
      cleanup();
      done.fail();
    });
  });
});
