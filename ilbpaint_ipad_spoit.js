//-------------------------------------------------
//イラブペイント　スポイト
//copyright 2010-2012 ABARS all rights reserved.
//-------------------------------------------------

function Spoit(){
	this._hold=false;
	
	this.init=function(){
	}
	
	this.is_spoit_mode=function(){
		return g_tool.get_tool()=="spoit";
	}
	
	this.on_mouse_move=function(x,y){
		if(this._hold){
			this._spoit_core(x,y);
		}
	}
	
	this.on_mouse_down=function(x,y){
		this._hold=true;
		this._spoit_core(x,y);
	}
	
	this.on_mouse_up=function(){
		this._hold=false;
	}
	
	this._spoit_core=function(x,y){
		var color=g_draw_canvas.get_color_of_canvas(x,y);
		g_color_circle.set_color(color);
	}
}
