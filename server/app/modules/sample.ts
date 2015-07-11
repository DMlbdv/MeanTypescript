/**
 * Created by Michael on 7/8/2015.
 */
/// <reference path="../../../types/angularjs/angular.d.ts"/>
/// <reference path="../../../types/angularjs/angular-route.d.ts"/>
/// <reference path="../../../types/lib.d.ts"/>
/// <reference path="../../../types/moment/moment.d.ts"/>
/// <reference path="../../../types/toastr/toastr.d.ts"/>

/*interface MyModule {
 name: string;
 dependencies: string[];
 }
 var myModules:MyModule[] = [{name: 'myApp.controllers', dependencies: []}, {
 name: 'myApp.directives',
 dependencies: []
 }, {name: 'myApp.filters', dependencies: []}, {name: 'myApp.services', dependencies: []}];
 var toPush:string[] = [];
 myModules.forEach((myModule)=>(angular.module(myModule.name, myModule.dependencies), toPush.push(myModule.name)));*/
var modules:string[] = ['ngRoute', 'ngSanitize', 'ngAnimate', 'ngCookies', 'ngMessages', 'ui.bootstrap', 'ui.grid'];
//modules.concat(toPush);

angular.module('myApp', modules)
    .config(['$routeProvider', '$locationProvider', '$compileProvider', function ($routeProvider:ng.route.IRouteProvider, $locationProvider:ng.ILocationProvider, $compileProvider:ng.ICompileProvider) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel|content|geo|http?):/);
        var html5History:boolean = !!(window.history && window.history.pushState);		//actual check
        //android / browser sniffer 2nd check
        var ua = navigator.userAgent;
        if (ua.indexOf("PhantomJS") >= 0) {		//karma - setting a global variable in a different file isn't seeming to work / be included and with html5 mode, we get new 1.3.0-rc.0 $location:nobase error..
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
    }]);


module myApp {

    // *** Modules need to be populated to be correctly defined, otherwise they will give warnings. null fixes this ***/
    export module controllers {
        null;
    }
    export module directives {
        null;
    }
    export module filters {
        null;
    }
    export module services {
        null;
    }

    export interface IController {
    }
    export interface IDirective {
        require: string;
        link($scope:ng.IScope, element:JQuery, attrs:ng.IAttributes, ngModel:ng.INgModelController): any;
    }
    export interface IFilter {
        filter (input:any, ...args:any[]): any;
    }
    export interface IService {
    }

    /**
     * Register new controller.
     *
     * @param className
     * @param services
     */
    export function registerController(name:string, func:any) {
        var controller = func;
        //services.push(myApp[className]);
        angular.module('myApp').controller(name, controller);
    }

    /**
     * Register new filter.
     *
     * @param className
     * @param services
     */
    export function registerFilter(name:string, func:any) {
        /*        var filter = className.toLowerCase();
         services.push(() => (new myApp[className]()).filter);*/
        angular.module('myApp').filter(name, func);
    }

    /**
     * Register new directive.
     *
     * @param className
     * @param services
     */
    export function registerDirective(name:string, func:any) {
        /*        var directive = className[0].toLowerCase() + className.slice(1);
         services.push(() => new myApp[className]());*/
        angular.module('myApp').directive(name, func);
    }

    /**
     * Register new service.
     *
     * @param className
     * @param services
     */
    export function registerService(name:string, func:any) {
        /*        var service = className[0].toLowerCase() + className.slice(1);
         services.push(() => new myApp[className]());*/
        angular.module('myApp').factory(name, func);
    }
}
module myApp.services {
    export class datacontext implements IService {
        static $inject = ['$http', '$location', '$q'];
        constructor($http, $location, $q) {
            var url = $location.$$protocol + '://' + $location.$$host + ($location.$$port !== null ? ':' + $location.$$port : '');
            var datacontext = {
                url: url,
                getActivitiesListPaged: getActivitiesListPaged,
                validateOrderNumber: validateOrderNumber,
                getTechnicians: getTechnicians,
                saveActivity: saveActivity,
                newActivity: newActivity,
                emptyOrderNumber: emptyOrderNumber
            };

            function emptyOrderNumber() {
                var deferred = $q.defer();
                setTimeout(function () {
                    deferred.resolve(true);
                }, 1000);
                return deferred.promise;
            }

            function newActivity(another:boolean, scope:myApp.controllers.AddActivityCtrl) {
                var retval:myApp.controllers.IActivity = new myApp.controllers.Activity();
                retval.technician = another ? scope.activity.technician : '';
                retval.workDate = new Date();
                retval.ordersWorked = '';
                retval.workPerformed = '';
                retval.hoursWorked = 0;
                retval.materialsUsed = '';
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
                $http.post(url + '/api/validordernumber', {orderNumber: orderNumber})
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
        }

        /*    .factory('datacontext', ['$http', '$location', '$q', function ($http, $location, $q) {
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
         }])*/
    }
    myApp.registerService('datacontext', datacontext);
}

module myApp.filters {
    function parse(str:string, ...args:any[]) {
        var i = 0;
        return str.replace(/%s/g, function () {
            return args[i++];
        });
    }

    export class sprintf {
        constructor() {
            return function (str:string, ...args:any[]) {
                return parse(str, args);
            }
        }
    }
    myApp.registerFilter('sprintf', sprintf);
}

module myApp.controllers {
    interface MyRoutes {
        url: string;
        description: string;
    }

    export interface IActivity {
        technician: string;
        workDate: Date;
        ordersWorked: string;
        workPerformed: string;
        materialsUsed: string;
        hoursWorked: number;
    }

    export class Activity implements IActivity {
        technician:string;
        workDate:Date;
        ordersWorked:string;
        workPerformed:string;
        materialsUsed:string;
        hoursWorked:number;
    }

    export interface ITechnician {
        id : string;
        firstName : string;
        lastName : string;
        email : string;
        employeeId : string;
        isActive : boolean;

    }

    export class RouteCtrl implements IController {
        static $inject = ['$route'];
        private routes:MyRoutes[];

        constructor($route:ng.route.IRouteService) {
            var vm:any = this;
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
    }

    export class AddActivityCtrl implements IController {
        static $inject = ['datacontext'];
        private technicians:string[];
        private loading:boolean;
        activity:IActivity;
        private minDate:any;
        private maxDate:any;
        private dateOptions:any;
        private reset:(event:any, another:boolean)=> void;
        private save:(event:any, another:boolean)=> void;
        private another:boolean;
        private format:string;

        constructor(datacontext) {
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
                    vm.activity = datacontext.newActivity(another, vm);
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
                            vm.reset(event, false);
                        }
                    }
                });
            };
            vm.format = 'dd-MMM-yy';
        }

        /*    .controller('AddActivityCtrl', ['datacontext', function (datacontext) {
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
         }])*/
    }

    export class ActivitiesCtrl implements IController {
        private loading:boolean;
        private pageOptions:any;
        private totalServerItems:number;
        private activities:IActivity[];
        private technicians:string[];
        private searchTextWork:string;
        private searchTextOrders:string;
        private orderSuccess:boolean;
        private workSuccess:boolean;
        private technician:string;
        private technicianId:number;
        private clearWork:(event:any)=> void;
        private clearOrder:(event:any)=> void;
        private clearTechnician:(event:any)=> void;
        private onSelect:(item:any)=> void;
        private techniciansDisabled:boolean;
        private activitiesOptions:any;
        private getPagedDataAsync:(pageSize:number, page:number, searchTextWork:string, searchOrders:string, technicianId:number)=>void;


        static $inject = ['datacontext'];

        constructor(private datacontext) {
            var vm = this;
            vm.loading = false;
            vm.pageOptions = {
                pageSizes: [10, 20, 50],
                pageSize: 20,
                totalServerItems: 0,
                currentPage: 1
            };
            vm.pageOptions.pageSize = 10;
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
            vm.getPagedDataAsync = function (pageSize, page, searchTextWork, searchTextOrders, technicianId) {
                var textWork = searchTextWork || vm.searchTextWork;
                var textOrders = searchTextOrders || vm.searchTextOrders;
                var id = technicianId || vm.technicianId;
                datacontext.getActivitiesListPaged(pageSize, page, textWork, textOrders, id)
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
            vm.getPagedDataAsync(vm.pageOptions.pageSize, vm.pageOptions.currentPage, vm.searchTextWork, vm.searchTextOrders, null);

        }

        /*    .controller('ActivitiesCtrl', ['datacontext', function (datacontext) {
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
         }]) */
    }

    myApp.registerController('RouteCtrl', RouteCtrl);
    myApp.registerController('AddActivityCtrl', AddActivityCtrl);
    myApp.registerController('ActivitiesCtr', ActivitiesCtrl);
}

module myApp.directives {
    export class orderNumberValidator implements IDirective {
        static $inject = ['datacontext'];
        require:string;
        link:(p1:any, p2:any, p3:any, p4:any)=> any;
        constructor(private datacontext) {
            this.require = 'ngModel';
            this.link = function (scope, elem, attr, ngModel) {
                ngModel.$asyncValidators.validOrderNumber = function (modelValue, viewValue) {
                    var val = modelValue || viewValue;
                    if (val.length === 6) {
                        return this.datacontext.validateOrderNumber(val);
                    } else if (val === '0') {
                        return datacontext.emptyOrderNumber();
                    }

                };
            }
            return this;
        }
    }

    interface IMyAttributes extends ng.IAttributes {
        validateRateOrCost: number;
    }
    interface IMyValidators extends ng.IModelValidators {
        rateorcost:any
    }
    interface IMyNgModelController extends ng.INgModelController {
        $validators: IMyValidators;
    }

    interface IRateOrCostValidator {
        require:string;
        link:(scope:any, element:any, attrs:any, ngModel:any)=>any;
    }
    export class rateOrCostValidator implements IRateOrCostValidator {
        require:string;
        link:(p1:any, p2:any, p3:any, p4:any)=> any;
        static $inject = ['$filter'];
        constructor(private $filter) {
            this.require = 'ngModel';
            this.link = function ($scope, element, attrs, ngModel) {
                var pctPattern;
                var len = attrs.validateRateOrCost ? attrs.validateRateOrCost : 2;
                var fString = this.$filter('sprintf')('^(\\d*([.]\\d{0,%s})?|^\\d([.]\\d{2})|^\\d([.]\\d{1})?)$', len);
                pctPattern = new RegExp(fString);
                ngModel.$validators.rateorcost = function (modelValue, viewValue) {
                    var value = modelValue || viewValue;
                    return pctPattern.test(value);
                };
            };
            return this;
        }
    }
    myApp.registerDirective('orderNumberValidator', orderNumberValidator);
    myApp.registerDirective('rateOrCostValidator', rateOrCostValidator);
}





