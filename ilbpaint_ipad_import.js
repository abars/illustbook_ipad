//-------------------------------------------------
//イラブペイント　画像読込
//copyright 2010-2012 ABARS all rights reserved.
//-------------------------------------------------

var g_imported=false;

function Import(){

// JPEGのEXIFからOrientationのみを取得する
// http://www.egashira.jp/2013/03/image-resize-before-upload
    this.getOrientation=function(imgDataURL){
        var byteString = atob(imgDataURL.split(',')[1]);
        var orientaion = byteStringToOrientation(byteString);
        return orientaion;

        function byteStringToOrientation(img){
            var head = 0;
            var orientation;
            while (1){
                if (img.charCodeAt(head) == 255 & img.charCodeAt(head + 1) == 218) {break;}
                if (img.charCodeAt(head) == 255 & img.charCodeAt(head + 1) == 216) {
                    head += 2;
                }
                else {
                    var length = img.charCodeAt(head + 2) * 256 + img.charCodeAt(head + 3);
                    var endPoint = head + length + 2;
                    if (img.charCodeAt(head) == 255 & img.charCodeAt(head + 1) == 225) {
                        var segment = img.slice(head, endPoint);
                        var bigEndian = segment.charCodeAt(10) == 77;
                        if (bigEndian) {
                            var count = segment.charCodeAt(18) * 256 + segment.charCodeAt(19);
                        } else {
                            var count = segment.charCodeAt(18) + segment.charCodeAt(19) * 256;
                        }
                        for (i=0;i<count;i++){
                            var field = segment.slice(20 + 12 * i, 32 + 12 * i);
                            if ((bigEndian && field.charCodeAt(1) == 18) || (!bigEndian && field.charCodeAt(0) == 18)) {
                                orientation = bigEndian ? field.charCodeAt(9) : field.charCodeAt(8);
                            }
                        }
                        break;
                    }
                    head = endPoint;
                }
                if (head > img.length){break;}
            }
            return orientation;
        }
    }

    this.get_resized_size=function(image,orientation,use_mega_pix_image){
		var resize=new Object();
		resize.width=image.width;
		resize.height=image.height;

		if (orientation > 4 && use_mega_pix_image) {
			//MegaPixImageを使用する場合はEXIFのOrientationを考慮する必要がある
			var temp=resize.width;
			resize.width=resize.height;
			resize.height=temp;
		}

		var max_width=700;
		if(resize.width>=max_width){
			resize.height=Math.floor(resize.height*max_width/resize.width);
			resize.width=max_width;
		}

		//MegaPixImageの引数は元空間で渡す
		if (orientation > 4 && use_mega_pix_image) {
			resize.not_orien_width=resize.height;
			resize.not_orien_height=resize.width;
		}else{
			resize.not_orien_width=resize.width;
			resize.not_orien_height=resize.height;
		}

		return resize;
    }
}

var g_import=Import();

function ipad_import(){
	var f = document.getElementById("import").files[0];

	//Android2.3まではf.typeも定義されていないし、
	//FileReader APIも使えない
	if(typeof FileReader == "undefined"){
		alert("Android3未満ではFileReader APIが定義されていないため画像をアップロードできません。Firefoxをご利用下さい。");
		return;
	}

	//Android4.0の標準ブラウザはf.typeが定義されていない
	if(!(f.type)){
		alert("Androidの標準ブラウザはfile.typeが定義されていないため画像をアップロードできません。Chromeをご利用下さい。");
		return;
	}

	//iOSの場合はf.typeが使える
	if(f.type.match("image.*")){
		var image = new Image();
		var reader = new FileReader();
		reader.onload = function(evt) {
			var data=evt.target.result;
				
			//EXIFのOrientationを取得
			var orientation=1;
			if (data.split(',')[0].match('jpeg')) {
				orientation=g_import.getOrientation(data) || 1;
			}

			//画像を読込
			image.onload = function() {
				//iOS6で1024x1024[px]を超える画像のアスペクト比が不正になるので
				//MegaPixImageライブラリを使用してアスペクトを補正する
				var use_mega_pix_image=(image.width*image.height>=1024*1024);

				//リサイズ後のサイズを決定する
				var resize=g_import.get_resized_size(image,orientation,use_mega_pix_image);

				//キャンバスを確保
				g_undo_redo.push_all();
				g_layer.change_canvas_size(resize);

				//巨大画像はMegaPixImageライブラリを使用する
				if(use_mega_pix_image){
					var mpImg = new MegaPixImage(image);
					mpImg.render(can_fixed[0], { width: resize.not_orien_width, height: resize.not_orien_height, orientation:orientation});
				}else{
					var context=can_fixed[0].getContext("2d");
					context.drawImage(image, 0, 0, resize.width , resize.height);
				}

				//画像を反映
				g_buffer.undo_redo_exec_on_local_tool();
			}
			image.src = data;
		}
		reader.readAsDataURL(f);
		g_imported=true;
		g_upload.set_illust_exist();
	}
}

function ipad_import_from_url(url){
	var image = new Image();
	image.onload = function() {
		g_undo_redo.push_all();
		g_layer.change_canvas_size(image);
		var context=can_fixed[0].getContext("2d");
		context.drawImage(image, 0, 0);
		g_buffer.undo_redo_exec_on_local_tool();
		g_upload.set_illust_exist();
	}
	image.src = "./img/"+url+".jpg";
}