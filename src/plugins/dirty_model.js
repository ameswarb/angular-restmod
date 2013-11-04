/**
 * @mixin DirtyModel
 * @memberof plugins
 *
 * @description Adds the `$dirty` method to a model`s instances.
 */

'use strict';

angular.module('plRestmod').factory('DirtyModel', ['$restmod', function($restmod) {

  return $restmod.abstract(function() {
    this.afterFeed(function(_original) {
        // store original information in a model's special property
        this.$original = _original;
      })
      .attrIgnored('$original', true) // make special property ignored
      /**
       * @method $dirty
       * @memberof plugins.DirtyModel#
       *
       * @description Retrieves the model changes
       *
       * Property changes are determined using the strict equality operator.
       *
       * IDEA: allow changing the equality function per attribute.
       *
       * If given a property name, this method will return true if property has changed
       * or false if it has not.
       *
       * Called without arguments, this method will return a list of changed property names.
       *
       * @param {string} _prop Property to query
       * @return {boolean|array} Property state or array of changed properties
       */
      .define('$dirty', function(_prop) {
        var original = this.$original;
        if(_prop) {
          if(!original || original[_prop] === undefined) return false;
          return original[_prop] !== this[_prop];
        } else {
          var changes = [], key;
          if(original) {
            for(key in original) {
              if(original.hasOwnProperty(key) && original[key] !== this[key]) {
                changes.push(key);
              }
            }
          }
          return changes;
        }
      });
  });
}]);