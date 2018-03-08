'use strict';

angular.module('tc.services', [])

.service('minerService', ['$http', function($http){
   
   return {
      getStats: function( pool_api_url, wallet_address ) {
          return $http.get(atob(pool_api_url) + 'stats_address?address=' + wallet_address + '&longpoll=longpoll', { cache: true }).then(function(result) {
              return result.data;
          });
      }
   }
}])

.service('poolService', ['$http', function($http){
   
   return {
      getStats: function( pool_api_url ) {
          return $http.get(atob(pool_api_url) + 'live_stats', { cache: true }).then(function(result) {
              return result.data;
          });
      }
   }
}])

.service('hashChartService', ['$filter', function($filter){
   
   return {
      doChart: function( hashes_array ) {
          
            var hashes = [];
            
            angular.forEach(hashes_array, function(value, key) {
                
                if(hashes_array.length > 30)
                {
                    // API gives us the last 45 data points by default
                    // only show the most recent 15
                    if(key >= 30)
                    {
                        var data_point = {
                            name: hashes_array[key][0],
                            y: Number(hashes_array[key][1])
                        }
                        hashes.push(data_point);
                    }
                }
                else
                {
                    var data_point = {
                        name: hashes_array[key][0],
                        y: Number(hashes_array[key][1])
                    }
                    hashes.push(data_point);
                }
            });
            
            setTimeout(function() {
                $('#chart').highcharts({
                    chart: {
                        type: "areaspline",
                        backgroundColor: '#F9F9F9'
                    },
                    legend: {
                        enabled: false
                    },
                    credits: {
                        enabled: false
                    },
                    title: {
                        text: '',
                        style: {
                            'display':'none'
                        }
                    },
                    yAxis: {
                        labels: {
                          style: {
                              fontFamily: '"Roboto", Helvetica, Arial',
                              color: '#5d5d5d'
                          }
                        },
                        title: {
                            text: ''
                        },
                        gridLineColor: '#5d5d5d'
                    },
                    xAxis: {
                        labels: {
                          enabled: false  
                        },
                        lineWidth: 0,
                        minorGridLineWidth: 0,
                        lineColor: 'transparent',
                        minorTickLength: 0,
                        tickLength: 0
                    },
                    tooltip: {
                        formatter: function(){
                            return $filter('timeAgo')(this.point.name) + '<br>' + $filter('hashrateFormat')(this.point.y) + '/sec';
                        },
                        shadow: false
                    },
                    series: [{
                        color: '#5d5d5d',
                        data: hashes
                    }]
                });
            }, 500);
      }
   }
}]);