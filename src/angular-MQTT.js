/**
 * Created by shellus on 2016-03-16.
 * Edit by Tanakun wangpong on 2018-06-05.
 */
angular.module('ngMQTT', [])
    .config(['$provide', function($provide) {
      $provide.provider('MQTT', function() {
        var settings = {
          href: '',
          option: {}
        };
        this.setHref = function(href) {
          settings.href = href;
        };
        this.setOption = function(option) {
          settings.option = option;
        };
        this.$get = function() {
          return settings;
        };
      });
    }])

    .service('MQTTService', ['MQTT', '$state', '$q', '$rootScope', function(MQTT, $state, $q, $rootScope) {
      var Service = {};
      var callbacks = {};
      var client = mqtt.connect(MQTT.href, MQTT.option);
      client.on('message', function(topic, payload) {
        try {
          var data = JSON.parse(payload.toString());
        } catch (e) {
          var data = payload.toString();
        }
        angular.forEach(callbacks, function(callback, name) {
          var regexpStr = name.replace(new RegExp('(#)|(\\*)|(\\+)'), function(str) {
            switch (str) {
              case '#':
                return '.*?';
                break;
              case '*':
                return '.*?';
                break;
              case '+':
                return '.*';
                break;
              default:
                break;
            }
          });
          if (topic.match(regexpStr)) {
            $rootScope.$apply(function() {
              callback(data, topic);
            });
          }
        });
      });
      client.on('error', function(data) {
        window.location.href = '/api/auth/signout';
        $state.go('authentication.signin');
      });
      client.publish('time', (new Date()).getDate());
      Service.on = function(name, callback) {
        callbacks[name] = callback;
        client.subscribe(name);
      };
      Service.send = function(name, data) {
        client.publish(name, JSON.stringify(data));
      };
      Service.drop = function(name, callback) {
        callbacks[name] = callback;
        client.unsubscribe(name);
      };
      return Service;
    }]);
