function appConfig($routeProvider) {
    $routeProvider
        .when('/', { template: '<paint></paint>' })

        .otherwise({
            redirectTo: '/'
        })
}