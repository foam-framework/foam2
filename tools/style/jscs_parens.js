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

// Plugin for FOAM's dyslexic-friendly exploded statement headers (if, for,
// while, etc.)

/* globals require: false, module: false */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {
  configure: function(options) {
    assert(options === true,
        this.getOptionName() + ' option requires true, or remove it');
  },
  getOptionName: function() {
    return 'foamExplodedStatements';
  },

  check: function(file, errors) {
    file.iterateNodesByType('IfStatement', function(node) {
      if ( node.test ) {
        var testToken = file.getFirstNodeToken(node.test);
        var prevToken = file.getPrevToken(testToken);

        errors.assert.spacesBetween({
          token: prevToken,
          nextToken: testToken,
          exactly: 1,
          message: 'One space required after "if ("'
        });

        testToken = file.getLastNodeToken(node.test);
        var nextToken = file.getNextToken(testToken);
        errors.assert.spacesBetween({
          token: testToken,
          nextToken: nextToken,
          exactly: 1,
          message: 'One space required before closing "if ( )"'
        });
      }
    });

    file.iterateNodesByType('WhileStatement', function(node) {
      if ( node.test ) {
        var testToken = file.getFirstNodeToken(node.test);
        var prevToken = file.getPrevToken(testToken);

        errors.assert.spacesBetween({
          token: prevToken,
          nextToken: testToken,
          exactly: 1,
          message: 'One space required after "while ("'
        });

        testToken = file.getLastNodeToken(node.test);
        var nextToken = file.getNextToken(testToken);
        errors.assert.spacesBetween({
          token: testToken,
          nextToken: nextToken,
          exactly: 1,
          message: 'One space required before closing "while ( )"'
        });
      }
    });

    file.iterateNodesByType('ForStatement', function(node) {
      if ( node.init ) {
        var initToken = file.getFirstNodeToken(node.init);
        var prevToken = file.getPrevToken(initToken);

        errors.assert.spacesBetween({
          token: prevToken,
          nextToken: initToken,
          exactly: 1,
          message: 'One space required after "for ("'
        });
      }

      if ( node.update ) {
        var updateToken = file.getLastNodeToken(node.update);
        errors.assert.spacesBetween({
          token: updateToken,
          nextToken: file.getNextToken(updateToken),
          exactly: 1,
          message: 'One space required before closing "for ( )"'
        });
      }
    });

    file.iterateNodesByType('SwitchStatement', function(node) {
      if ( node.discriminant ) {
        var token = file.getFirstNodeToken(node.discriminant);
        var prevToken = file.getPrevToken(token);

        errors.assert.spacesBetween({
          token: prevToken,
          nextToken: token,
          exactly: 1,
          message: 'One space required after "switch ("'
        });

        token = file.getLastNodeToken(node.discriminant);
        var nextToken = file.getNextToken(token);
        errors.assert.spacesBetween({
          token: token,
          nextToken: nextToken,
          exactly: 1,
          message: 'One space required before closing "switch ( )"'
        });
      }
    });

    file.iterateNodesByType('DoWhileStatement', function(node) {
      if ( node.test ) {
        var token = file.getFirstNodeToken(node.test);
        var prevToken = file.getPrevToken(token);

        errors.assert.spacesBetween({
          token: prevToken,
          nextToken: token,
          exactly: 1,
          message: 'One space required after "do { } while ("'
        });

        token = file.getLastNodeToken(node.test);
        var nextToken = file.getNextToken(token);
        errors.assert.spacesBetween({
          token: token,
          nextToken: nextToken,
          exactly: 1,
          message: 'One space required before closing "do { } while ( )"'
        });
      }
    });

    file.iterateNodesByType('ForInStatement', function(node) {
      var token;
      if ( node.left ) {
        token = file.getFirstNodeToken(node.left);
        var prevToken = file.getPrevToken(token);

        errors.assert.spacesBetween({
          token: prevToken,
          nextToken: token,
          exactly: 1,
          message: 'One space required after "for ("'
        });
      }

      if ( node.right ) {
        token = file.getLastNodeToken(node.right);
        var nextToken = file.getNextToken(token);
        errors.assert.spacesBetween({
          token: token,
          nextToken: nextToken,
          exactly: 1,
          message: 'One space required before closing "for ( )"'
        });
      }
    });

    file.iterateNodesByType('ForOfStatement', function(node) {
      var token;
      if ( node.left ) {
        token = file.getFirstNodeToken(node.left);
        var prevToken = file.getPrevToken(token);

        errors.assert.spacesBetween({
          token: prevToken,
          nextToken: token,
          exactly: 1,
          message: 'One space required after "for ("'
        });
      }

      if ( node.right ) {
        token = file.getLastNodeToken(node.right);
        var nextToken = file.getNextToken(token);
        errors.assert.spacesBetween({
          token: token,
          nextToken: nextToken,
          exactly: 1,
          message: 'One space required before closing "for ( )"'
        });
      }
    });
  }
};

