/*!
Jasmine-jQuery: a set of jQuery helpers for Jasmine tests.

Version 2.0.5

https://github.com/velesin/jasmine-jquery

Copyright (c) 2010-2014 Wojciech Zawistowski, Travis Jeffery

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

+function (window, jasmine, $) { "use strict";

  jasmineRequire.spiedEventsKey = function (selector, eventName) {
    return [$(selector).selector, eventName].toString()
  }

  jasmineRequire.getFixtures = function () {
    return jasmineRequire.currentFixtures_ = jasmineRequire.currentFixtures_ || new jasmineRequire.Fixtures()
  }

  jasmineRequire.getStyleFixtures = function () {
    return jasmineRequire.currentStyleFixtures_ = jasmineRequire.currentStyleFixtures_ || new jasmineRequire.StyleFixtures()
  }

  jasmineRequire.Fixtures = function () {
    this.containerId = 'jasmine-fixtures'
    this.fixturesCache_ = {}
    this.fixturesPath = 'spec/javascripts/fixtures'
  }

  jasmineRequire.Fixtures.prototype.set = function (html) {
    this.cleanUp()
    return this.createContainer_(html)
  }

  jasmineRequire.Fixtures.prototype.appendSet= function (html) {
    this.addToContainer_(html)
  }

  jasmineRequire.Fixtures.prototype.preload = function () {
    this.read.apply(this, arguments)
  }

  jasmineRequire.Fixtures.prototype.load = function () {
    this.cleanUp()
    this.createContainer_(this.read.apply(this, arguments))
  }

  jasmineRequire.Fixtures.prototype.appendLoad = function () {
    this.addToContainer_(this.read.apply(this, arguments))
  }

  jasmineRequire.Fixtures.prototype.read = function () {
    var htmlChunks = []
      , fixtureUrls = arguments

    for(var urlCount = fixtureUrls.length, urlIndex = 0; urlIndex < urlCount; urlIndex++) {
      htmlChunks.push(this.getFixtureHtml_(fixtureUrls[urlIndex]))
    }

    return htmlChunks.join('')
  }

  jasmineRequire.Fixtures.prototype.clearCache = function () {
    this.fixturesCache_ = {}
  }

  jasmineRequire.Fixtures.prototype.cleanUp = function () {
    $('#' + this.containerId).remove()
  }

  jasmineRequire.Fixtures.prototype.sandbox = function (attributes) {
    var attributesToSet = attributes || {}
    return $('<div id="sandbox" />').attr(attributesToSet)
  }

  jasmineRequire.Fixtures.prototype.createContainer_ = function (html) {
    var container = $('<div>')
    .attr('id', this.containerId)
    .html(html)

    $(document.body).append(container)
    return container
  }

  jasmineRequire.Fixtures.prototype.addToContainer_ = function (html){
    var container = $(document.body).find('#'+this.containerId).append(html)

    if (!container.length) {
      this.createContainer_(html)
    }
  }

  jasmineRequire.Fixtures.prototype.getFixtureHtml_ = function (url) {
    if (typeof this.fixturesCache_[url] === 'undefined') {
      this.loadFixtureIntoCache_(url)
    }
    return this.fixturesCache_[url]
  }

  jasmineRequire.Fixtures.prototype.loadFixtureIntoCache_ = function (relativeUrl) {
    var self = this
      , url = this.makeFixtureUrl_(relativeUrl)
      , htmlText = ''
      , request = $.ajax({
        async: false, // must be synchronous to guarantee that no tests are run before fixture is loaded
        cache: false,
        url: url,
        success: function (data, status, $xhr) {
          htmlText = $xhr.responseText
        }
      }).fail(function ($xhr, status, err) {
          throw new Error('Fixture could not be loaded: ' + url + ' (status: ' + status + ', message: ' + err.message + ')')
      })

      var scripts = $($.parseHTML(htmlText, true)).find('script[src]') || [];

      scripts.each(function(){
        $.ajax({
            async: false, // must be synchronous to guarantee that no tests are run before fixture is loaded
            cache: false,
            dataType: 'script',
            url: $(this).attr('src'),
            success: function (data, status, $xhr) {
                htmlText += '<script>' + $xhr.responseText + '</script>'
            },
            error: function ($xhr, status, err) {
                throw new Error('Script could not be loaded: ' + scriptSrc + ' (status: ' + status + ', message: ' + err.message + ')')
            }
        });
      })

      self.fixturesCache_[relativeUrl] = htmlText;
  }

  jasmineRequire.Fixtures.prototype.makeFixtureUrl_ = function (relativeUrl){
    return this.fixturesPath.match('/$') ? this.fixturesPath + relativeUrl : this.fixturesPath + '/' + relativeUrl
  }

  jasmineRequire.Fixtures.prototype.proxyCallTo_ = function (methodName, passedArguments) {
    return this[methodName].apply(this, passedArguments)
  }


  jasmineRequire.StyleFixtures = function () {
    this.fixturesCache_ = {}
    this.fixturesNodes_ = []
    this.fixturesPath = 'spec/javascripts/fixtures'
  }

  jasmineRequire.StyleFixtures.prototype.set = function (css) {
    this.cleanUp()
    this.createStyle_(css)
  }

  jasmineRequire.StyleFixtures.prototype.appendSet = function (css) {
    this.createStyle_(css)
  }

  jasmineRequire.StyleFixtures.prototype.preload = function () {
    this.read_.apply(this, arguments)
  }

  jasmineRequire.StyleFixtures.prototype.load = function () {
    this.cleanUp()
    this.createStyle_(this.read_.apply(this, arguments))
  }

  jasmineRequire.StyleFixtures.prototype.appendLoad = function () {
    this.createStyle_(this.read_.apply(this, arguments))
  }

  jasmineRequire.StyleFixtures.prototype.cleanUp = function () {
    while(this.fixturesNodes_.length) {
      this.fixturesNodes_.pop().remove()
    }
  }

  jasmineRequire.StyleFixtures.prototype.createStyle_ = function (html) {
    var styleText = $('<div></div>').html(html).text()
      , style = $('<style>' + styleText + '</style>')

    this.fixturesNodes_.push(style)
    $('head').append(style)
  }

  jasmineRequire.StyleFixtures.prototype.clearCache = jasmineRequire.Fixtures.prototype.clearCache
  jasmineRequire.StyleFixtures.prototype.read_ = jasmineRequire.Fixtures.prototype.read
  jasmineRequire.StyleFixtures.prototype.getFixtureHtml_ = jasmineRequire.Fixtures.prototype.getFixtureHtml_
  jasmineRequire.StyleFixtures.prototype.loadFixtureIntoCache_ = jasmineRequire.Fixtures.prototype.loadFixtureIntoCache_
  jasmineRequire.StyleFixtures.prototype.makeFixtureUrl_ = jasmineRequire.Fixtures.prototype.makeFixtureUrl_
  jasmineRequire.StyleFixtures.prototype.proxyCallTo_ = jasmineRequire.Fixtures.prototype.proxyCallTo_

  jasmineRequire.getJSONFixtures = function () {
    return jasmineRequire.currentJSONFixtures_ = jasmineRequire.currentJSONFixtures_ || new jasmineRequire.JSONFixtures()
  }

  jasmineRequire.JSONFixtures = function () {
    this.fixturesCache_ = {}
    this.fixturesPath = 'spec/javascripts/fixtures/json'
  }

  jasmineRequire.JSONFixtures.prototype.load = function () {
    this.read.apply(this, arguments)
    return this.fixturesCache_
  }

  jasmineRequire.JSONFixtures.prototype.read = function () {
    var fixtureUrls = arguments

    for(var urlCount = fixtureUrls.length, urlIndex = 0; urlIndex < urlCount; urlIndex++) {
      this.getFixtureData_(fixtureUrls[urlIndex])
    }

    return this.fixturesCache_
  }

  jasmineRequire.JSONFixtures.prototype.clearCache = function () {
    this.fixturesCache_ = {}
  }

  jasmineRequire.JSONFixtures.prototype.getFixtureData_ = function (url) {
    if (!this.fixturesCache_[url]) this.loadFixtureIntoCache_(url)
    return this.fixturesCache_[url]
  }

  jasmineRequire.JSONFixtures.prototype.loadFixtureIntoCache_ = function (relativeUrl) {
    var self = this
      , url = this.fixturesPath.match('/$') ? this.fixturesPath + relativeUrl : this.fixturesPath + '/' + relativeUrl

    $.ajax({
      async: false, // must be synchronous to guarantee that no tests are run before fixture is loaded
      cache: false,
      dataType: 'json',
      url: url,
      success: function (data) {
        self.fixturesCache_[relativeUrl] = data
      },
      error: function ($xhr, status, err) {
        throw new Error('JSONFixture could not be loaded: ' + url + ' (status: ' + status + ', message: ' + err.message + ')')
      }
    })
  }

  jasmineRequire.JSONFixtures.prototype.proxyCallTo_ = function (methodName, passedArguments) {
    return this[methodName].apply(this, passedArguments)
  }

  jasmineRequire.jQuery = function () {}

  jasmineRequire.jQuery.browserTagCaseIndependentHtml = function (html) {
    return $('<div/>').append(html).html()
  }

  jasmineRequire.jQuery.elementToString = function (element) {
    return $(element).map(function () { return this.outerHTML; }).toArray().join(', ')
  }

  var data = {
      spiedEvents: {}
    , handlers:    []
  }

  jasmineRequire.jQuery.events = {
    spyOn: function (selector, eventName) {
      var handler = function (e) {
        data.spiedEvents[jasmineRequire.spiedEventsKey(selector, eventName)] = jasmineRequire.util.argsToArray(arguments)
      }

      $(selector).on(eventName, handler)
      data.handlers.push(handler)

      return {
        selector: selector,
        eventName: eventName,
        handler: handler,
        reset: function (){
          delete data.spiedEvents[jasmineRequire.spiedEventsKey(selector, eventName)]
        }
      }
    },

    args: function (selector, eventName) {
      var actualArgs = data.spiedEvents[jasmineRequire.spiedEventsKey(selector, eventName)]

      if (!actualArgs) {
        throw "There is no spy for " + eventName + " on " + selector.toString() + ". Make sure to create a spy using spyOnEvent."
      }

      return actualArgs
    },

    wasTriggered: function (selector, eventName) {
      return !!(data.spiedEvents[jasmineRequire.spiedEventsKey(selector, eventName)])
    },

    wasTriggeredWith: function (selector, eventName, expectedArgs, util, customEqualityTesters) {
      var actualArgs = jasmineRequire.jQuery.events.args(selector, eventName).slice(1)

      if (Object.prototype.toString.call(expectedArgs) !== '[object Array]')
        actualArgs = actualArgs[0]

      return util.equals(expectedArgs, actualArgs, customEqualityTesters)
    },

    wasPrevented: function (selector, eventName) {
      var args = data.spiedEvents[jasmineRequire.spiedEventsKey(selector, eventName)]
        , e = args ? args[0] : undefined

      return e && e.isDefaultPrevented()
    },

    wasStopped: function (selector, eventName) {
      var args = data.spiedEvents[jasmineRequire.spiedEventsKey(selector, eventName)]
        , e = args ? args[0] : undefined
      return e && e.isPropagationStopped()
    },

    cleanUp: function () {
      data.spiedEvents = {}
      data.handlers    = []
    }
  }

  var hasProperty = function (actualValue, expectedValue) {
    if (expectedValue === undefined)
      return actualValue !== undefined

    return actualValue === expectedValue
  }

  beforeEach(function () {
    jasmineRequire.addMatchers({
      toHaveClass: function () {
        return {
          compare: function (actual, className) {
            return { pass: $(actual).hasClass(className) }
          }
        }
      },

      toHaveCss: function () {
        return {
          compare: function (actual, css) {
            for (var prop in css){
              var value = css[prop]
              // see issue #147 on gh
              ;if (value === 'auto' && $(actual).get(0).style[prop] === 'auto') continue
              if ($(actual).css(prop) !== value) return { pass: false }
            }
            return { pass: true }
          }
        }
      },

      toBeVisible: function () {
        return {
          compare: function (actual) {
            return { pass: $(actual).is(':visible') }
          }
        }
      },

      toBeHidden: function () {
        return {
          compare: function (actual) {
            return { pass: $(actual).is(':hidden') }
          }
        }
      },

      toBeSelected: function () {
        return {
          compare: function (actual) {
            return { pass: $(actual).is(':selected') }
          }
        }
      },

      toBeChecked: function () {
        return {
          compare: function (actual) {
            return { pass: $(actual).is(':checked') }
          }
        }
      },

      toBeEmpty: function () {
        return {
          compare: function (actual) {
            return { pass: $(actual).is(':empty') }
          }
        }
      },

      toBeInDOM: function () {
        return {
          compare: function (actual) {
            return { pass: $.contains(document.documentElement, $(actual)[0]) }
          }
        }
      },

      toExist: function () {
        return {
          compare: function (actual) {
            return { pass: $(actual).length }
          }
        }
      },

      toHaveLength: function () {
        return {
          compare: function (actual, length) {
            return { pass: $(actual).length === length }
          }
        }
      },

      toHaveAttr: function () {
        return {
          compare: function (actual, attributeName, expectedAttributeValue) {
            return { pass: hasProperty($(actual).attr(attributeName), expectedAttributeValue) }
          }
        }
      },

      toHaveProp: function () {
        return {
          compare: function (actual, propertyName, expectedPropertyValue) {
            return { pass: hasProperty($(actual).prop(propertyName), expectedPropertyValue) }
          }
        }
      },

      toHaveId: function () {
        return {
          compare: function (actual, id) {
            return { pass: $(actual).attr('id') == id }
          }
        }
      },

      toHaveHtml: function () {
        return {
          compare: function (actual, html) {
            return { pass: $(actual).html() == jasmineRequire.jQuery.browserTagCaseIndependentHtml(html) }
          }
        }
      },

      toContainHtml: function () {
        return {
          compare: function (actual, html) {
            var actualHtml = $(actual).html()
              , expectedHtml = jasmineRequire.jQuery.browserTagCaseIndependentHtml(html)

            return { pass: (actualHtml.indexOf(expectedHtml) >= 0) }
          }
        }
      },

      toHaveText: function () {
        return {
          compare: function (actual, text) {
            var actualText = $(actual).text()
            var trimmedText = $.trim(actualText)

            if (text && $.isFunction(text.test)) {
              return { pass: text.test(actualText) || text.test(trimmedText) }
            } else {
              return { pass: (actualText == text || trimmedText == text) }
            }
          }
        }
      },

      toContainText: function () {
        return {
          compare: function (actual, text) {
            var trimmedText = $.trim($(actual).text())

            if (text && $.isFunction(text.test)) {
              return { pass: text.test(trimmedText) }
            } else {
              return { pass: trimmedText.indexOf(text) != -1 }
            }
          }
        }
      },

      toHaveValue: function () {
        return {
          compare: function (actual, value) {
            return { pass: $(actual).val() === value }
          }
        }
      },

      toHaveData: function () {
        return {
          compare: function (actual, key, expectedValue) {
            return { pass: hasProperty($(actual).data(key), expectedValue) }
          }
        }
      },

      toContainElement: function () {
        return {
          compare: function (actual, selector) {
            if (window.debug) debugger
            return { pass: $(actual).find(selector).length }
          }
        }
      },

      toBeMatchedBy: function () {
        return {
          compare: function (actual, selector) {
            return { pass: $(actual).filter(selector).length }
          }
        }
      },

      toBeDisabled: function () {
        return {
          compare: function (actual, selector) {
            return { pass: $(actual).is(':disabled') }
          }
        }
      },

      toBeFocused: function (selector) {
        return {
          compare: function (actual, selector) {
            return { pass: $(actual)[0] === $(actual)[0].ownerDocument.activeElement }
          }
        }
      },

      toHandle: function () {
        return {
          compare: function (actual, event) {
            var events = $._data($(actual).get(0), "events")

            if (!events || !event || typeof event !== "string") {
              return { pass: false }
            }

            var namespaces = event.split(".")
              , eventType = namespaces.shift()
              , sortedNamespaces = namespaces.slice(0).sort()
              , namespaceRegExp = new RegExp("(^|\\.)" + sortedNamespaces.join("\\.(?:.*\\.)?") + "(\\.|$)")

            if (events[eventType] && namespaces.length) {
              for (var i = 0; i < events[eventType].length; i++) {
                var namespace = events[eventType][i].namespace

                if (namespaceRegExp.test(namespace))
                  return { pass: true }
              }
            } else {
              return { pass: (events[eventType] && events[eventType].length > 0) }
            }

            return { pass: false }
          }
        }
      },

      toHandleWith: function () {
        return {
          compare: function (actual, eventName, eventHandler) {
            var normalizedEventName = eventName.split('.')[0]
              , stack = $._data($(actual).get(0), "events")[normalizedEventName]

            for (var i = 0; i < stack.length; i++) {
              if (stack[i].handler == eventHandler) return { pass: true }
            }

            return { pass: false }
          }
        }
      },

      toHaveBeenTriggeredOn: function () {
        return {
          compare: function (actual, selector) {
            var result = { pass: jasmineRequire.jQuery.events.wasTriggered(selector, actual) }

            result.message = result.pass ?
              "Expected event " + $(actual) + " not to have been triggered on " + selector :
              "Expected event " + $(actual) + " to have been triggered on " + selector

            return result;
          }
        }
      },

      toHaveBeenTriggered: function (){
        return {
          compare: function (actual) {
            var eventName = actual.eventName
              , selector = actual.selector
              , result = { pass: jasmineRequire.jQuery.events.wasTriggered(selector, eventName) }

            result.message = result.pass ?
            "Expected event " + eventName + " not to have been triggered on " + selector :
              "Expected event " + eventName + " to have been triggered on " + selector

            return result
          }
        }
      },

      toHaveBeenTriggeredOnAndWith: function (j$, customEqualityTesters) {
        return {
          compare: function (actual, selector, expectedArgs) {
            var wasTriggered = jasmineRequire.jQuery.events.wasTriggered(selector, actual)
              , result = { pass: wasTriggered && jasmineRequire.jQuery.events.wasTriggeredWith(selector, actual, expectedArgs, j$, customEqualityTesters) }

              if (wasTriggered) {
                var actualArgs = jasmineRequire.jQuery.events.args(selector, actual, expectedArgs)[1]
                result.message = result.pass ?
                  "Expected event " + actual + " not to have been triggered with " + jasmineRequire.pp(expectedArgs) + " but it was triggered with " + jasmineRequire.pp(actualArgs) :
                  "Expected event " + actual + " to have been triggered with " + jasmineRequire.pp(expectedArgs) + "  but it was triggered with " + jasmineRequire.pp(actualArgs)

              } else {
                // todo check on this
                result.message = result.pass ?
                  "Expected event " + actual + " not to have been triggered on " + selector :
                  "Expected event " + actual + " to have been triggered on " + selector
              }

              return result
          }
        }
      },

      toHaveBeenPreventedOn: function () {
        return {
          compare: function (actual, selector) {
            var result = { pass: jasmineRequire.jQuery.events.wasPrevented(selector, actual) }

            result.message = result.pass ?
              "Expected event " + actual + " not to have been prevented on " + selector :
              "Expected event " + actual + " to have been prevented on " + selector

            return result
          }
        }
      },

      toHaveBeenPrevented: function () {
        return {
          compare: function (actual) {
            var eventName = actual.eventName
              , selector = actual.selector
              , result = { pass: jasmineRequire.jQuery.events.wasPrevented(selector, eventName) }

            result.message = result.pass ?
              "Expected event " + eventName + " not to have been prevented on " + selector :
              "Expected event " + eventName + " to have been prevented on " + selector

            return result
          }
        }
      },

      toHaveBeenStoppedOn: function () {
        return {
          compare: function (actual, selector) {
            var result = { pass: jasmineRequire.jQuery.events.wasStopped(selector, actual) }

            result.message = result.pass ?
              "Expected event " + actual + " not to have been stopped on " + selector :
              "Expected event " + actual + " to have been stopped on " + selector

            return result;
          }
        }
      },

      toHaveBeenStopped: function () {
        return {
          compare: function (actual) {
            var eventName = actual.eventName
              , selector = actual.selector
              , result = { pass: jasmineRequire.jQuery.events.wasStopped(selector, eventName) }

            result.message = result.pass ?
              "Expected event " + eventName + " not to have been stopped on " + selector :
              "Expected event " + eventName + " to have been stopped on " + selector

            return result
          }
        }
      }
    })

    jasmineRequire.getEnv().addCustomEqualityTester(function(a, b) {
     if (a && b) {
       if (a instanceof $ || jasmineRequire.isDomNode(a)) {
         var $a = $(a)

         if (b instanceof $)
           return $a.length == b.length && a.is(b)

         return $a.is(b);
       }

       if (b instanceof $ || jasmineRequire.isDomNode(b)) {
         var $b = $(b)

         if (a instanceof $)
           return a.length == $b.length && $b.is(a)

         return $(b).is(a);
       }
     }
    })

    jasmineRequire.getEnv().addCustomEqualityTester(function (a, b) {
     if (a instanceof $ && b instanceof $ && a.size() == b.size())
        return a.is(b)
    })
  })

  afterEach(function () {
    jasmineRequire.getFixtures().cleanUp()
    jasmineRequire.getStyleFixtures().cleanUp()
    jasmineRequire.jQuery.events.cleanUp()
  })

  window.readFixtures = function () {
    return jasmineRequire.getFixtures().proxyCallTo_('read', arguments)
  }

  window.preloadFixtures = function () {
    jasmineRequire.getFixtures().proxyCallTo_('preload', arguments)
  }

  window.loadFixtures = function () {
    jasmineRequire.getFixtures().proxyCallTo_('load', arguments)
  }

  window.appendLoadFixtures = function () {
    jasmineRequire.getFixtures().proxyCallTo_('appendLoad', arguments)
  }

  window.setFixtures = function (html) {
    return jasmineRequire.getFixtures().proxyCallTo_('set', arguments)
  }

  window.appendSetFixtures = function () {
    jasmineRequire.getFixtures().proxyCallTo_('appendSet', arguments)
  }

  window.sandbox = function (attributes) {
    return jasmineRequire.getFixtures().sandbox(attributes)
  }

  window.spyOnEvent = function (selector, eventName) {
    return jasmineRequire.jQuery.events.spyOn(selector, eventName)
  }

  window.preloadStyleFixtures = function () {
    jasmineRequire.getStyleFixtures().proxyCallTo_('preload', arguments)
  }

  window.loadStyleFixtures = function () {
    jasmineRequire.getStyleFixtures().proxyCallTo_('load', arguments)
  }

  window.appendLoadStyleFixtures = function () {
    jasmineRequire.getStyleFixtures().proxyCallTo_('appendLoad', arguments)
  }

  window.setStyleFixtures = function (html) {
    jasmineRequire.getStyleFixtures().proxyCallTo_('set', arguments)
  }

  window.appendSetStyleFixtures = function (html) {
    jasmineRequire.getStyleFixtures().proxyCallTo_('appendSet', arguments)
  }

  window.loadJSONFixtures = function () {
    return jasmineRequire.getJSONFixtures().proxyCallTo_('load', arguments)
  }

  window.getJSONFixture = function (url) {
    return jasmineRequire.getJSONFixtures().proxyCallTo_('read', arguments)[url]
  }
}(window, window.jasmine, window.jQuery);
