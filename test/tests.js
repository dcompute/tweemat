var assert = require('assert');
var sinon = require('sinon');
var tweet = require('./fixtures/tweet.json');
var tweetNoEntities = require('./fixtures/tweet-no-entities.json');
var tweetRetweet = require('./fixtures/tweet-retweeted.json');
var Tweemat = require('../src/tweemat.js');

describe('Tweemat', function() {
  'use strict';

  it('accepts a "tweet" object argument', function() {
    var tweemat = new Tweemat(tweet);
    assert.equal(true, !!tweemat.tweet);
  });

  it('accepts an "options" object argument', function() {
    var tweemat = new Tweemat(tweet, { linkToBlank: true });
    assert.equal(true, !!tweemat.options.linkToBlank);
  });

  describe('#createLink', function() {
    var tweemat;
    var spy;
    var text = tweet.text;
    var url = tweet.entities.urls[0];
    var replacements = {
      search: url.url,
      replace: url.display_url,
      href: url.expanded_url
    };

    beforeEach(function() {
      spy = sinon.spy(Tweemat.prototype, 'createLink');
      tweemat = new Tweemat(tweet);
    });

    afterEach(function() {
      spy.restore();
    });

    it('accepts a "text" string argument', function() {
      tweemat.createLink(text, replacements);
      assert(spy.calledWith(text));
    });

    it('accepts a "replacements" object argument', function() {
      tweemat.createLink(text, replacements);
      assert(spy.calledWith(text, replacements));
    });

    it('returns the text with the url linked', function() {
      var result = tweemat.createLink(text, replacements);
      var expected =
        'Along with our new #Twitterbird, we\'ve also updated our Display Guidelines: ' +
        '<a href="https://dev.twitter.com/terms/display-guidelines">' +
        'dev.twitter.com/terms/display-\u2026</a>. Thanks @DavidMuir!';

      assert.equal(result, expected);
    });

    describe('when this.options.linkToBlank is true', function() {
      var text = tweet.text;
      var replacements = {
        search: url.url,
        replace: url.display_url,
        href: url.expanded_url
      };

      it('creates a link with a target="_blank" attribute', function() {
        var tweemat = new Tweemat(tweet, { linkToBlank: true });
        var result = tweemat.createLink(text, replacements);
        var expected =
          'Along with our new #Twitterbird, we\'ve also updated our Display Guidelines: ' +
          '<a href="https://dev.twitter.com/terms/display-guidelines" target="_blank">' +
          'dev.twitter.com/terms/display-\u2026</a>. Thanks @DavidMuir!';

        assert.equal(result, expected);
      });
    });
  });

  describe('#getReplacements', function() {
    var tweemat;
    var spy;

    beforeEach(function() {
      spy = sinon.spy(Tweemat.prototype, 'getReplacements');
      tweemat = new Tweemat(tweet);
    });

    afterEach(function() {
      spy.restore();
    });

    it('accepts a "entity" object argument', function() {
      var entity = tweet.entities.urls[0];
      tweemat.getReplacements(entity);
      assert(spy.calledWith(entity));
    });

    it('accepts a "type" string argument', function() {
      var entity = tweet.entities.urls[0];
      tweemat.getReplacements(entity, 'urls');
      assert(spy.calledWith(entity, 'urls'));
    });

    describe('when "type" is "hashtag"', function() {
      var entity;
      var type;
      var returned;

      before(function() {
        entity = tweet.entities.hashtags[0];
        type = 'hashtags';
        returned = {
          search: '#' + entity.text,
          replace: '#' + entity.text,
          href: 'http://twitter.com/#search/%23' + entity.text
        };
      });

      it('returns "#entity.text" as the text to search', function() {
        var call = tweemat.getReplacements(entity, type);
        assert.equal(returned.search, call.search);
      });

      it('returns "#entity.text" as the text to replace', function() {
        var call = tweemat.getReplacements(entity, type);
        assert.equal(returned.replace, call.replace);
      });

      it('returns a search for the hashtag as the HREF', function() {
        var call = tweemat.getReplacements(entity, type);
        assert.equal(returned.href, call.href);
      });
    });

    describe('when "type" is "media"', function() {
      var entity;
      var type;
      var returned;

      before(function() {
        entity = tweet.entities.media[0];
        type = 'media';
        returned = {
          search: entity.url,
          replace: entity.display_url,
          href: entity.expanded_url
        };
      });

      it('returns the entity.url as the text to search', function() {
        var call = tweemat.getReplacements(entity, type);
        assert.equal(returned.search, call.search);
      });

      it('returns entity.display_url as the text to replace', function() {
        var call = tweemat.getReplacements(entity, type);
        assert.equal(returned.replace, call.replace);
      });

      it('returns entity.expanded_url as the HREF', function() {
        var call = tweemat.getReplacements(entity, type);
        assert.equal(returned.href, call.href);
      });
    });

    describe('when "type" is "urls"', function() {
      var entity;
      var type;
      var returned;

      before(function() {
        entity = tweet.entities.media[0];
        type = 'urls';
        returned = {
          search: entity.url,
          replace: entity.display_url,
          href: entity.expanded_url
        };
      });

      it('returns the entity.url as the text to search', function() {
        var call = tweemat.getReplacements(entity, type);
        assert.equal(returned.search, call.search);
      });

      it('returns entity.display_url as the text to replace', function() {
        var call = tweemat.getReplacements(entity, type);
        assert.equal(returned.replace, call.replace);
      });

      it('returns entity.expanded_url as the HREF', function() {
        var call = tweemat.getReplacements(entity, type);
        assert.equal(returned.href, call.href);
      });
    });

    describe('when "type" is "user_mentions"', function() {
      var entity;
      var type;
      var returned;

      before(function() {
        entity = tweet.entities.media[0];
        type = 'user_mentions';
        returned = {
          search: '@' + entity.screen_name,
          replace: '@' + entity.screen_name,
          href: 'http://twitter.com/' + entity.screen_name
        };
      });

      it('returns "@entity.screen_name" as the text to search', function() {
        var call = tweemat.getReplacements(entity, type);
        assert.equal(returned.search, call.search);
      });

      it('returns "@entity.screen_name" as the text to replace', function() {
        var call = tweemat.getReplacements(entity, type);
        assert.equal(returned.replace, call.replace);
      });

      it('returns a link to the user\'s profile as the HREF', function() {
        var call = tweemat.getReplacements(entity, type);
        assert.equal(returned.href, call.href);
      });
    });
  });

  describe('#linkAllEntities', function() {
    var spy;

    beforeEach(function() {
      spy = sinon.spy(Tweemat.prototype, 'linkAllEntities');
    });

    afterEach(function() {
      spy.restore();
    });

    describe('when the tweet has entities', function() {
      var spyLinkAllOfEntity;
      var tweemat;

      beforeEach(function() {
        spyLinkAllOfEntity = sinon.spy(Tweemat.prototype, 'linkAllOfEntity');
        tweemat = new Tweemat(tweet);
      });

      afterEach(function() {
        spyLinkAllOfEntity.restore();
      });

      it('calls #linkAllOfEntity', function() {
        tweemat.linkAllEntities();
        assert(spyLinkAllOfEntity.called);
      });

      it('returns the tweet text with all entities linked.', function() {
        var result = tweemat.linkAllEntities();
        var expected =
          'Along with our new ' +
          '<a href="http://twitter.com/#search/%23Twitterbird">#Twitterbird</a>, ' +
          'we\'ve also updated our Display Guidelines: ' +
          '<a href="https://dev.twitter.com/terms/display-guidelines">' +
          'dev.twitter.com/terms/display-\u2026</a>. Thanks ' +
          '<a href="http://twitter.com/DavidMuir">@DavidMuir</a>!';

        assert.equal(result, expected);
      });
    });

    describe('when the tweet does not have entities', function() {
      var tweemat;

      beforeEach(function() {
        tweemat = new Tweemat(tweetNoEntities);
      });

      it('returns the original tweet text.', function() {
        var result = tweemat.linkAllEntities();
        assert.equal(result, tweetNoEntities.text);
      });
    });

    describe('when the tweet is a retweet', function() {
      var tweemat;

      beforeEach(function() {
        tweemat = new Tweemat(tweetRetweet);
      });

      it('returns the tweet text with all entities linked.', function() {
        var result = tweemat.linkAllEntities();
        var expected =
          'RT <a href="http://twitter.com/b_magnanti">@b_magnanti</a>: ' +
          'Correlation is not... oh wait, yes. Yes it is. ' +
          '<a href="http://twitter.com/b_magnanti/status/555461494704709633/photo/1">' +
          'pic.twitter.com/lQs5uv3HHr</a>';

        assert.equal(result, expected);
      });
    });
  });

  describe('#linkAllOfEntity', function() {
    var spy;
    var type = 'urls';
    var tweemat;

    beforeEach(function() {
      spy = sinon.spy(Tweemat.prototype, 'linkAllOfEntity');
      tweemat = new Tweemat(tweet);
    });

    afterEach(function() {
      spy.restore();
    });

    it('accepts a "type" string argument', function() {
      tweemat.linkAllOfEntity(type);
      assert(spy.calledWith(type));
    });

    describe('when the tweet has link entities', function() {
      var spyCreateLink;
      var tweematEntities;

      beforeEach(function() {
        spyCreateLink = sinon.spy(Tweemat.prototype, 'createLink');
        tweematEntities = new Tweemat(tweet);
      });

      afterEach(function() {
        spyCreateLink.restore();
      });

      it('calls #createLink', function() {
        tweematEntities.linkAllOfEntity(type);
        assert(spyCreateLink.called);
      });

      it('returns the tweet text with all entities linked.', function() {
        var result = tweematEntities.linkAllOfEntity(type);
        var expected =
          'Along with our new #Twitterbird, we\'ve also updated our Display Guidelines: ' +
          '<a href="https://dev.twitter.com/terms/display-guidelines">' +
          'dev.twitter.com/terms/display-\u2026</a>. Thanks @DavidMuir!';

        assert.equal(result, expected);
      });
    });

    describe('when the tweet does not have link entities', function() {
      var tweematNoEntities;

      beforeEach(function() {
        tweematNoEntities = new Tweemat(tweetNoEntities);
      });

      it('returns the plain text tweet.', function() {
        var result = tweematNoEntities.linkAllOfEntity('symbols');
        assert(tweet.text, result);
      });
    });
  });
});
