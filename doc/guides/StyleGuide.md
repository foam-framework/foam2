# FOAM2 Coding Style Guidelines

Except where noted below, FOAM conforms to the [Google Javascript Style Guide](https://google.github.io/styleguide/jsguide.html).

## Exceptions
* One space is required inside the parentheses of `if`, `for`, `while`, and `switch` headers:
```javascript
if ( a < b ) ...
for ( var i = 0; i < words.length; i++ ) ...
for ( var key in obj ) ...
while ( true ) ...
switch ( argCount ) ...
```
* The `!` operator must be followed by a space.
```javascript
if ( ! found ) ...
```
* One-statement `if`, `while`, and `for` statements that can fit on a single line (less than 80 characters) do not need braces:
```javascript
if ( ! found ) return false;

for ( var i = 0 ; i < a.length ; i++ ) a[i] = '';
```
* The rules about using Closure's `goog.provide`, `goog.require` and similar are
  omitted; use FOAM's `requires: []` support instead.
* The rules about using JSDoc comments to inform the Closure compiler's
  type-checking are omitted; use FOAM's type-checking instead.

## Naming

* Model names should be capitalized CamelCase. Ex. `Model`, `Photo`, `EMail`.
* Acronyms should have all letters capitalized: Ex. `DAO`
* Properties should start with a lower-case character and be camelCase. Ex. `parent`, `firstName`
* Non-public properties and methods can end with an underscore (`_`). Ex. `listeners_`
* Use `NAMES_LIKE_THIS` for constant values.

## Modelling
Code should be modeled rather than created as conventional JS prototypes.

Provide property labels when the default labelization of the property name will not be helpful or attractive to users.

## Line Length
Line lengths should be 80 characters or less, except for embedded data, like templates or sprites, or when modifying the code to make it fit in less than 80 characters would actually makes it less readable.

## Other
 * Do not quote map keys unless necessary.
 * Do not leave trailing unnecessary commas (this is implicit in the Google
   style guide).

## Comments
