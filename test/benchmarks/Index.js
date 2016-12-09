/**
 * @license
 * Copyright 2012 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KM.IND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
jasmine.DEFAULT_TIMEOUT_INTERVAL = 2400000;

if ( ! typeof performance !== 'undefined' ) performance = {
  now: function() { return Date.now(); }
};



xdescribe("Index benchmarks", function() {
  var DEBUG = false;
  var oldRandom;
  var rseed;

  beforeEach(function() {
    // make runs consistent with fake random()
    rseed = 1;
    function random() {
      var x = Math.sin(rseed++) * 10000;
      return x - Math.floor(x);
    }
    oldRandom = Math.random;
    Math.random = random;

  });
  afterEach(function() {
    Math.random = oldRandom;
  });

  xit("Multi-level index", function(done) {

    foam.CLASS({
      name: 'Subject',
      properties: [
        {                   name: 'id' },
        { class: 'Int',     name: 'intP' },
        { class: 'Boolean', name: 'boolP' },
        { class: 'String',  name: 'stringP' },
      ]
    });

    var NUM_SUBJECTS = 100000;

    var SUBJECT_EQ = NUM_SUBJECTS / 2;
    var MEAN_INT_VALUE = 10;
    var INT_SPREAD = NUM_SUBJECTS / 20;

    var subjectDAO;
    var subjects = foam.dao.ArrayDAO.create();

    var M = foam.mlang.ExpressionsSingleton.create();

    var idx1 = Subject.INT_P.toIndex(Subject.BOOL_P.toIndex(Subject.ID.toIndex(
                  foam.dao.index.ValueIndex.create())));
    var idx2 = Subject.STRING_P.toIndex(Subject.INT_P.toIndex(Subject.ID.toIndex(
                  foam.dao.index.ValueIndex.create())));

    subjectDAO = foam.dao.MDAO.create({ of: Subject })
      //.addPropertyIndex(Subject.INT_P)
      //.addPropertyIndex(Subject.INT_P, Subject.BOOL_P)
      .addIndex(
        foam.dao.index.AltIndex.create({
          delegateFactories: [ idx1, idx2 ],
          delegates: [ idx1.createTail(), idx2.createTail() ]
        })
      )
      //.addPropertyIndex(Subject.INT_P, Subject.BOOL_P, Subject.STRING_P)
      .addPropertyIndex(Subject.STRING_P, Subject.BOOL_P);

    function cloneSubjects() {
      for ( var i = 0; i < subjects.array.length; i++ ) {
         subjects.array[i] = subjects.array[i].clone();
      }
    }
    function resetRandomizer() {
      rseed = 1;
    }

    return Promise.resolve().then(foam.async.sequence([
      foam.async.sleep(100),
      foam.async.atest('CreateSubjects' + NUM_SUBJECTS, foam.async.repeat(NUM_SUBJECTS, function (i) {
        subjects.array.push(
          Subject.create({
            id: ""+i,
            boolP: !! ( i % 2 ),
            intP: (Math.random() * INT_SPREAD) - (INT_SPREAD / 2),
            stringP: foam.uuid.randomGUID()
          })
        );
      })),
      foam.async.repeat(10,
        foam.async.sequence([
          foam.async.log('Benchmark...'),
          resetRandomizer,
          cloneSubjects,
          foam.async.atest('Bulk Load ' + NUM_SUBJECTS, function() {
            return subjectDAO.bulkLoad(subjects);
          }),
          foam.async.atestSelect('Select EQ By Index(Int, Bool)', function() {
            return subjectDAO.where(M.AND(
              M.EQ(Subject.INT_P,  subjects.array[SUBJECT_EQ].intP),
              M.EQ(Subject.BOOL_P, subjects.array[SUBJECT_EQ].boolP)
            )).select();
          }),
          foam.async.atestSelect('Select GT By Index(Int: '+MEAN_INT_VALUE+', Bool:true)', function() {
            return subjectDAO.where(M.AND(
              M.GT(Subject.INT_P,  MEAN_INT_VALUE),
              M.EQ(Subject.BOOL_P, true)
            )).select();
          }),
          foam.async.atestSelect('Select GT By Index(Int: '+MEAN_INT_VALUE+
              ', String: for '+SUBJECT_EQ+' )', function() {
            return subjectDAO.where(M.AND(
              M.GT(Subject.INT_P,  MEAN_INT_VALUE),
              M.EQ(Subject.STRING_P, subjects.array[SUBJECT_EQ].stringP)
            )).select();
          }),
          foam.async.atestSelect('Select LT/GT By Index(String: for '+SUBJECT_EQ+', Int: '+MEAN_INT_VALUE+' )', function() {
            return subjectDAO.where(M.AND(
              M.LT(Subject.STRING_P, subjects.array[SUBJECT_EQ].stringP),
              M.GT(Subject.INT_P,  MEAN_INT_VALUE)
            )).select();
          }),
          foam.async.atestSelect('Select OR By Index(Int: range(20), Bool:true || Int: range(20), Bool:false)', function() {
            return subjectDAO.where(
              M.OR(
                M.AND(
                  M.LT(Subject.INT_P,  MEAN_INT_VALUE + 100),
                  M.GT(Subject.INT_P,  MEAN_INT_VALUE + 110),
                  M.EQ(Subject.BOOL_P, true)
                ),
                M.AND(
                  M.LT(Subject.INT_P,  MEAN_INT_VALUE + 1),
                  M.GT(Subject.INT_P,  MEAN_INT_VALUE - 10),
                  M.EQ(Subject.BOOL_P, false)
                )
              )
            ).select();
          }),
          foam.async.sleep(2000), // pause to let GC run
          cloneSubjects,
          foam.async.atest('Update some 100', function() {
            var p = [];
            for ( var i = 200; i < 300; i++ ) {
              // change every property
              var subj = subjects.array[i];
              subj.boolP = !! ( i % 2 ),
              subj.intP = (Math.random() * INT_SPREAD) - (INT_SPREAD / 2),
              subj.stringP = foam.uuid.randomGUID()

              // put back in
              p.push(subjectDAO.put(subj));
            }
            return Promise.all(p);
          }),
          cloneSubjects,
          foam.async.atest('Update many ' + NUM_SUBJECTS/10, function() {
            var p = [];
            for ( var i = 0; i < subjects.array.length/10; i++ ) {
              // change every property
              var subj = subjects.array[i];
              subj.boolP = !! ( i % 2 ),
              subj.intP = (Math.random() * INT_SPREAD) - (INT_SPREAD / 2),
              subj.stringP = foam.uuid.randomGUID()

              // put back in
              p.push(subjectDAO.put(subj));
            }
            //return Promise.all(p); // on node this makes a difference
          }),

          foam.async.atest('Cleanup', function() {
            return subjectDAO.removeAll();
          }),
          foam.async.sleep(5000) // pause to let GC run
        ])
      ),
      foam.async.log('Done.'),
      done
    ]));

  });
});
