//-------------------------------------------------
//イラブペイント　premultaへの変換
//copyright 2010-2012 ABARS all rights reserved.
//-------------------------------------------------

//Androidの標準ブラウザでは、4.0まで、putImageDataが乗算済アルファとして扱われるというバグがある

function is_android_bug_exist() {
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  var imageData;
  var pixelArray;
 
  canvas.width = canvas.height = 1;
  imageData = ctx.createImageData(1, 1);
  pixelArray = imageData.data;
 
  pixelArray[0] = pixelArray[3] = 128;
 
  ctx.putImageData(imageData, 0, 0);
  imageData = ctx.getImageData(0, 0, 1, 1);
  pixelArray = imageData.data;
 
  return (pixelArray[0] === 255);
}

function android_premulta_convert(image_data){
	if(!is_android_bug_exist()){
		return;
	}
	var data=image_data.data;
	for(var i=0;i<data.length;i+=4){
		var a=data[i+3];
		data[i+0]=data[i+0]*a/256;
		data[i+1]=data[i+1]*a/256;
		data[i+2]=data[i+2]*a/256;
	}
}

function android_is_default_browser(){
  
}