# FOAM2 Coding Style Guidelines

Except where noted below, FOAM conforms to the jQuery JavaScript Style Guide available at:

https://contribute.jquery.org/style-guide/js/

## Exceptions
* Indentation is two spaces rather than one tab.
* The ! operator is followed by a space.
```javascript
if ( ! found ) ...
```
* One-statement if, while, and for statements that fit in less than 80 characters, do not need braces.
```javascript
if ( ! found ) return false;

for ( var i = 0 ; i < a.length ; i++ ) a[i] = '';
```
* jQuery type checks don't apply.

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
 * Do not leave trailing unnecessary commas.

## Comments
