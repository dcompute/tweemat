window.define([
  'Zepto',
  'config',
  'date_helpers'
], function (
  Zepto,
  config,
  noop
) {
  'use strict';

  /**
    Twitter functionality namespace.

    @namespace twitter
    @author Daniel Lacy <dan@daniellacy.com>
    @memberOf dl
    @since 1.0
   */
  var twitter = {};

  /**
    Handle entity conversion to real links.

    @author Daniel Lacy <dan@daniellacy.com>
    @memberOf twitter
    @since 1.0
   */
  twitter.entities = {
    /**
      Find and convert tweet entities into anchor tags.

      @memberOf twitter.entities
      @since 1.0
      @param {object} tweet
        Tweet representation.
      @return {string}
        Tweet text with links converted to anchors.
      @todo
        Stop modifying the original tweet data and use a clone object.
     */
    getLinks : function (tweet) {
      var entities = tweet.entities,
        type,
        hasRetweet = (
          tweet.hasOwnProperty('retweeted_status') &&
          typeof tweet.retweeted_status === 'object'
        ),
        hasType;

      if (hasRetweet) {
        tweet.text = twitter.entities.linkRetweetName(tweet) + tweet.retweeted_status.text;
      }

      for (type in entities) {
        hasType = (entities.hasOwnProperty(type) && entities[type].length > 0);

        if (hasType) {
          tweet.text = twitter.entities.makeLinks(tweet, type);
        }
      }

      if (tweet.text.match(/\n/g)) {
        tweet.text = tweet.text.replace(/\n/g, '<br>');
      }

      return tweet.text;
    },

    /**
      Replaces a 'RT @{username}' string with a linked username.

      @author Daniel Lacy <dan@daniellacy.com>
      @memberOf twitter.entities
      @since 2.1
      @param {object} tweet
        Tweet Retweeted representation.
     */
     linkRetweetName : function (tweet) {
      var regex = /^(RT\s)@(\w*)[:$]/i,
        matched = tweet.text.match(regex)[0];

      return matched.replace(regex, '$1<a href="http://twitter.com/$2">@$2</a>: ');
     },

    /**
      Replace URLs, user mentions, and hashtags with a link to
      their appropriate pages.

      @memberOf twitter.entities
      @since 1.5
      @param {object} tweet
        Tweet representation.
      @param {string} type
        Entity type (eg- hashtags, user_mentions, media, urls).
      @return {string}
        Link replaced tweet text.
     */
    makeLinks : function (tweet, type) {
      var i = 0,
        links = tweet.entities[type],
        linksLength = links.length,
        text = tweet.text,
        entity;

      for (i; i < linksLength; i++) {
        entity = twitter.entities.getReplacements(type, links[i]);

        text = entity ? text.replace(
           entity.replace_text,
          '<a href="' + entity.value_href + '">' + entity.value_text + '</a>'
        ) : text;
      }

      return text;
    },

    /**
      Replace entities in tweet text with URL-ified versions.

      @memberOf twitter.entities
      @since 1.5
      @param {string} type
        Entity type (eg- hashtags, user_mentions, media, urls).
      @param {object} link
        Entity representation.
      @returns {object}
        Object of replacement text, display, and value.
     */
    getReplacements : function (type, link) {
      var r = {
        replace_text : null,
        value_text   : null,
        value_href   : null
      };

      switch (type) {
      case 'hashtags' :
        r.replace_text  = '#' + link.text;
        r.value_text  = '#' + link.text;
        r.value_href  = 'http://twitter.com/#search/%23' + link.text;
        break;
      case 'media' :
        r.replace_text  = link.url;
        r.value_text  = link.display_url;
        r.value_href  = link.expanded_url;
        break;
      case 'urls' :
        r.replace_text  = link.url;
        r.value_text  = link.display_url;
        r.value_href  = link.expanded_url;
        break;
      case 'user_mentions' :
        r.replace_text  = '@' + link.screen_name;
        r.value_text  = '@' + link.screen_name;
        r.value_href  = 'http://twitter.com/' + link.screen_name;
        break;
      }

      return r;
    }
  };

  /**
    Handle a failed request with a message and new options.

    @author Daniel Lacy <dan@daniellacy.com>
    @memberOf twitter
    @since 2.0
    @param {object} xhr
      XHR object.
    @param {string} status
      Text status response.
   */
  twitter.handleErrors = function (xhr, status, error) {
    var message = '<article class="post" role="article" id="twitter">' +
      '<p>Twitter may be down at the moment, otherwise you\'d see my latest posts here.' +
      '<br><br>Follow me <a href="http://twitter.com/dcompute">@dcompute</a> or ' +
      '<a href="#reload-twitter" id="reload-twitter">Try loading again</a>.</p></article>';

    $('#intro').after(message);

    $('#reload-twitter').one('click', function (ev) {
      ev.preventDefault();

      $('#twitter').remove();

      twitter.init();
    });
  };

  /**
    Build elements with our data and append them to the DOM.

    @author Daniel Lacy <dan@daniellacy.com>
    @memberOf twitter
    @since 2.0
    @param {object} data
      Data received from the AJAX request.
    @param {string} status
      Text status response.
    @param {object} xhr
      XHR object.
   */
  twitter.makeViews = function (data, status, xhr) {
    var dataLength = data.length,
      container = $(
        '<article class="post" role="article" id="twitter"' +
        'style="height: 0px;">' +
        '<h2>Latest from Twitter</h2>' +
        '<ol></ol></article>'
      ),
      tweets = [],
      tweet,
      i = 0,
      actualCount = 0,
      link,
      pubDate,
      listItem;

    for (i; i < dataLength; i++) {
      tweet = data[i];
      pubDate = new Date(tweet.created_at);

      // Some tweets come back busted, skip over them when this occurs.
      if (typeof tweet === 'undefined') {
        continue;
      }

      link = 'http://twitter.com/' +
         (tweet.user.screen_name ? tweet.user.screen_name : 'dcompute') +
         '/status/' + tweet.id_str;

      listItem = '<li><time datetime="' + pubDate.toISOString() + '" pubdate>' +
        '<a href="' + link + '">' + pubDate.toNiceString(true) + '</a>' +
        '</time> ' + twitter.entities.getLinks(tweet) + '</li>';

      tweets.push(listItem);

      actualCount++;

      if (actualCount >= config.twitter.display_count) {
        break;
      }
    }

    container.find('ol').append(
      tweets.join('') +
      '<li>Discover more by following me <a href="http://twitter.com/dcompute">@dcompute</a>.</li>'
    );

    $('#intro').after(container);

    container.animate({
      height : '100%'
    }, config.effects.animate_speed, 'linear');

  };

  /**
    Initialize Twitter functionality.

    @author Daniel Lacy <dan@daniellacy.com>
    @since 1.5
    @memberOf twitter
   */
  twitter.init = function () {
    $.ajax({
      url : config.twitter.url,
      data : config.twitter.params,
      dataType : 'jsonp',
      success : twitter.makeViews,
      error : twitter.handleErrors
    });
  };

  return twitter;

});