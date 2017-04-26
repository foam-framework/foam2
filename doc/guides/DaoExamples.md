# Foam version 2, DAO examples.

Foam 1 version can be found [here](http://foam-framework.github.io/foam/foam/demos/dao.html).


#### Running these examples with Chrome console.

```sh
git clone https://github.com/foam-framework/foam2.git
cd foam2 && npm install
python -m SimpleHTTPServer 
# opens browser at localhost:8000
# open chrome console, you should see something like:
# core boot time:  23
```

#### Running these examples with node REPL

```sh
git clone https://github.com/foam-framework/foam2.git
cd foam2 && npm install
node
> require("./src/foam.js");
# > core boot time:  23
# > foam.isServer
# > true
```

### Examples

```js
// creates a simple foam class
foam.CLASS({
  name: 'Guitar',
  properties: [ 'id', 'name', 'color', 'brand', 'price' ]
});
```

```js
// an array of Guitars
var guitarArray = foam.dao.ArrayDAO.create();
```

```js
guitarArray.put(Guitar.create({
  id: 1,
  color: 'black',
  brand: 'fender',
  name: 'dave murray signature',
  price: 2000
}));
```

```js
guitarArray.put(Guitar.create({
  id: 2,
  color: 'sunburst',
  brand: 'fender',
  name: 'clapton signature',
  price: 2400
}));
```

```js
guitarArray.put(Guitar.create({
  id: 3,
  color: 'white',
  brand: 'fender',
  name: 'hendrix signature',
  price: 2700
}));
```

```js
guitarArray.put(Guitar.create({
  id: 4,
  color: 'appetite amber',
  brand: 'gibson',
  name: 'slash',
  price: 5000
}));
```

```js
guitarArray.put(Guitar.create({
  id: 5,
  color: 'red',
  brand: 'seizi',
  name: 'seizi one',
  price: 900
}));
```

```js
// creates a memory persistence(MDAO) layer for the Guitars class.
var guitarDAO = foam.dao.MDAO.create({ of: Guitar });
```

```js
// IndexedDB DAO
// guitarDAO = foam.dao.IDBDAO.create({model: Guitar});

// Local-storage DAO
// guitarDAO = foam.dao.StorageDAO.create({ model: Guitar });

// An IndexedDB DAO Cached in an in-memory DAO
// guitarDAO = foam.dao.CachingDAO.create(foam.dao.MDAO.create({ of: Guitar }), foam.dao.IDBDAO.create({ of: Guitar }));

// load the array of guitars into our memory database (MDAO)
guitarDAO.bulkLoad(guitarArray);
```

```js
// we declare mLang here, the foam "modelled language"
// in simple terms, mlang is foam's own "SQL syntax"
// it's used to filter and manipulate DAO operations.
// https://github.com/foam-framework/foam2/blob/master/src/foam/mlang/mlang.js
var expr = foam.mlang.Expressions.create();
```

```js
// returns all the guitars
guitarDAO
.select() 
// when a "sink" function isn't provided, FOAM defaults it to an ArraySink
// which puts the results in a "a" prop 
.then(function(db) {
  console.log('count: ', db.a.length);
  console.log('count: ', db.a[0].price);
});
```

```js
// counts the guitars 
// short-circuits it and returns only the count number
guitarDAO
.select(expr.COUNT())
.then(function(count) {
  console.log('count: ', count.value);
});
```

```js
// give me all gibsons
guitarDAO
.where(expr.EQ(Guitar.BRAND, 'gibson'))
.select()
.then(function(guitars) {
  console.log('gibsons count: ', guitars.a.length);
  console.log(guitars.a[0].name);
});
```

```js
// give me all gibsons or seizis using OR
guitarDAO.where(expr.OR(expr.EQ(Guitar.BRAND, 'seizi'), expr.EQ(Guitar.BRAND, 'gibson')))
.select()
.then(function(guitars) {
  console.log('seizi or gibsons count: ', guitars.a.length);
});
```

```js
// give me all gibsons or fenders using IN
guitarDAO.where(expr.IN(Guitar.BRAND, ['gibson', 'fender']))
.select()
.then(function(guitars) {
  console.log(guitars.a.length);
});
```

```js
// give me all fenders with a price below 2500
guitarDAO.where(expr.LT(Guitar.PRICE, 2500))
.select()
.then(function(guitars) {
  console.log(guitars.a.length);
});
```

```js
// give me all guitars where brand starts with `g` or name starts with `s`
guitarDAO.where(expr.OR(expr.STARTS_WITH(Guitar.BRAND, 'g'), expr.STARTS_WITH(Guitar.NAME, 's')))
.select()
.then(function(guitars) {
  console.log(guitars.a.length);
});
```

```js
// using contains
guitarDAO.where(expr.CONTAINS(Guitar.NAME, 'sh'))
.select()
.then(function(guitars) {
  console.log(guitars.a.length); // 1 , slash
});
```

```js
// using contains_ic (ignoring case)
guitarDAO.where(expr.CONTAINS_IC(Guitar.NAME, 'SH'))
.select()
.then(function(guitars) {
  console.log(guitars.a.length); // 1 , slash
});
```

```js
// give me all fenders and order by price
var sink = foam.dao.ArraySink.create();

guitarDAO.where(expr.EQ(Guitar.BRAND, 'fender'))
.orderBy(expr.DESC(Guitar.PRICE))
.select(sink)
.then(function() {
  var a = sink.a;
  a.forEach(function(g) { console.log(g.price) }) // 2700, 2400, 2000
});
```

```js
// give me only two guitars
guitarDAO.limit(2)
.select()
.then(function(g) {
  console.log(g.a.length);
});
```

```js
// give me only two guitars
guitarDAO.limit(2)
.select()
.then(function(g) {
  console.log(g.a.length);
});
```

```js
// give me only two guitars
// and sum their prices
guitarDAO
.limit(2)
.select(expr.SUM(Guitar.PRICE))
.then(function(prices) {
  console.log(prices.values);
});
```

```js
// sums all guitars prices
guitarDAO.select(expr.SUM(Guitar.PRICE))
.then(function(g) {
  console.log(g.value);
});
```

```js
// returns the most expensive guitar
guitarDAO.select(expr.MAX(Guitar.PRICE))
.then(function(g) {
  console.log(g.value);
});
```

```js
// returns the cheapest guitar
guitarDAO.select(expr.MIN(Guitar.PRICE))
.then(function(g) {
  console.log(g.value);
});
```
