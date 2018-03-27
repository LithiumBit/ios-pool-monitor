'use strict';

angular.module('tc.directives', [])

.directive('contextMenu', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.bind('click', function(){
                var context_menu = angular.element(document.querySelector('#context_menu'));
                context_menu.attr("style", "visibility: visible");
                
                setTimeout(function() {
                    context_menu.attr("style", "visibility: hidden");
                }, 3000);
            });
        }
    }
});