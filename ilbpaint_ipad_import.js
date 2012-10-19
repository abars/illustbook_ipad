//-------------------------------------------------
//イラブペイント　画像読込
//copyright 2010-2012 ABARS all rights reserved.
//-------------------------------------------------

function Import(){
this._update_canvas_size=function(canvas,image){
	canvas.width=image.width;
	canvas.height=image.height;
}

this.change_canvas_size=function(image){
	for(var layer=0;layer<LAYER_N;layer++){
		this._update_canvas_size(can_fixed[layer],image);
		this._update_canvas_size(can_local[layer],image);
		this._update_canvas_size(can_drawing[layer],image);
	}
	this._update_canvas_size(document.getElementById("canvas_work"),image);
	this._update_canvas_size(document.getElementById("canvas_rendering"),image);
	document.getElementById("canvas_div").style.width=image.width+64;
	document.getElementById("canvas_div").style.height=image.height+64;
}
}

var g_imported=false;

function ipad_import(){
	var f = document.getElementById("import").files[0];
	if(f.type.match("image.*")){
		var reader = new FileReader();
		var image = new Image();
		reader.onload = function(evt) {
			image.onload = function() {
				g_undo_redo.push();
				g_import.change_canvas_size(image);
				
				var context=can_local[0].getContext("2d");
				context.drawImage(image, 0, 0);
			}
			image.src = evt.target.result;
		}
		reader.readAsDataURL(f);
		g_imported=true;
	}
}