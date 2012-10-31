//-------------------------------------------------
//イラブペイント　アップロード画像のレンダリング
//copyright 2010-2012 ABARS all rights reserved.
//-------------------------------------------------

function Rendering(){
	this.rendering=function(){
		var image_can=this.get_canvas();
		g_draw_primitive.fill_white(image_can);
		var context=image_can.getContext("2d")
		for(var layer=0;layer<LAYER_N;layer++){
			if(g_layer.get_layer_mode(layer)==LAYER_MODE_HIDDEN){
				continue;
			}
			context.drawImage(can_fixed[layer],0,0);
			context.drawImage(can_local[layer],0,0);
		}
	}
	
	this.get_canvas=function(){
		return document.getElementById("canvas_rendering");
	}
}