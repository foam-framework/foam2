/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// guitar

foam.CLASS({
name: 'Guitar',
properties: [ 'id', 'name', 'color', 'brand', 'price' ]
});

// array to populate it with data.
var guitarArray = foam.dao.ArrayDAO.create();

guitarArray.put(Guitar.create({
  id: 1,
  color: 'black',
  brand: 'fender',
  name: 'dave murray signature',
  price: 2000
}));

guitarArray.put(Guitar.create({
  id: 2,
  color: 'sunburst',
  brand: 'fender',
  name: 'clapton signature',
  price: 2400
}));

guitarArray.put(Guitar.create({
  id: 3,
  color: 'white',
  brand: 'fender',
  name: 'hendrix signature',
  price: 2700
}));

guitarArray.put(Guitar.create({
  id: 4,
  color: 'appetite amber',
  brand: 'gibson',
  name: 'slash',
  price: 5000
}));

guitarArray.put(Guitar.create({
id: 5,
color: 'red',
brand: 'seizi',
name: 'seizi one',
price: 900
}));

(async function foo() {
// creates a memory persistence(MDAO) layer for the Guitars class.
var guitarDAO = foam.dao.MDAO.create({ of: Guitar });

// IndexedDB DAO
// guitarDAO = foam.dao.IDBDAO.create({model: Guitar});

// Local-storage DAO
// guitarDAO = foam.dao.StorageDAO.create({ model: Guitar });
// foam.dao.LocalStorageDAO.create({ name: '_test_LS_' });
// foam.dao.SequenceNumberDAO

// An IndexedDB DAO Cached in an in-memory DAO
// guitarDAO = foam.dao.CachingDAO.create(foam.dao.MDAO.create({ of: Guitar }),
// foam.dao.IDBDAO.create({ of: Guitar }));

// load the array of guitars into our memory database (MDAO)
guitarDAO.bulkLoad(guitarArray);
//need to wait until getting all the data
await guitarDAO.select(console);

// we declare mLang here, the foam "modelled language"
// in simple terms, mlang is foam's own "SQL syntax"
// it's used to filter and manipulate DAO operations.
// https://github.com/foam-framework/foam2/blob/master/src/foam/mlang/mlang.js
var expr = foam.mlang.Expressions.create();// foam.mlang.Expressions.create();

// give me all fenders and order by price
// this is a custom sink function
// this function will be applied on each guitar instance.

var sinkFn = function (guitar) { console.log(guitar.price) }

guitarDAO.where(expr.EQ(Guitar.BRAND, 'fender'))
.orderBy(expr.DESC(Guitar.PRICE))
.select()//{ put: sinkFn }
.then(function(g) {
  console.log(g.array);
});

// limit(num)
// give me only two guitars
guitarDAO.limit(1)
.select()
.then(function(a) {
  console.log(a.array[0].color);
});

var expr = foam.mlang.ExpressionsSingleton.create();// foam.mlang.Expressions.create();

// counts the guitars 
// short-circuits it and returns only the count number
guitarDAO
.select(expr.COUNT())
.then(function(count) {
  console.log('count: ', count.value);
});

// give me all gibsons
guitarDAO
.where(expr.EQ(Guitar.BRAND, 'gibson'))
.select()
.then(function(guitars) {
  console.log('gibsons count: ', guitars.a.length);
  // console.log(guitars.a[0].name);// TODO TypeError: Cannot read property 'name' of undefined
});

// OR
// give me all gibsons or seizis using OR
guitarDAO.where(expr.OR(expr.EQ(Guitar.BRAND, 'seizi'), expr.EQ(Guitar.BRAND, 'gibson')))
.select()
.then(function(guitars) {
  console.log('seizi or gibsons count: ', guitars.a.length);
});

// IN
// give me all gibsons or fenders using IN
guitarDAO.where(expr.IN(Guitar.BRAND, ['gibson', 'fender']))
.select()
.then(function(guitars) {
  console.log(guitars.a.length);
});

// LT
// give me all fenders with a price below 2500
guitarDAO
.where(expr.AND(expr.LT(Guitar.PRICE, 2500), expr.EQ(Guitar.BRAND, 'fender')))
.select()
.then(function(guitars) {
  console.log(guitars.a.length);
});

// STARTS_WITH
// give me all guitars where brand starts with `g` or name starts with `s`
guitarDAO.where(expr.OR(expr.STARTS_WITH(Guitar.BRAND, 'g'), expr.STARTS_WITH(Guitar.NAME, 's')))
.select()
.then(function(guitars) {
  console.log(guitars.a.length);
});

// CONTAINS
// using contains
guitarDAO.where(expr.CONTAINS(Guitar.NAME, 'sh'))
.select()
.then(function(guitars) {
  console.log(guitars.a.length); // 1 , slash
});

// CONTAINS_IC
// using contains_ic (ignoring case)
guitarDAO.where(expr.CONTAINS_IC(Guitar.NAME, 'SH'))
.select()
.then(function(guitars) {
  console.log(guitars.a.length); // 1 , slash
});

// SUM
// sums all guitars prices
guitarDAO.select(expr.SUM(Guitar.PRICE))
.then(function(g) {
  console.log(g.value);
});

// SUM
// give me only two guitars
// and sum their prices
guitarDAO
.limit(2)
.select(expr.SUM(Guitar.PRICE))
.then(function(prices) {
  console.log(prices.values);
});

// MAX
// returns the most expensive guitar
guitarDAO.select(expr.MAX(Guitar.PRICE))
.then(function(g) {
  console.log(g.value);
});

// MIN
// returns the cheapest guitar
guitarDAO.select(expr.MIN(Guitar.PRICE))
.then(function(g) {
  console.log(g.value);
});

})();