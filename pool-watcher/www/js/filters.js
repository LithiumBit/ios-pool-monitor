'use strict';

angular.module('tc.filters', [])

.filter('getReadableTime', function(){
    return function(seconds) {
        var units = [ [60, 'second'], [60, 'minute'], [24, 'hour'],
            [7, 'day'], [4, 'week'], [12, 'month'], [1, 'year'] ];
        function formatAmounts(amount, unit){
            var rounded = Math.round(amount);
            return '' + rounded + ' ' + unit + (rounded > 1 ? 's' : '');
        }
        var amount = seconds;
        for (var i = 0; i < units.length; i++){
            if (amount < units[i][0])
                return formatAmounts(amount, units[i][1]);
            amount = amount / units[i][0];
        }
        return formatAmounts(amount,  units[units.length - 1][1]);
    }
})

.filter('timeAgo', function() {
  return function(date) {
    var d = new Date(parseInt(date) * 1000).toISOString();
    return jQuery.timeago(d);
  }
})

.filter('hashrateFormat', function() {
  return function(hashrate) {
    var i = 0;
    var byteUnits = [' H', ' KH', ' MH', ' GH', ' TH', ' PH' ];
    while (hashrate > 1000){
        hashrate = hashrate / 1000;
        i++;
    }
    return hashrate.toFixed(2) + byteUnits[i];
  }
})

.filter('formatTRTL', function() {
  return function(amount) {
    return (Number(amount) / 100).toFixed(2);
  }
});