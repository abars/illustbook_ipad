//-------------------------------------------------
//イラブペイント　レイヤー管理
//copyright 2010-2012 ABARS all rights reserved.
//-------------------------------------------------

var LAYER_N=2;

function LayerMove(){
	this._layer;
	this._image_data=null;
	this._sx;
	this._sy;

	this.is_move_mode=function(){
		return g_tool.get_tool()=="hand" && !(g_chat.is_chat_mode());
	}
	
	this.on_mouse_down=function(x,y,layer){
		g_undo_redo.push();
		var context=can_fixed[layer].getContext("2d");
		this._image_data = context.getImageData(0,0,can_fixed[layer].width, can_fixed[layer].height);
		this._layer=layer;
		this._sx=x;
		this._sy=y;
	}
	
	this.on_mouse_move=function(x,y){
		if(this._image_data==null){
			return;
		}
		var context=can_fixed[this._layer].getContext("2d");
		context.clearRect(0,0,can_fixed[this._layer].width, can_fixed[this._layer].height);
		can_fixed[this._layer].getContext("2d").putImageData(this._image_data,x-this._sx,y-this._sy);
		g_buffer.undo_redo_exec_on_local_tool();
	}
	
	this.on_mouse_up=function(){
		this._image_data=null;
	}
}

