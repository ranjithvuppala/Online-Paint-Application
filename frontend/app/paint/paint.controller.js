function PaintController(fileUploadService) {
    var vm = this;

    vm.$onInit = $onInit;
    vm.setOptions = setOptions;
    vm.setCanvas= setCanvas;
    vm.undo=undo;
    vm.redo=redo;
    vm.clear = clear;
    vm.ChangeLineWidth=ChangeLineWidth;
    vm.changeBrushColor = changeBrushColor;
    vm.undoCacheEmpty=undoCacheEmpty;
    vm.redoCacheEmpty=redoCacheEmpty;
    vm.add=add;
    vm.downloadImage = downloadImage;
    vm.saveImage = saveImage;
    vm.getImage = getImage;
    vm.undoCache = [];
    vm.redoCache = [];
    var isTouch = !!('ontouchstart' in window);
    var PAINT_START = isTouch ? 'touchstart' : 'mousedown';
    var PAINT_MOVE = isTouch ? 'touchmove' : 'mousemove';
    var PAINT_END = isTouch ? 'touchend' : 'mouseup';
    function $onInit() {
        vm.options={}; // variable declared as empty
        vm.setOptions();
    }

    // back ground has total image but in fore ground we have what is drawn presently that is canvas temp.
    // The diff is shown by editing in paint.html file.
    // we draw on temp canvas and is saved into permanent canvas
    // line width is pencil width
    // variables are declared in set options also about styling

    function setOptions(){
        vm.options.width = 1080; // canvas width
        vm.options.height = 600;
        vm.options.backgroundColor = '#fff';
        vm.options.color ='#000';
        vm.options.opacity = 0.4;
        vm.options.lineWidth = 10;
        vm.setCanvas();
    }

    function setCanvas(){
        vm.canvas = document.getElementById('CanvasMain'); // assigning characterstics of id Canavsmain from controller related html page
        vm.canvasTmp = document.getElementById('CanvasTmp');
        vm.ctx = vm.canvas.getContext('2d'); // canvas is a 3d structure and is rendering to 2d structure
        vm.ctxTmp = vm.canvasTmp.getContext('2d');

        // points which are drawn with the mouse are taken into consideration

        vm.point = {
            x: 0,
            y: 0
        };
        vm.ppts = []; // to collect all the points and initial no points and assigned empty.
        //set canvas size
        vm.canvas.width = vm.canvasTmp.width = vm.options.width;
        vm.canvas.height = vm.canvasTmp.height = vm.options.height;

        //set context style
        vm.ctx.fillStyle = vm.options.backgroundColor; // to fill with which color
        vm.ctx.fillRect(0, 0, vm.canvas.width, vm.canvas.height); // fill wth assigned color
        vm.ctxTmp.globalAlpha = vm.options.opacity;
        vm.ctxTmp.lineJoin = vm.ctxTmp.lineCap = 'round'; // what we draw between points will be in round on background
        vm.ctxTmp.lineWidth = vm.options.lineWidth;
        vm.ctxTmp.strokeStyle = vm.options.color; // stroke style given black initially to draw.
        vm.getImage(); // to get the saved image from back end

        // if image is set then image should be pushed to undo cache to display it later if nothing is there then white sheet is pushed to undo cache to get display if it gets run
        vm.undoCache.push(vm.ctx.getImageData(0, 0, vm.canvasTmp.width, vm.canvasTmp.height));

        initListeners();
    }

    // event listners are helpful to detect the mouse moves

    // adding event listners to canvas tmp from paint start to end.
     function initListeners() {
        vm.canvasTmp.addEventListener(PAINT_START, StartTmpImage, false);
        vm.canvasTmp.addEventListener(PAINT_END, copyTmpImage, false);

        if (!isTouch) // checking whether the rendering browser is touch device or not
        {
            var MOUSE_DOWN;

            document.body.addEventListener('mousedown', mousedown);
            document.body.addEventListener('mouseup', mouseup);
            vm.canvasTmp.addEventListener('mouseenter', mouseenter);
            vm.canvasTmp.addEventListener('mouseleave', mouseleave);
        }

        function mousedown() {
            MOUSE_DOWN = true;
        }

        function mouseup() {
            MOUSE_DOWN = false;
        }

         function mouseenter(e) {
             if (MOUSE_DOWN) {
                 StartTmpImage(e); // calls the function when we start drawing
             }
         }

         function mouseleave(e) {
             if (MOUSE_DOWN) {
                 copyTmpImage(e); // calls the function when the paint get ends and is to save
             }
         }

    }


    function StartTmpImage(e) {
        e.preventDefault();
        vm.canvasTmp.addEventListener(PAINT_MOVE, paint, false); // add new event listener to see how it moves

        setPointFromEvent(vm.point, e); // loads the points which are used in drawing if it touches

        // pushes all points to ppts and then calls paint function.
        vm.ppts.push({
            x: vm.point.x,
            y: vm.point.y
        });
        vm.ppts.push({
            x: vm.point.x,
            y: vm.point.y
        });

        paint();
    }

    // when ever we draw some thing then redo should be empty, whenever we do undo then only we have redo.
    // when we start to draw in the middle we dont have redo unless we undo anything
    function copyTmpImage() {
        vm.redoCache = [];
        vm.canvasTmp.removeEventListener(PAINT_MOVE, paint, false); // remove the listner as we have stopped drawing
        vm.ctx.drawImage(vm.canvasTmp, 0, 0); // draws the canvas tmp image to background(main tmp)
        vm.ctxTmp.clearRect(0, 0, vm.canvasTmp.width, vm.canvasTmp.height); // clears the temp image after it get stores.
        vm.ppts = [];
        vm.undoCache.push(vm.ctx.getImageData(0, 0, vm.canvasTmp.width, vm.canvasTmp.height));
        // image saved in undo to get image if we press undo.
    }



    // purpose of paint function is to check which points are used while drawing in the canvas
    // point will be one pixel but as we mentioned line width is 10 and it should develop the width and to prepare width this would be helpful
    function paint(e) {
        if (e) {
            e.preventDefault();
            setPointFromEvent(vm.point, e);
        }

        // Saving all the points in an array
        vm.ppts.push({
            x: vm.point.x,
            y: vm.point.y
        });
        // Tmp canvas is always cleared up before drawing.
        vm.ctxTmp.clearRect(0, 0, vm.canvasTmp.width, vm.canvasTmp.height);
        vm.ctxTmp.beginPath();
        vm.ctxTmp.moveTo(vm.ppts[0].x, vm.ppts[0].y);

        for (var i = 1; i < vm.ppts.length - 2; i++) {
            var c = (vm.ppts[i].x + vm.ppts[i + 1].x) / 2;
            var d = (vm.ppts[i].y + vm.ppts[i + 1].y) / 2;
            vm.ctxTmp.quadraticCurveTo(vm.ppts[i].x, vm.ppts[i].y, c, d);
        }

        // For the last 2 points
        vm.ctxTmp.quadraticCurveTo(
            vm.ppts[i].x,
            vm.ppts[i].y,
            vm.ppts[i + 1].x,
            vm.ppts[i + 1].y
        );
        vm.ctxTmp.stroke();
    }

    function setPointFromEvent(point, e) {
        if (isTouch) {
            point.x = e.changedTouches[0].pageX - getOffset(e.target).left;
            point.y = e.changedTouches[0].pageY - getOffset(e.target).top;
        } else {
            point.x = e.offsetX !== undefined ? e.offsetX : e.layerX;
            point.y = e.offsetY !== undefined ? e.offsetY : e.layerY;
        }
    }


    function undo(){
        if (vm.undoCache.length > 1) {
            vm.redoCache.push(vm.undoCache.pop());
            vm.ctx.putImageData(vm.undoCache[vm.undoCache.length-1],0,0);
        }

    }

    function redo(){
        if(vm.redoCache.length>0){
            vm.undoCache.push(vm.redoCache.pop());
            vm.ctx.putImageData(vm.undoCache[vm.undoCache.length-1],0,0);
        }
    }

    function clear(){
        vm.redoCache = [];
        var b = vm.undoCache[0];
        vm.undoCache = [b];
        vm.ctx.putImageData(vm.undoCache[vm.undoCache.length-1],0,0);
    }

    function ChangeLineWidth(number){
        vm.ctxTmp.lineWidth = number;
    }

    function changeBrushColor(value){
        vm.ctxTmp.strokeStyle = value;
    }

    function undoCacheEmpty(){
        return vm.undoCache.length < 2;
    }

    function redoCacheEmpty(){
        return vm.redoCache.length < 1;
    }

    function add(){
        var f = document.getElementById('file').files[0];
        var r = new FileReader();
        r.onload = function(e){
            var image = new Image();
            image.onload = function(){
                var hRatio = vm.canvas.width / image.width    ;
                var vRatio = vm.canvas.height / image.height  ;
                var ratio  = Math.min ( hRatio, vRatio );
                var centerShift_x = ( vm.canvas.width - image.width*ratio ) / 2;
                var centerShift_y = ( vm.canvas.height - image.height*ratio ) / 2;
                vm.ctxTmp.drawImage(image, 0,0, image.width, image.height, centerShift_x,centerShift_y,image.width*ratio, image.height*ratio);
                copyTmpImage();
            };
            image.src = e.target.result;
        };
        r.readAsDataURL(f);

    }


    function downloadImage(){
         var image =  vm.canvas.toDataURL();
        var imageElement = document.getElementById('download');
        imageElement.href = image;
        imageElement.download = 'image.jpeg';

    }

    function saveImage(){
        var dataURL = vm.canvas.toDataURL();
        var blob = dataURItoBlob(dataURL);
        var fd = new FormData(document.forms[0]);
        fd.append("canvasImage",blob);
        return fileUploadService.saveData(fd)
            .then(function test(){
                alert("saved image successfully")
            });
    }


    function dataURItoBlob(dataURI) {
        var byteString;
        if (dataURI.split(',')[0].indexOf('base64') >= 0)
            byteString = atob(dataURI.split(',')[1]);
        else
            byteString = unescape(dataURI.split(',')[1]);
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        var ia = new Uint8Array(byteString.length);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        return new Blob([ia], {type:mimeString});
    }

    function getImage(){
        var image = new Image();
        image.onload = function(){
            vm.ctx.drawImage(image, 0,0);
            copyTmpImage();
        };
        image.src = 'http://localhost:8080/api/image/download';
        image.crossOrigin = "Anonymous";
    }


}
