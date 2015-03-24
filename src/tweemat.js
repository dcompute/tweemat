var Tweemat = (function() {
  'use strict';

  /**
    @global
    @constructor
    @param {object} tweet -
      A single tweet JSON representation from the Twitter API.
    @param {object} [options] -
      Options hash.
    @param {boolean} [options.linkToBlank=false] -
      Give links a `target="_blank"` attribute.
  */
  function Tweemat(tweet, options) {
    options = options || {};

    this.tweet = tweet;
    this.options = {
      linkToBlank: options.linkToBlank || false
    };

    this.contentMarkup = '';
  }

  /**
    Finds text in a string and replaces it with a link.

    @global
    @memberof Tweemat
    @instance
    @since 1.0.0
    @param {string} text -
      Full string that will be searched and replaced with links.
    @param {object} replacements -
      Object containing the text to search for, text to replace with,
      and the URL to link to.
    @returns {string}
      String with the replacements wrapped in anchors.
  */
  Tweemat.prototype.createLink = function(text, replacements) {
    var elementStart = '<a href="' + replacements.href + '">';
    var elementEnd = '</a>';

    if (this.options.linkToBlank) {
      elementStart = elementStart.slice(0, -1) + ' target="_blank">';
    }

    return text.replace(
      replacements.search,
      elementStart + replacements.replace + elementEnd
    );
  };

  /**
    Creates a hash of entity content to find, replace, and link.

    @global
    @memberof Tweemat
    @instance
    @since 1.0.0
    @param {object} entity -
      An entity object representation. Eg- an item from tweet.entities.
    @param {string} type -
      The entity type to handle.
    @returns {object}
      ['search'] is text to find. ['replace'] is text to replace. ['href'] is url.
  */
  Tweemat.prototype.getReplacements = function(entity, type) {
    var replacements;

    switch (type) {
    case 'hashtags':
      replacements = {
        search: '#' + entity.text,
        replace: '#' + entity.text,
        href: 'http://twitter.com/#search/%23' + entity.text
      };
      break;
    case 'media':
      replacements = {
        search: entity.url,
        replace: entity.display_url,
        href: entity.expanded_url
      };
      break;
    case 'urls':
      replacements = {
        search: entity.url,
        replace: entity.display_url,
        href: entity.expanded_url
      };
      break;
    case 'user_mentions':
      replacements = {
        search: '@' + entity.screen_name,
        replace: '@' + entity.screen_name,
        href: 'http://twitter.com/' + entity.screen_name
      };
      break;
    default:
      break;
    }

    return replacements;
  };

  /**
    Links all entities.

    @global
    @memberof Tweemat
    @instance
    @since 1.0.0
    @returns {string}
      Tweet text with all entities linked.
  */
  Tweemat.prototype.linkAllEntities = function() {
    var entities = this.tweet.entities || {};
    var type;

    for (type in entities) {
      if (entities.hasOwnProperty(type) && entities[type].length) {
        this.contentMarkup = this.linkAllOfEntity(type);
      }
    }

    return this.contentMarkup.length ? this.contentMarkup : this.tweet.text;
  };

  /**
    Links all of a single entity type.

    @global
    @memberof Tweemat
    @instance
    @since 1.0.0
    @param {string} type -
      Entity type.
    @returns {string}
      Tweet text with all of a single entity type replaced with links.
  */
  Tweemat.prototype.linkAllOfEntity = function(type) {
    var text = this.contentMarkup.length ? this.contentMarkup : this.tweet.text;
    var entity;
    var entityLength;
    var i;
    var replacements;

    if (this.tweet.hasOwnProperty('entities')) {
      entity = this.tweet.entities[type] || [];
      entityLength = entity.length;
      i = 0;

      for (i; i < entityLength; i++) {
        replacements = this.getReplacements(entity[i], type);

        text = replacements ? this.createLink(text, replacements) : text;
      }
    }

    return text;
  };

  return Tweemat;

}(this));

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = Tweemat;

} else if (typeof window.define === 'function' && window.define.amd) {
  window.define([], function() { return Tweemat; });

} else {
  window.Tweemat = Tweemat;

}
