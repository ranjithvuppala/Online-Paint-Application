function fileUploadService($http,$interpolate){
    var link = $interpolate('/api/image/');

    return {
        saveData: saveData
    };

    function saveData(FormData){
        return $http.post(link()+'upload',FormData, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        })

    }
}
