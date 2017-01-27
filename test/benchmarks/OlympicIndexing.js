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



describe("Index benchmarks", function() {
  var DEBUG = false;
  var oldRandom;
  var rseed;
  var m;
  var Medal;
  var SAMPLE_PREDICATES_A;
  var dao;
  var rawData;

  function loadMedalData(dao) { // resolves when dao is filled

    if ( ! rawData ) {
      var xhr = ((foam.net.node && foam.net.node.HTTPRequest) ||
          foam.net.HTTPRequest).create({
        responseType: 'json',
        method: 'GET'
      });
      if ( foam.net.node )
        xhr.fromUrl('http://localhost:8888/MedalData.json');
      else
        xhr.fromUrl('https://raw.githubusercontent.com/foam-framework/foam/' +
                 'master/js/foam/demos/olympics/MedalData.json');
      var self = this;
      return xhr.send().then(function(res) {
        console.log("XHR started");
        return res.payload;
      }).then(function(json) {
        console.log("XHR complete, parsing...");
        rawData = json;
        if ( ! Array.isArray(json) ) {
          rawData = foam.json.parseString(json);
        }

        var p = [];
        for ( var i = 0; i < rawData.length; i++ ) {
          p.push(dao.put(Medal.create(rawData[i])));
        }
        console.log("Loaded ", rawData.length, ".");
        return Promise.all(p);
      });
    } else {
      var p = [];
      for ( var i = 0; i < rawData.length; i++ ) {
        p.push(dao.put(Medal.create(rawData[i])));
      }
      console.log("Reloaded ", rawData.length, ".");
      return Promise.all(p);
    }
  }


  beforeEach(function() {
    // make runs consistent with fake random()
    rseed = 1;
    function random() {
      var x = Math.sin(rseed++) * 10000;
      return x - Math.floor(x);
    }
    oldRandom = Math.random;
    Math.random = random;

    m = foam.mlang.ExpressionsSingleton.create();

    foam.ENUM({
      package: 'benchmarks.olympics',
      name: 'MedalColor',
      values: [
        {
          name: 'GOLD', label: 'Gold'
        },
        {
          name: 'SILVER', label: 'Silver'
        },
        {
          name: 'BRONZE', label: 'Bronze'
        }
      ]
    });
    MedalColor = benchmarks.olympics.MedalColor;

    foam.CLASS({
      package: 'benchmarks.olympics',
      name: 'Medal',

      properties: [
        { name: 'id', hidden: true },
        { class: 'Int', name: 'year', shortName: 'y' },
        {
          class: 'Enum',
          of: 'benchmarks.olympics.MedalColor',
          name: 'color',
          shortName: 'c',
          aliases: [ 'colour', 'medal' ],
        },
        { name: 'city', shortName: 'cy' },
        { name: 'country', shortName: 'cn' },
        { name: 'discipline', shortName: 'd', hidden: true },
        { name: 'sport', shortName: 's' },
        { name: 'event', shortName: 'e' },
        { name: 'eventGender', shortName: 'eg', value: 'M' },
        {
          name: 'gender',
          shortName: 'g',
          aliases: [ 'sex' ],
          value: 'Men',
        },
        { name: 'firstName', shortName: 'f', aliases: [ 'fname', 'fn', 'first' ] },
        { name: 'lastName', shortName: 'l', aliases: [ 'lname', 'ln', 'last' ] }
      ]
    });
    Medal = benchmarks.olympics.Medal;

    dao = foam.dao.EasyDAO.create({
      of: Medal,
      seqNo: true,
      autoIndex: false,
      dedup: true,
      daoType: 'MDAO'
    });

    autodao = foam.dao.EasyDAO.create({
      of: Medal,
      seqNo: true,
      autoIndex: true,
      dedup: true,
      daoType: 'MDAO'
    });

  });
  afterEach(function() {
    Math.random = oldRandom;
  });


  xit('benchmarks manual indexes', function(done) {
    loadMedalData(dao).then(
      foam.async.sequence([
        foam.async.atest('Build index on most properties', function() {
          dao.addPropertyIndex(Medal.CITY, Medal.YEAR, Medal.GENDER, Medal.COUNTRY, Medal.EVENT);
        }),
        foam.async.atest('Build index on one property', function() {
          dao.addPropertyIndex(Medal.CITY);
        }),
        foam.async.atest('Build index on no properties (just ID)', function() {
          dao.addPropertyIndex();
        }),
      ])
    ).then(done);
  });


  it('benchmarks sample set A', function(done) {
    SAMPLE_PREDICATES_A = [
      foam.mlang.predicate.True.create(),
      m.AND(m.CONTAINS_IC(Medal.COUNTRY, "c"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.CONTAINS_IC(Medal.COUNTRY, "c"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.EQ(Medal.GENDER, "Men"),
      m.CONTAINS_IC(Medal.COUNTRY, "CHI"),
      m.AND(m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.EQ(Medal.GENDER, "Men"),
      m.CONTAINS_IC(Medal.COUNTRY, "CHI"),
      m.AND(m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI")),
      m.AND(m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI")),
      m.AND(m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI")),
      m.AND(m.EQ(Medal.YEAR, 2), m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.YEAR, 2), m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.YEAR, 2), m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.YEAR, 2), m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.YEAR, 2), m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.YEAR, 2), m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.YEAR, 2), m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.YEAR, 2), m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI")),
      m.AND(m.EQ(Medal.YEAR, 20), m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.YEAR, 20), m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.YEAR, 20), m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.YEAR, 20), m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.YEAR, 20), m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.YEAR, 20), m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.YEAR, 20), m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.YEAR, 20), m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI")),
      m.AND(m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI")),
      m.AND(m.EQ(Medal.YEAR, 1), m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.YEAR, 1), m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.YEAR, 1), m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.YEAR, 1), m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.YEAR, 1), m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.YEAR, 1), m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.YEAR, 1), m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.YEAR, 1), m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI")),
      m.AND(m.EQ(Medal.YEAR, 19), m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.YEAR, 19), m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.YEAR, 19), m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.YEAR, 19), m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.YEAR, 19), m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.YEAR, 19), m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.YEAR, 19), m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.YEAR, 19), m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI")),
      m.AND(m.EQ(Medal.YEAR, 195), m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.YEAR, 195), m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.YEAR, 195), m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.YEAR, 195), m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.YEAR, 195), m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.YEAR, 195), m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.YEAR, 195), m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.YEAR, 195), m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI")),
      m.AND(m.EQ(Medal.YEAR, 1956), m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.YEAR, 1956), m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.YEAR, 1956), m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.YEAR, 1956), m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.YEAR, 1956), m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.YEAR, 1956), m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.YEAR, 1956), m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.YEAR, 1956), m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI")),
      m.AND(m.EQ(Medal.YEAR, 1956), m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.YEAR, 1956), m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.YEAR, 1956), m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.YEAR, 1956), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.YEAR, 1956), m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.YEAR, 1956), m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.YEAR, 1956), m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.YEAR, 1956), m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI")),
      m.AND(m.EQ(Medal.YEAR, 1956), m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.EVENT, "71-"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.YEAR, 1956), m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.EVENT, "71-"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.YEAR, 1956), m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.EVENT, "71-"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.EVENT, "71-"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.YEAR, 1956), m.CONTAINS_IC(Medal.EVENT, "71-"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.YEAR, 1956), m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.EVENT, "71-"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.YEAR, 1956), m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.YEAR, 1956), m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.EVENT, "71-"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.YEAR, 1956), m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.EVENT, "71-"), m.CONTAINS_IC(Medal.COUNTRY, "CHI")),
      m.AND(m.EQ(Medal.YEAR, 1956), m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.YEAR, 1956), m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.YEAR, 1956), m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.YEAR, 1956), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.YEAR, 1956), m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.YEAR, 1956), m.CONTAINS_IC(Medal.CITY, "c"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.YEAR, 1956), m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.COUNTRY, "CHI")),
      m.AND(m.EQ(Medal.COLOR, 'BRONZE'), m.EQ(Medal.YEAR, 1956), m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.COLOR, 'BRONZE'), m.EQ(Medal.YEAR, 1956), m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.YEAR, 1956), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.COLOR, 'BRONZE'), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.COLOR, 'BRONZE'), m.EQ(Medal.YEAR, 1956), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.COLOR, 'BRONZE'), m.EQ(Medal.YEAR, 1956), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.COLOR, 'BRONZE'), m.EQ(Medal.YEAR, 1956), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.COLOR, 'BRONZE'), m.EQ(Medal.YEAR, 1956), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.COLOR, 'BRONZE'), m.EQ(Medal.YEAR, 1956), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.COLOR, 'BRONZE'), m.EQ(Medal.YEAR, 1956), m.CONTAINS_IC(Medal.COUNTRY, "CHI")),
      m.AND(m.EQ(Medal.YEAR, 1956), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.COLOR, 'BRONZE'), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.COLOR, 'BRONZE'), m.EQ(Medal.YEAR, 1956), m.CONTAINS_IC(Medal.COUNTRY, "CHI"), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.COLOR, 'BRONZE'), m.EQ(Medal.YEAR, 1956), m.EQ(Medal.GENDER, "Men")),
      m.AND(m.EQ(Medal.COLOR, 'BRONZE'), m.EQ(Medal.YEAR, 1956), m.CONTAINS_IC(Medal.COUNTRY, "CHI"))
    ];

    loadMedalData(autodao).then(
      foam.async.sequence([
        foam.async.atest(
          'Run predicate set A with AutoIndex 1',
          foam.async.repeat(SAMPLE_PREDICATES_A.length,
            function(i) {
              return foam.async.atest('A-Predicate '+SAMPLE_PREDICATES_A[i].toString().replace(/CONTAINS_IC/g, 'CIC'), function() {
                var pred = SAMPLE_PREDICATES_A[i];
                return autodao.where(pred).select();
              })();
            }
          )
        ),
        foam.async.atest(
          'Run predicate set A with AutoIndex 2',
          foam.async.repeat(SAMPLE_PREDICATES_A.length,
            function(i) {
              return foam.async.atest('A-Predicate '+SAMPLE_PREDICATES_A[i].toString().replace(/CONTAINS_IC/g, 'CIC'), function() {
                var pred = SAMPLE_PREDICATES_A[i];
                return autodao.where(pred).select();
              })();
            }
          )
        ),
        foam.async.atest(
          'Run predicate set A with AutoIndex 3',
          foam.async.repeat(SAMPLE_PREDICATES_A.length,
            function(i) {
              return foam.async.atest('R-Predicate '+SAMPLE_PREDICATES_A[i].toString().replace(/CONTAINS_IC/g, 'CIC'), function() {
                var pred = SAMPLE_PREDICATES_A[i];
                return autodao.where(pred).select();
              })();
            }
          )
        ),
        foam.async.atest(
          'Run predicate set A with AutoIndex 4',
          foam.async.repeat(SAMPLE_PREDICATES_A.length,
            function(i) {
              return foam.async.atest('R-Predicate '+SAMPLE_PREDICATES_A[i].toString().replace(/CONTAINS_IC/g, 'CIC'), function() {
                var pred = SAMPLE_PREDICATES_A[i];
                return autodao.where(pred).select();
              })();
            }
          )
        )
      ])
    ).then(function() {
      autodao = null;
      return foam.async.sequence([
        function() { return loadMedalData(dao); },
        foam.async.sleep(4000),
        foam.async.atest(
          'Run predicate set A no index',
          foam.async.repeat(SAMPLE_PREDICATES_A.length,
            function(i) {
              return foam.async.atest('N-Predicate '+SAMPLE_PREDICATES_A[i].toString().replace(/CONTAINS_IC/g, 'CIC'), function() {
                var pred = SAMPLE_PREDICATES_A[i];
                return dao.where(pred).select();
              })();
            }
          )
        )
      ]);
    }).then(done);
  });

  xit('benchmarks sample set B', function(done) {
    var SAMPLE_B = [
      m.AND(m.CONTAINS_IC(Medal.CITY, "a"), m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.EVENT, "71-75kg"), m.CONTAINS_IC(Medal.COUNTRY, "CHI")),
      m.AND(m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.SPORT, "oot"), m.CONTAINS_IC(Medal.EVENT, "the"), m.CONTAINS_IC(Medal.COUNTRY, "A")),
      m.AND(m.CONTAINS_IC(Medal.CITY, "ondon"), m.CONTAINS_IC(Medal.SPORT, "Boxing"), m.CONTAINS_IC(Medal.EVENT, "71-75kg")),
      m.AND(m.CONTAINS_IC(Medal.CITY, "c"), m.CONTAINS_IC(Medal.EVENT, "71-")),
    ];

    loadMedalData(autodao).then(
      foam.async.sequence([
        foam.async.atest(
          'Run predicate set B with AutoIndex 100 times',
          foam.async.repeat(100, foam.async.repeat(SAMPLE_B.length,
            function(i) {
              return foam.async.atest('A-Predicate '+SAMPLE_B[i].toString().replace(/CONTAINS_IC/g, 'CIC'), function() {
                var pred = SAMPLE_B[i];
                return autodao.where(pred).select();
              })();
            }
          ))
        ),
        foam.async.atest(
          'Run predicate set B with AutoIndex Again(already indexed) 100 times',
          foam.async.repeat(100, foam.async.repeat(SAMPLE_B.length,
            function(i) {
              return foam.async.atest('R-Predicate '+SAMPLE_B[i].toString().replace(/CONTAINS_IC/g, 'CIC'), function() {
                var pred = SAMPLE_B[i];
                return autodao.where(pred).select();
              })();
            }
          ))
        )
      ])
    ).then(function() {
      return autodao.select(autodaoOmni).then(
        foam.async.sequence([
          function() {
            autodao = null; /* allow gc */
          },
          foam.async.atest(
            'Run predicate set B with omni AutoIndex 100 times',
            foam.async.repeat(100, foam.async.repeat(SAMPLE_B.length,
              function(i) {
                return foam.async.atest('O-Predicate '+SAMPLE_B[i].toString().replace(/CONTAINS_IC/g, 'CIC'), function() {
                  var pred = SAMPLE_B[i];
                  return autodaoOmni.where(pred).select();
                })();
              }
            ))
          ),
          foam.async.atest(
            'Run predicate set B with omni AutoIndex Again(already indexed) 100 times',
            foam.async.repeat(100, foam.async.repeat(SAMPLE_B.length,
              function(i) {
                return foam.async.atest('OR-Predicate '+SAMPLE_B[i].toString(), function() {
                  var pred = SAMPLE_B[i];
                  return autodaoOmni.where(pred).select();
                })();
              }
            ))
          )
        ])
      )
    }).then(function() {
      return autodaoOmni.select(dao).then(foam.async.sequence([
        function() {
          autodaoOmni = null; /* allow gc */
        },
        foam.async.sleep(2000),
        foam.async.atest(
          'Run predicate set B no index 100 times',
          foam.async.repeat(100, foam.async.repeat(SAMPLE_B.length,
            function(i) {
              return foam.async.atest('N-Predicate '+SAMPLE_B[i].toString(), function() {
                var pred = SAMPLE_B[i];
                return dao.where(pred).select();
              })();
            }
          ))
        ),
      ]))
    }).then(done);
  });
});



