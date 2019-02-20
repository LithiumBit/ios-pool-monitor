'use strict';

angular.module('tc.controllers', [])

.controller('HomeCtrl', ['$scope', '$location', function HomeCtrl($scope, $location) {
    
    var storage = window.localStorage;
    var storage_wallet_address = storage.getItem('wallet_address');
    var storage_selected_pool = storage.getItem('selected_pool');
    var storage_selected_pool_index = storage.getItem('selected_pool_index');
    var storage_selected_pool_name = storage.getItem('selected_pool_name');
    var wallet_input = $('#walletAddress');
    var pool_input = $('#poolApiUrl');
    $scope.loading = true;

    var doUpdatePools = function () {   
        $.ajaxSetup({ cache: false });https://raw.githubusercontent.com/LithiumBit/turtlecoin-pools-json/master/v2/lbit-pools.json
        $.getJSON('', function (data) {
            $.each(data.pools, function (index, pool) {
                
                var selected = '';
                
                if (pool.name == storage_selected_pool_name) {
                    selected = 'selected';
                }
                
                if (pool.type == "forknote") {
                    pool_input.append('<option value="' + pool.name + '|' + pool.api + '" ' + selected + '>' + pool.name + '</option>');
                }
            });
        });
        $scope.loading = false;
    };

    doUpdatePools();

    var sendToDashboard = function(wallet, pool, apply=null)
    {
        var full_path = '/dashboard/' + pool + '/' + wallet;
        $location.path(full_path);
        $location.replace();
        if(apply)
        {
            $scope.$apply();
        }
    };
    var getParameterByName = function (name, url)
    {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    };
    
    // auto-forward to dashboard per previous selections
    if(storage_wallet_address &&  storage_selected_pool && (getParameterByName('reset') !== 'address'))
    {
        sendToDashboard(
            storage_wallet_address,
            btoa(storage_selected_pool)
        );
    }
    
    // check for previously stored
    if(!storage_wallet_address)
    {
        wallet_input.val('Wallet address');
    }
    else
    {
        wallet_input.val(storage_wallet_address);
    }
    
    var doSubmitPool = function() {
        var pool = btoa(pool_input.val());
        var wallet_address = wallet_input.val();
        
        if(wallet_address.length > 1 && wallet_address !== 'Wallet address') {
            
            storage.setItem('wallet_address', wallet_address);
            storage.setItem('selected_pool', pool_input.val());
            storage.setItem('selected_pool_index', pool_input[0].selectedIndex);

            var opt = pool_input[0].options[pool_input[0].selectedIndex];

            storage.setItem('selected_pool_name', opt.text);
            
            sendToDashboard(wallet_address, pool, true);
        }
    };
    
    $('#submitPool').on('keydown', function(e) {
        if (e.which == 13) {
            doSubmitPool();
            e.preventDefault();
        }
    });
    
    $('#submitPool').on('click', function(){
        doSubmitPool();
    });
}])

.controller('DashboardCtrl', ['$scope', '$location', '$route', '$timeout', '$filter', 'minerService', 'hashChartService', function DashboardCtrl($scope, $location, $route, $timeout, $filter, minerService, hashChartService) {
    
    $scope.getClass = function (path) {
        return ($location.path().substr(0, path.length) === path) ? 'active' : '';
    }
    
    var poolInfo = atob($route.current.params.pool)
    poolInfo = poolInfo.split("|");
    
    $scope.pool_encoded = $route.current.params.pool;
    $scope.pool_name = poolInfo[0];
    $scope.pool_api_url = btoa(poolInfo[1]);
    $scope.wallet_address = $route.current.params.wallet_address;
    $scope.custom_error = '';
    $scope.loading = true;
    
    minerService.getStats( $scope.pool_api_url, $scope.wallet_address ).then(function(stats) {
        if(stats.error == "not found" || stats.error == "pool api down")
        {
            $scope.has_results = false;
            $scope.custom_error = "No data returned by pool for that wallet address.";
            
            if(stats.error == "pool api down")
            {
                $scope.custom_error = "Bad connection or " + poolInfo[0] + " API is down.";
            }
        }
        else
        {
            $scope.has_results = true;
        
            $scope.miner_stats = stats.stats;
            $scope.paid_formatted = (Number(stats.stats.paid) / 100).toFixed(2);
            $scope.balance_formatted = (Number(stats.stats.balance) / 100).toFixed(2);
            $scope.last_share = $filter('timeAgo')(stats.stats.lastShare);
            $scope.last_payment = null;
            
            if(stats.payments.length > 0)
            {
                $scope.last_payment = $filter('timeAgo')(stats.payments[1]);
            }
            
            if(stats.hasOwnProperty('charts'))
            {
                $scope.hashrate_chart = stats.charts.hashrate;
                hashChartService.doChart(stats.charts.hashrate);
            }
            else
            {
                $scope.hashrate_chart = 0;
            }
        }
        
        $scope.loading = false;
    });
    
    $scope.timer = $timeout(function() {
        // fix for header not being at top after submit
        // home search form without closing keyboard first
        window.scrollTo(document.body.scrollLeft, document.body.scrollTop);
    }, 100);
    
    $scope.$on("$destroy", function(){
        $timeout.cancel($scope.timer);
    });
}])

.controller('PoolCtrl', ['$scope', '$location', '$route', '$timeout', '$filter', 'poolService', 'hashChartService', function PoolCtrl($scope, $location, $route, $timeout, $filter, poolService, hashChartService) {
    
    $scope.getClass = function (path) {
        return ($location.path().substr(0, path.length) === path) ? 'active' : '';
    }
    
    var poolInfo = atob($route.current.params.pool)
    poolInfo = poolInfo.split("|");
    
    $scope.pool_encoded = $route.current.params.pool;
    $scope.pool_name = poolInfo[0];
    $scope.pool_api_url = btoa(poolInfo[1]);
    $scope.wallet_address = $route.current.params.wallet_address;
    $scope.custom_error = '';
    $scope.loading = true;
    
    poolService.getStats( $scope.pool_api_url ).then(function(stats) {
        
        if(stats.error == "not found" || stats.error == "pool api down")
        {
            $scope.has_results = false;
            $scope.custom_error = "No data returned by the pool.";
            
            if(stats.error == "pool api down")
            {
                $scope.custom_error = "Bad connection or " + poolInfo[0] + " API is down.";
            }
        }
        else
        {
            $scope.has_results = true;

            $scope.pool_stats = stats.pool;
            $scope.pool_config = stats.config;
            $scope.network_stats = stats.network;
            $scope.network_last_updated = $filter('timeAgo')(stats.network.timestamp);
            $scope.min_payment = $filter('formatTRTL')(stats.config.minPaymentThreshold);
            $scope.block_reward = $filter('formatTRTL')(stats.network.reward);
            $scope.pool_hashrate = $filter('hashrateFormat')(stats.pool.hashrate);
            $scope.last_block_found = $filter('timeAgo')(stats.pool.lastBlockFound / 1000);
            $scope.avg_block = $filter('getReadableTime')(stats.network.difficulty / stats.pool.hashrate);
            
            hashChartService.doChart(stats.charts.hashrate);
        }

        $scope.loading = false;
    });
    
}])

.controller('PayoutsCtrl', ['$scope', '$location', '$route', '$timeout', '$filter', 'minerService', function PayoutsCtrl($scope, $location, $route, $timeout, $filter,  minerService) {
    
    $scope.getClass = function (path) {
        return ($location.path().substr(0, path.length) === path) ? 'active' : '';
    }

    var poolInfo = atob($route.current.params.pool)
    poolInfo = poolInfo.split("|");
    
    $scope.pool_encoded = $route.current.params.pool;
    $scope.pool_name = poolInfo[0];
    $scope.pool_api_url = btoa(poolInfo[1]);
    $scope.wallet_address = $route.current.params.wallet_address;
    $scope.custom_error = '';
    $scope.loading = true;
    
    minerService.getStats( $scope.pool_api_url, $scope.wallet_address ).then(function(stats) {
        
        if(stats.error == "not found" || stats.error == "pool api down")
        {
            $scope.has_results = false;
            $scope.custom_error = "No data returned by pool for that wallet address.";
            
            if(stats.error == "pool api down")
            {
                $scope.custom_error = "Bad connection or " + poolInfo[0] + " API is down.";
            }
        }
        else
        {
            $scope.has_results = true;
        
            var parsePayment = function (time, serializedPayment){
                var parts = serializedPayment.split(':');
                return {
                    time: $filter('timeAgo')(parseInt(time)),
                    hash: parts[0],
                    amount: (Number(parts[1]) / 100).toFixed(2)
                };
            };
            
            var minerPayments = [];
            
            if(stats.payments)
            {
                for (var i = 0; i < stats.payments.length; i += 2){
                    var payment = parsePayment(stats.payments[i + 1], stats.payments[i]);
                    minerPayments.push(payment);
                }
            }
            
            $scope.miner_payments = minerPayments;
        }
    
        $scope.loading = false;
    });
    
}]);
