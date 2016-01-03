//-------------------------------------------------
//イラブペイント　ボトムツール
//copyright 2010-2012 ABARS all rights reserved.
//-------------------------------------------------

var SUB_TOOL_NONE=0;
var SUB_TOOL_COLOR=1;
var SUB_TOOL_LAYER=2;

function BottomTool(){
	this._canvas_width;
	this._canvas_height;

	this._size_slider_x=4;
	this._size_slider_y=2+1;
	this._size_slider_width=150;
	this._size_slider_height=32-8;

	this._alpha_slider_x=this._size_slider_x+this._size_slider_width+4;
	this._alpha_slider_y=2-1;
	this._alpha_slider_width=150;
	this._alpha_slider_height=32-4;
	
	this._tool=0;
	
	this._pen_size=new Array(10,70,70,70);
	this._alpha=new Array(100,100,100,100);
	
	this._sub_tool=SUB_TOOL_NONE;
	
	this.init=function(){
		var canvas=document.getElementById("pen_tools");
		var context=canvas.getContext("2d");

		this._canvas_width=canvas.width;
		this._canvas_height=canvas.height;
		
		this._create(context);

		if(ipad_is_pc()){
			document.getElementById("pen_tools").addEventListener("mousedown", ipad_bottom_tool_on_mouse_down,false);
			document.getElementById("pen_tools").addEventListener("mousemove", ipad_bottom_tool_on_mouse_move,false);
			document.getElementById("bottom_tool").addEventListener("mouseup", ipad_bottom_tool_on_mouse_up,false);
			document.getElementById("toolmenu").addEventListener("mouseup", ipad_bottom_tool_on_mouse_up,false);
		}
		
		document.getElementById("pen_tools").addEventListener("touchstart", ipad_bottom_tool_on_mouse_down,false);
		document.getElementById("pen_tools").addEventListener("touchmove", ipad_bottom_tool_on_mouse_move,false);
		document.getElementById("bottom_tool").addEventListener("touchend", ipad_bottom_tool_on_mouse_up,false);
		document.getElementById("toolmenu").addEventListener("touchend", ipad_bottom_tool_on_mouse_up,false);
	}

	this._UI_COLOR="#ffffff";//5f5fef";
	this._UI_COLOR_BG="#ffffff";//c7e5f9";
	this._CIRCLE_COLOR="#292929";

	this._create=function(context){
		context.save();
		for(x=0;x<this._alpha_slider_width;x++){
			var h=this._alpha_slider_height*0.75;
			context.fillStyle=this._UI_COLOR_BG;
			context.globalAlpha=1.0*x/this._alpha_slider_width;
			context.fillRect(x+this._alpha_slider_x,(this._alpha_slider_height-h)/2,1,h);
		}
		context.restore();

		var h=this._alpha_slider_height*0.75;
		context.strokeStyle=this._UI_COLOR_BG;
		context.rect(this._alpha_slider_x,(this._alpha_slider_height-h)/2,this._alpha_slider_width,h);
		context.stroke();

		this._alpha_box=context.getImageData(this._alpha_slider_x,0,this._alpha_slider_width,this._alpha_slider_height);
		
		context.save();
		for(x=0;x<this._size_slider_width;x++){
			var h=this._get_size_core(x);
			context.fillStyle=this._UI_COLOR_BG;
			context.fillRect(x+this._size_slider_x,(this._size_slider_height-h)/2,1,h);
		}
		context.restore();
		
		this._size_box=context.getImageData(this._size_slider_x,0,this._size_slider_width,this._size_slider_height);

		android_premulta_convert(this._alpha_box);
		android_premulta_convert(this._size_box);
	}
	
//-------------------------------------------------
//描画
//-------------------------------------------------

	this._draw=function(context){
		context.strokeStyle="#000000";
		context.fillStyle="#000000";
		context.globalAlpha=1.0;

		context.clearRect(0,0,this._canvas_width,this._canvas_height);
		this._draw_slider(context,this._size_slider_x,this._size_slider_y,this._size_slider_width,this._size_slider_height,this._pen_size[this._tool]);
this._draw_alpha(context,this._alpha_slider_x,this._alpha_slider_y,this._alpha_slider_width,this._alpha_slider_height,this._alpha[this._tool]*this._alpha_slider_width/100);
	}
	
//-------------------------------------------------
//ペンサイズとα
//-------------------------------------------------
	
	this._get_size_core=function(size){
		var r=size/16;
		r=r*r;
		return Math.floor(r)+1;
	}
	
	this.get_size=function(){
		return this._get_size_core(this._pen_size[this._tool]);
	}

	this.get_alpha=function(){
		//if(g_tool.get_tool()=="eraser"){
		//	return 1.0;
		//}
		return this._alpha[this._tool]*1.0/100;
	}

//-------------------------------------------------
//スライダー
//-------------------------------------------------

	this._draw_slider=function(context,x,y,w,h,cursor){
		/*
		var a=1.0;
		y+=Math.floor((h-h*a)/2);
		h=Math.floor(h*a);
	
		context.beginPath();
		context.strokeStyle="#5f5fef";
		context.fillStyle="#c7e5f9";
		context.moveTo(x,y+h);
		context.lineTo(x+w,y);
		context.lineTo(x+w,y+h);
		context.lineTo(x,y+h);
		context.fill();
		context.closePath();
		context.stroke();
		*/

		context.putImageData(this._size_box,this._size_slider_x,this._size_slider_y);

		context.beginPath();
		context.strokeStyle=this._CIRCLE_COLOR;//"#5f5fef";
		var s=this.get_size()/2;
		context.arc(x+cursor,y+h/2,s, 0, Math.PI*2, false);
		context.closePath();
		context.stroke();
	}
	
	this._draw_alpha=function(context,x,y,w,h,cursor){
		var a=0.75;
		y+=(h-h*a)/2;
		h=h*a;
		context.putImageData(this._alpha_box,this._alpha_slider_x,this._alpha_slider_y);
		context.beginPath();
		context.strokeStyle=this._UI_COLOR;//"#5f5fef";
		context.rect(x-2+cursor,y-2,4,h+4);
		context.closePath();
		context.stroke();
	}

//-------------------------------------------------
//イベント
//-------------------------------------------------

	this._is_hold=false;

	this._is_range=function(x,y,tx,ty,tw,th){
		var margin=4;
		if(x>=tx-margin && x<tx+tw+margin){
			if(y>=ty-margin && y<ty+th+margin){
				return true;
			}
		}
		return false;
	}
	
	this.on_mouse_down=function(x,y){
		this.on_mouse_down_core(x,y,true);
	}
	
	this.on_mouse_down_core=function(x,y,click){
		x=this._get_mx(x);
		y=this._get_my(y);
		
		var canvas=document.getElementById("pen_tools");
		var context=canvas.getContext("2d");

		if(this._focus==FOCUS_SIZE || (click && this._is_range(x,y,this._size_slider_x,this._size_slider_y,this._size_slider_width,this._size_slider_height))){
			this._pen_size[this._tool]=x-this._size_slider_x;
			if(this._pen_size[this._tool]<0) this._pen_size[this._tool]=0;
			if(this._pen_size[this._tool]>this._size_slider_width) this._pen_size[this._tool]=this._size_slider_width;
			this._draw(context);
			this._focus=FOCUS_SIZE;
		}
		
		if(this._focus==FOCUS_ALPHA || (click && this._is_range(x,y,this._alpha_slider_x,this._alpha_slider_y,this._alpha_slider_width,this._alpha_slider_height))){
			this._alpha[this._tool]=Math.floor((x-this._alpha_slider_x)*100/this._alpha_slider_width);
			if(this._alpha[this._tool]<0) this._alpha[this._tool]=0;
			if(this._alpha[this._tool]>100) this._alpha[this._tool]=100;
			this._draw(context);
			this._focus=FOCUS_ALPHA;
		}

		this._is_hold=true;
	}

	this.click_layer_button=function(){
		if(this._sub_tool==SUB_TOOL_LAYER){
			this._sub_tool=SUB_TOOL_NONE;
		}else{
			this._sub_tool=SUB_TOOL_LAYER;
		}
		this._update_sub_tool();
	}

	this.click_color_button=function(){
		if(this._sub_tool==SUB_TOOL_COLOR){
			this._sub_tool=SUB_TOOL_NONE;
		}else{
			this._sub_tool=SUB_TOOL_COLOR;
		}
		this._update_sub_tool();
	}
	
	this._update_sub_tool=function(){
		if(this._sub_tool!=SUB_TOOL_NONE){
			document.getElementById("palette_tool").style.display="block";
		}else{
			document.getElementById("palette_tool").style.display="none";
		}
		var tool_height=document.getElementById("bottom_tool").clientHeight;
		document.getElementById("palette_tool").style.bottom=tool_height+"px";
		if(this._sub_tool==SUB_TOOL_COLOR){
			document.getElementById("palette_tool_color").style.display="block";
		}else{
			document.getElementById("palette_tool_color").style.display="none";
		}
		if(this._sub_tool==SUB_TOOL_LAYER){
			document.getElementById("palette_tool_layer").style.display="block";
			document.getElementById("g_bottom_tool.click_layer_button").style["backgroundColor"]="#292929";
		}else{
			document.getElementById("palette_tool_layer").style.display="none";
			document.getElementById("g_bottom_tool.click_layer_button").style["backgroundColor"]="#494949";
		}
		
		this._show_layer_tool();
	}
	
	this.update_layer_thumbnail=function(){
		if(this._sub_tool!=SUB_TOOL_LAYER){
			return;
		}
		g_layer.update_thumbnail();
	}
	
	this._show_layer_tool=function(){
		if(this._sub_tool!=SUB_TOOL_LAYER){
			return;
		}
		g_layer.show_layer_tool();
		this.update_layer_thumbnail();
	}

	this.on_mouse_move=function(x,y){
		if(this._is_hold){
			this.on_mouse_down_core(x,y,false);
		}
	}
	
	this.on_mouse_up=function(){
		this._is_hold=false;
		this._focus=FOCUS_NONE;
		this.update_layer_thumbnail();
	}

	this._get_mx=function(x){
		var canvasRect = document.getElementById("pen_tools").getBoundingClientRect();
		return (x-canvasRect.left);
	}
	
	this._get_my=function(y){
		var canvasRect =  document.getElementById("pen_tools").getBoundingClientRect();
		return (y-canvasRect.top);
	}
	
	this.on_tool_change=function(tool){
		var canvas=document.getElementById("pen_tools");
		var context=canvas.getContext("2d");
		switch(tool){
		case "pen":
			this._tool=0;
			break;
		case "eraser":
			this._tool=1;
			break;
		case "blur":
			this._tool=2;
			break;
		case "blur_eraser":
			this._tool=3;
			break;
		}
		this._draw(context);
	}
	
	this._redraw=function(){
		var canvas=document.getElementById("pen_tools");
		var context=canvas.getContext("2d");
		this._draw(context);
	}
	
	this.update_color=function(){
		this._redraw();
		g_tool.update_color_status(g_color_circle.get_hex_color());
	}
}

//-------------------------------------------------
//グローバルイベント
//-------------------------------------------------

function ipad_bottom_tool_on_mouse_down(e){
	if(e.touches){
		g_bottom_tool.on_mouse_down(e.touches[0].clientX,e.touches[0].clientY);
		e.preventDefault();
		return;
	}
	g_bottom_tool.on_mouse_down(e.clientX,e.clientY);
	e.preventDefault();
}

function ipad_bottom_tool_on_mouse_move(e){
	if(e.touches){
		g_bottom_tool.on_mouse_move(e.touches[0].clientX,e.touches[0].clientY);
		e.preventDefault();
		return;
	}
	g_bottom_tool.on_mouse_move(e.clientX,e.clientY);
	e.preventDefault();
}

function ipad_bottom_tool_on_mouse_up(e){
	if(e.touches){
		g_bottom_tool.on_mouse_up();
		//e.preventDefault();	//iPadのスクロールを有効化するためにコメントアウト
		return;
	}
	g_bottom_tool.on_mouse_up();
	//e.preventDefault();
}
