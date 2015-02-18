(function() {
    var maximumImageSize = 10485760,
        cropFirstLoad,
        croppedCanvas,
        src,
        allowedHeight = 73,
        allowedWidth = 73,
        setCropCoords = function(selection) {
            if (cropFirstLoad) {
                croppedCanvas = document.createElement('canvas');
                $('#crop-button').removeClass('hidden');
                cropFirstLoad = false;
            }

            var img = $('#crop-preview')[0];
            var ctx = croppedCanvas.getContext('2d');
            croppedCanvas.width = allowedWidth;
            croppedCanvas.height = allowedHeight;

            ctx.drawImage(img, selection.x, selection.y, selection.w, selection.h,
                0, 0, allowedWidth, allowedHeight);

            src = croppedCanvas.toDataURL();
        };

    $('#upload').click(function() {
        cropFirstLoad = true;
        $("#upload-input").trigger('click');
    });

    $('#crop-button').click(function() {
        $('#src').val(src);
        $('#avatar').attr('src', src);
    });

    $('#upload-input').change(function(e) {
        e.stopPropagation();
        e.preventDefault();
        var file = e.dataTransfer !== undefined ? e.dataTransfer.files[0] : e.target.files[0];

        if (file) {
            if (file.type.indexOf('image') <= -1) {
                e.preventDefault();
                alert("Позволено е качването само на картинки!");
                return false;
            }

            if (file.size > maximumImageSize) {
                e.preventDefault();
                alert("Файлът е прекалено голям!");
                return false;
            }

            if (file.size === 0) {
                e.preventDefault();
                alert("Файлът е празен!");
                return false;
            }

            $('#upload').hide();

            var minHeight = 73;
            var minWidth = 73;
            var FIXED_WIDTH = 555.0;
            var FIXED_HEIGHT = 400.0;

            var reader = new FileReader();
            reader.onload = (function() {
                return function(e) {
                    var image = new Image();
                    image.src = e.target.result;

                    image.onload = function() {
                        var canvas = document.createElement('canvas');
                        var ratio = 1;

                        if (image.width > FIXED_WIDTH || image.height > FIXED_HEIGHT) {
                            var widthRatio = FIXED_WIDTH / image.width;
                            var heightRatio = FIXED_HEIGHT / image.height;
                            ratio = Math.min(widthRatio, heightRatio);
                        }

                        canvas.width = image.width * ratio;
                        canvas.height = image.height * ratio;

                        var ctx = canvas.getContext('2d');
                        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

                        $('#crop-preview').attr('src', canvas.toDataURL());
                        $('#crop-preview').Jcrop({
                            bgColor: 'white',
                            bgOpacity: 0.4,
                            aspectRatio: 1,
                            minSize: [minWidth, minHeight],
                            setSelect: [canvas.width / 2 - allowedWidth / 2,
                                canvas.height / 2 - allowedHeight / 2,
                                canvas.width / 2 + allowedWidth / 2,
                                canvas.height / 2 + allowedHeight / 2
                            ],
                            onSelect: setCropCoords,
                            onChange: setCropCoords
                        });
                    };
                };
            }());
            reader.readAsDataURL(file);
        }
    });
}());
