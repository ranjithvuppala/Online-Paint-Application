angular.module('app', ['ngRoute'])
    .factory('fileUploadService',fileUploadService)
    .component('paint', {
        templateUrl: 'app/paint/paint.html',
        controller: PaintController,
        controllerAs: 'vm'
    })
    .config(appConfig)
    .run(run);

function run(){

    // while closing or refreshing the page to get alert message to save if not saved, chrome has default msg but for other browsers we can write our message

    window.onbeforeunload = function Ranjith(){
        return "message not saved";
    }


}