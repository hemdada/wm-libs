'use strict';

/*
 * AngularJS Toaster
 * Version: 0.3
 *
 * Copyright 2013 Jiri Kavulak.  
 * All Rights Reserved.  
 * Use, reproduction, distribution, and modification of this code is subject to the terms and 
 * conditions of the MIT license, available at http://www.opensource.org/licenses/mit-license.php
 *
 * Author: Jiri Kavulak
 * Related to project of John Papa and Hans Fj?llemark
 */

angular.module('toaster', [])
.service('toaster', ['$rootScope', function ($rootScope) {
    this.pop = function (type, title, body, timeout, trustedHtml) {
            this.toast = {};
            $rootScope.$broadcast('toaster-newToast', {
                toast: {
                    type: type,
                    title: title,
                    body: body,
                    timeout: timeout,
                    trustedHtml: trustedHtml
                }
            });
        },
            this.compile = function (scope) {
                $rootScope = scope;
            };
}])
.constant('toasterConfig', {
                                  'tap-to-dismiss': true,
                                        'newest-on-top': true,
                                        //'fade-in': 1000,            // done in css
                                        //'on-fade-in': undefined,    // not implemented
                                        //'fade-out': 1000,           // done in css
                                        // 'on-fade-out': undefined,  // not implemented
                                        //'extended-time-out': 1000,    // not implemented
                                        'time-out': 5000, // Set timeOut and extendedTimeout to 0 to make it sticky
                                        'icon-classes': {
                                                error: 'toast-error',
                                                info: 'toast-info',
                                                success: 'toast-success',
                                                warning: 'toast-warning'
                                        },
                                        'trustedHtml': false,
                                        'icon-class': 'toast-info',
                                        'position-class': 'toast-top-right',
                                        'title-class': 'toast-title',
                                        'message-class': 'toast-message'
                                })
.directive('toasterContainer', ['$compile', '$timeout', '$sce', 'toasterConfig', 'toaster',
function ($compile, $timeout, $sce, toasterConfig, toaster) {
  return {
    replace: true,
    restrict: 'EA',
    link: function (scope, elm, attrs){

      var id = 0;

      var mergedConfig = toasterConfig;
      if (attrs.toasterOptions) {
          angular.extend(mergedConfig, scope.$eval(attrs.toasterOptions));
      }

      scope.config = {
          position: mergedConfig['position-class'],
          title: mergedConfig['title-class'],
          message: mergedConfig['message-class'],
          tap: mergedConfig['tap-to-dismiss']
      };

      function addToast (toast){
        toast.type = mergedConfig['icon-classes'][toast.type];
        if (!toast.type)
            toast.type = mergedConfig['icon-class'];

        if (toast.trustedHtml){
          toast.html = $sce.trustAsHtml(toast.body);
        }

        scope.toaster = toast;
        scope.toaster.show = true;

        var timeout = typeof(toast.timeout) == "number" ? toast.timeout : mergedConfig['time-out'];
        if (timeout > 0)
            setTimeout(toast, timeout);


      }

      function setTimeout(toast, time){
          toast.timeout= $timeout(function (){
              scope.removeToast(toast.id);
            }, time);
      }

      scope.toaster = {};
      scope.toaster.show = false;
      scope.$on('toaster-newToast', function (event, args) {
        toaster.toast = args.toast;
        addToast(toaster.toast);
      });
    },
    controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs) {

      $scope.stopTimer = function(toast){
        if(toast.timeout)
          $timeout.cancel(toast.timeout);
      };

      $scope.removeToast = function (id){
          $scope.toaster = {};
          $scope.toaster.show = false;
      };

      $scope.remove = function(id){
        if ($scope.config.tap === true){
            $scope.removeToast(id);
        }
      };
    }],
    template:
    '<div  id="toast-container" ng-class="config.position">' +
      '<div ng-class="\'animateToaster\'" ng-show="toaster.show">' +
        '<div class="toast" ng-class="toaster.type" ng-click="remove(toaster.id)" ng-mouseover="stopTimer(toaster)">' +
          '<div ng-class="config.title">{{toaster.title}}</div>' +
          '<div ng-class="config.message" ng-switch on="toaster.trustedHtml">' +
            '<div ng-switch-when="true" ng-bind-html="toaster.html"></div>' +
            '<div ng-switch-default >{{toaster.body}}</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>'
  };
}]);