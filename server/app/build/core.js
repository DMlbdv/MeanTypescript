/**
 * Created by Michael on 6/22/2015.
 */
angular.module('myApp', ['ngRoute', 'ngSanitize', 'ngAnimate', 'ngCookies', 'ngMessages', 'ui.bootstrap', 'ui.grid'])
    .config(['$routeProvider', '$locationProvider', '$compileProvider', function ($routeProvider, $locationProvider, $compileProvider) {

        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel|content|geo|http?):/);

        var html5History = !!(window.history && window.history.pushState);		//actual check
        //android / browser sniffer 2nd check
        var ua = navigator.userAgent;
        if (typeof(globalPhoneGap) != "undefined" && globalPhoneGap === true) {
            html5History = false;
        }
        else if (ua.indexOf("PhantomJS") >= 0) {		//karma - setting a global variable in a different file isn't seeming to work / be included and with html5 mode, we get new 1.3.0-rc.0 $location:nobase error..
            html5History = false;
        }
        else if (ua.indexOf("Android") >= 0) {
            var androidversion = parseFloat(ua.slice(ua.indexOf("Android") + 8));
            if (androidversion < 3) {
                html5History = false;
            }
        }

        if (html5History) {
            $locationProvider.html5Mode(true);
        }
        $routeProvider
            .when('/', {
                templateUrl: 'components/addactivity.html',
                controller: 'AddActivityCtrl',
                description: 'Add Activity',
                controllerAs: 'vm',
                exclude: false
            })
            .when('/activities', {
                templateUrl: 'components/activities.html',
                controller: 'ActivitiesCtrl',
                controllerAs: 'vm',
                description: 'Activities',
                exclude: false
            });
    }])
    .controller('RouteCtrl', ['$route', function ($route) {
        var vm = this;
        vm.routes = [];
        $.each($route.routes, function (i, c) {
            if (c.templateUrl) {
                if (!c.exclude) {
                    vm.routes.push({
                        url: i,
                        description: c.description
                    });
                }
            }
        });
    }
    ])
    .controller('AddActivityCtrl', ['datacontext', function (datacontext) {
        var vm = this;
        vm.technicians = [];
        vm.loading = true;
        vm.activity = datacontext.newActivity();
        datacontext.getTechnicians().then(function (result) {
            vm.technicians = [].concat(result.data);
            vm.loading = false;
        });
        vm.minDate = moment().add(-7, 'days');
        vm.maxDate = moment().add(1, 'days');
        vm.dateOptions = {
            formatYear: 'yy',
            startingDay: 1,
            initDate: moment()


        };
        vm.reset = function (event, another) {
            if (event) {
                event.preventDefault();
                vm.activity = datacontext.newActivity();
            }
            if (another) {
                vm.activity = datacontext.newActivity(another, $scope);
            }
        };
        vm.save = function (event, another) {
            event.stopPropagation();
            datacontext.saveActivity(vm.activity).then(function (res) {
                if (res.status === 201) {
                    toastr.info('Saved');
                    if (another) {
                        vm.reset(null, another);
                        vm.another = another;
                    } else {
                        vm.reset(event);
                    }
                }
            });
        };
        vm.format = 'dd-MMM-yy';
    }])
    .controller('ActivitiesCtrl', ['datacontext', function (datacontext) {
        var vm = this;
        vm.loading = false;
        vm.pageOptions = {
            pageSizes: [10, 20, 50],
            pageSize: 20,
            totalServerItems: 0,
            currentPage: 1
        };
        vm.pageOptions.pageSize = 10;
        var lastPage = vm.pageOptions.currentPage;
        vm.totalServerItems = 0;
        vm.activities = [];
        vm.technicians = [];
        vm.searchTextWork = '';
        vm.searchTextOrders = '';
        vm.orderSuccess = false;
        vm.workSuccess = false;
        vm.technician = null;
        vm.technicianId = 0;
        vm.clearWork = function (event) {
            event.stopPropagation();
            vm.searchTextWork = '';
            vm.searchTextOrders = '';
            vm.orderSuccess = false;
            vm.techniciansDisabled = false;
            vm.workSuccess = false;
            vm.getPagedDataAsync(vm.pageOptions.pageSize, vm.pageOptions.currentPage, vm.searchTextWork, vm.searchTextOrders, vm.technicianId);
        };
        vm.clearOrder = function (event) {
            event.stopPropagation();
            vm.searchTextWork = '';
            vm.searchTextOrders = '';
            vm.orderSuccess = false;
            vm.techniciansDisabled = false;
            vm.workSuccess = false;
            vm.getPagedDataAsync(vm.pageOptions.pageSize, vm.pageOptions.currentPage, vm.searchTextWork, vm.searchTextOrders, vm.technicianId);
        };
        vm.clearTechnician = function (event) {
            event.stopPropagation();
            vm.technician = undefined;
            vm.orderSuccess = false;
            vm.techniciansDisabled = false;
            vm.technicianId = 0;
            vm.workSuccess = false;
            vm.getPagedDataAsync(vm.pageOptions.pageSize, vm.pageOptions.currentPage, vm.searchTextWork, vm.searchTextOrders, vm.technicianId);
        };
        vm.onSelect = function ($item) {
            vm.technicianId = $item.id;
            vm.searchTextOrders = '';
            vm.searchTextWork = '';
            vm.getPagedDataAsync(vm.pageOptions.pageSize, vm.pageOptions.currentPage, vm.searchTextWork, vm.searchTextOrders, vm.technicianId);
        };
        datacontext.getTechnicians().then(function (result) {
            vm.technicians = [].concat(result.data);
        });
        vm.getPagedDataAsync = function (pageSize, page) {
            datacontext.getActivitiesListPaged(pageSize, page, vm.searchTextWork, vm.searchTextOrders, vm.technicianId)
                .then(function (data) {
                    vm.activities.length = 0;
                    vm.activities = [].concat(data.data);
                    vm.activitiesOptions.data = vm.activities;
                    vm.activitiesOptions.minRowsToShow = vm.activities.length;
                    vm.orderSuccess = false;
                    vm.techniciansDisabled = false;
                    vm.workSuccess = false;
                })
                .catch(function (err) {
                    console.log(err);
                });
        };
        vm.activitiesOptions = {
            data: [],
            appScopeProvider: vm,
            columnDefs: [
                {
                    field: 'technician',
                    displayName: 'Technician',
                    width: '14%',
                    headerCellClass: 'center'
                },
                {
                    field: 'workDate',
                    displayName: 'Work Date',
                    cellFilter: 'date:"MM/dd/yyyy"',
                    width: '10%',
                    headerCellClass: 'center'
                },
                {
                    field: 'projectWorked',
                    displayName: 'Order Worked',
                    width: '8%',
                    headerCellClass: 'center'
                },
                {
                    field: 'hoursWorked',
                    displayName: 'Hours',
                    width: '8%',
                    headerCellClass: 'center'
                },
                {
                    field: 'workPerformed',
                    displayName: 'Work Performed/Issues',
                    width: '30%',
                    headerCellClass: 'center'
                },
                {
                    field: 'materialsUsed',
                    displayName: 'Materials',
                    width: '30%',
                    headerCellClass: 'center'
                }

            ],
            multiSelect: false,
            enableColumnMenus: false,
            enableFiltering: false,
            enablePaging: true,
            showFooter: true,
            enableSorting: false,
            enableHiding: false,
            paginationPageSizes: [25, 50, 75],
            paginationPageSize: 25
        };
        function searchWork() {
            if (vm.searchTextWork !== '') {
                vm.orderSuccess = true;
                vm.techniciansDisabled = true;
                vm.searchTextOrders = '';
                vm.technicianId = 0;
                vm.technician = null;
                vm.getPagedDataAsync(vm.pageOptions.pageSize, vm.pageOptions.currentPage, vm.searchTextWork, null);
            }
        }
        function searchOrders() {
            if (vm.searchTextOrders !== '') {
                vm.workSuccess = true;
                vm.techniciansDisabled = true;
                vm.searchTextWork = '';
                vm.technicianId = 0;
                vm.technician = null;
                vm.getPagedDataAsync(vm.pageOptions.pageSize, vm.pageOptions.currentPage, null, vm.searchTextOrders);
            }
        }
        vm.getPagedDataAsync(vm.pageOptions.pageSize, vm.pageOptions.currentPage, vm.searchTextWork, vm.searchTextOrders);
    }])
    .factory('datacontext', ['$http', '$location', '$q', function ($http, $location, $q) {
        var url = $location.$$protocol + '://' + $location.$$host + ($location.$$port !== null ? ':' + $location.$$port : '');
        var datacontext = {
            url: url,
            getActivitiesListPaged: getActivitiesListPaged,
            validateOrderNumber: validateOrderNumber,
            getTechnicians: getTechnicians,
            saveActivity: saveActivity,
            newActivity: newActivity
        };

        function newActivity(another, scope) {
            var retval = {};
            retval.technician = another ? scope.activity.technician : '';
            retval.workDate = new Date();
            retval.ordersWorked = null;
            retval.workPerformed = null;
            retval.hoursWorked = null;
            retval.materialsUsed = null;
            return retval;
        }

        function getActivitiesListPaged(pageSize, currentPage, searchTextWork, searchTextOrders, technicianId) {
            var ps = pageSize === 0 ? 20 : (pageSize === null ? 10 : pageSize);
            var cp;
            switch (currentPage) {
                case null:
                    cp = 1;
                    break;
                case undefined:
                    cp = 1;
                    break;
                default:
                    cp = currentPage;
            }
            var stw = searchTextWork === null ? '' : (searchTextWork === undefined ? '' : searchTextWork);
            var sto = searchTextOrders === null ? '' : (searchTextOrders === undefined ? '' : searchTextOrders);

            return $http.get('/api/activities', ps, cp, stw, sto, technicianId);
        }

        function validateOrderNumber(orderNumber) {
            var deferred = $q.defer();
            $http.post(url + '/api/validOrderNumber', {orderNumber: orderNumber})
                .success(function (data) {
                    deferred.resolve({
                        result: data.result
                    });
                })
                .error(function (error) {
                    deferred.reject(error);
                });
            return deferred.promise;
        }

        function getTechnicians() {
            return $http.get(url + '/api/technicians');
        }

        function saveActivity(activity) {
            activity.workDate = moment(activity.workDate).format();
            var toSend = JSON.stringify(activity);
            return $http({url: datacontext.url + '/api/activities', method: 'POST', data: toSend});

        }

        return datacontext;
    }])
    .filter('sprintf', function () {
        function parse(str) {
            var args = [].slice.call(arguments, 1),
                i = 0;

            return str.replace(/%s/g, function () {
                return args[i++];
            });
        }

        return function (str) {
            return parse(str, arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
        };
    })
    .directive('rateOrCostValidator', ['$filter', function ($filter) {
        var pctPattern;
        return {
            require: 'ngModel',
            link: function ($scope, element, attrs, ngModel) {
                var len = attrs.validateRateOrCost ? attrs.validateRateOrCost : 2;
                var fString = $filter('sprintf')('^(\\d*([.]\\d{0,%s})?|^\\d([.]\\d{2})|^\\d([.]\\d{1})?)$', len);
                pctPattern = new RegExp(fString);
                ngModel.$validators.rateorcost = function (modelValue, viewValue) {
                    var value = modelValue || viewValue;
                    return pctPattern.test(value);
                };
            }
        };
    }])
    .directive('orderNumberValidator', ['datacontext', function (datacontext) {
        return {
            require: 'ngModel',
            link: function ($scope, element, attrs, ngModel) {
                ngModel.$asyncValidators.validOrderNumber = function (modelValue, viewValue) {
                    var val = modelValue || viewValue;
                    return datacontext.validateOrderNumber(val);
                };
            }
        };
    }]);
