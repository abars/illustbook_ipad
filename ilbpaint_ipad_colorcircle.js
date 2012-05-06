//-------------------------------------------------
//イラブペイント　カラーサークル
//copyright 2010-2012 ABARS all rights reserved.
//-------------------------------------------------

var FOCUS_NONE=0;
var FOCUS_COLOR=1;
var FOCUS_SIZE=2;
var FOCUS_ALPHA=3;
var FOCUS_BOX=4;

function ColorCircle(){
	this._color_map=new Array();
	
	this._color_circle;
	this._color_box;
	
	this._canvas_width;
	this._canvas_height;
	
	this._focus=0;
	
	this._color_circle_x=4;
	this._color_circle_y=4;
	this._color_circle_width=310;
	this._color_circle_height=16;
	
	this._color_box_x=380-60;
	this._color_box_y=4;
	this._color_box_width=54;
	this._color_box_height=54;
	
	this._size_slider_x=4;
	this._size_slider_y=32;
	this._size_slider_width=120;
	this._size_slider_height=16;

	this._alpha_slider_x=4+140+4;
	this._alpha_slider_y=32;
	this._alpha_slider_width=100;
	this._alpha_slider_height=16;
	
	this._layer_x=380-60-40;
	this._layer_y=28;
	this._layer_width=24;
	this._layer_height=24;
	
	this._tool=0;
	
	this._base_color=0x000000;
	this._color=0x000000;
	
	this._cursor_x=0;
	this._box_x=18;
	this._box_y=30;
	this._pen_size=new Array(3,15);
	this._alpha=new Array(100,100);
	this._layer=1;
	
	this.init=function(){
		var canvas=document.getElementById("color_circle");
		this._canvas_width=canvas.width;
		this._canvas_height=canvas.height;

		for(var i=0;i<7;i++){
			this._color_map[i]=new Object();
		}
		this._color_map[0].r=1; this._color_map[0].g=0; this._color_map[0].b=0;
		this._color_map[1].r=1; this._color_map[1].g=1; this._color_map[1].b=0;
		this._color_map[2].r=0; this._color_map[2].g=1; this._color_map[2].b=0;
		this._color_map[3].r=0; this._color_map[3].g=1; this._color_map[3].b=1;
		this._color_map[4].r=0; this._color_map[4].g=0; this._color_map[4].b=1;
		this._color_map[5].r=1; this._color_map[5].g=0; this._color_map[5].b=1;
		this._color_map[6].r=1; this._color_map[6].g=0; this._color_map[6].b=0;
		
		this.create();

		document.getElementById("color_circle").addEventListener("mousedown", ipad_color_circle_on_mouse_down,false);
		document.getElementById("color_circle").addEventListener("mousemove", ipad_color_circle_on_mouse_move,false);
		document.getElementById("bottom_tool").addEventListener("mouseup", ipad_color_circle_on_mouse_up,false);
		
		document.getElementById("color_circle").addEventListener("touchstart", ipad_color_circle_on_mouse_down,false);
		document.getElementById("color_circle").addEventListener("touchmove", ipad_color_circle_on_mouse_move,false);
		document.getElementById("bottom_tool").addEventListener("touchend", ipad_color_circle_on_mouse_up,false);
	}

//-------------------------------------------------
//画像作成
//-------------------------------------------------

	this.create=function(){
		var canvas=document.getElementById("color_circle");
		var context=canvas.getContext("2d");

		for(var x=0;x<this._color_circle_width;x++){
			var obj=this._get_color(x);
			context.fillStyle="rgb("+obj.r+","+obj.g+","+obj.b+")";
			context.fillRect(x,0,1,this._color_circle_height);
		}

		this._color_circle=context.getImageData(0,0,this._color_circle_width,this._color_circle_height);
		this._color_box=this._boxg(context,0,0,this._color_box_width,this._color_box_height,0x000000);
		
		this._draw(context);
	}
	
	this._draw=function(context){
		context.strokeStyle="#000000";
		context.fillStyle="#000000";
		context.globalAlpha=1.0;

		context.clearRect(0,0,this._canvas_width,this._canvas_height);

		context.putImageData(this._color_circle,this._color_circle_x,this._color_circle_y);
		context.putImageData(this._color_box,this._color_box_x,this._color_box_y);
		
		context.beginPath();
		context.fillStyle="#000000";
		context.rect(this._color_circle_x+this._cursor_x-2,this._color_circle_y-2,4,this._color_circle_height+4);
		context.closePath();
		context.stroke();

		this._draw_box(context);
		
		this._draw_slider(context,this._size_slider_x,this._size_slider_y,this._size_slider_width,this._size_slider_height,this._pen_size[this._tool],true);
this._draw_slider(context,this._alpha_slider_x,this._alpha_slider_y,this._alpha_slider_width,this._alpha_slider_height,this._alpha[this._tool],false);

		this._draw_layer(context);
		
		//this._draw_preview(context);
	}

	this._draw_box=function(context){
		context.beginPath();
		var r=3;
		if(this._box_y>=this._color_box_height*7/8){
			context.strokeStyle="#ffffff";
		}else{
			context.strokeStyle="#000000";
		}
		context.arc(this._color_box_x+this._box_x,this._color_box_y+this._box_y,r,0,2*Math.PI,false);
		context.closePath();
		context.stroke();
	}

	this._draw_preview=function(context){
		context.beginPath();
		var r=this._pen_size[this._tool]/2;
		if(r>20){
			r=20;
		}
		context.strokeStyle=this.get_hex_color();//"#aaaaaa";
		context.fillStyle=this.get_hex_color();//"#aaaaaa";
		context.globalAlpha=(this._alpha[this._tool]/100.0);
		context.arc(this._canvas_height/2,this._canvas_height/2,r,0,2*Math.PI,false);
		context.fill();
		context.closePath();
		context.stroke();
	}

//-------------------------------------------------
//レイヤー
//-------------------------------------------------

	this._draw_layer=function(context){
		var s=10;
		
		context.beginPath();
		context.strokeStyle="#5f5fef";
		context.fillStyle="#c7e5f9";
		context.rect(this._layer_x+s,this._layer_y+s,this._layer_width-s,this._layer_height-s);
		if(this._layer==0){
			context.fill();
		}
		context.closePath();
		context.stroke();

		context.beginPath();
		context.strokeStyle="#5f5fef";
		context.fillStyle="#c7e5f9";
		context.rect(this._layer_x,this._layer_y,this._layer_width-s,this._layer_height-s);
		if(this._layer==1){
			context.fill();
		}
		context.closePath();
		context.stroke();
	}
	
	this.get_layer_no=function(){
		return this._layer;
	}

//-------------------------------------------------
//ペンサイズとα
//-------------------------------------------------
	
	this.get_size=function(){
		return this._pen_size[this._tool];
	}

	this.get_alpha=function(){
		if(g_tool.get_tool()=="eraser"){
			return 1.0;
		}
		return this._alpha[this._tool]/100.0;
	}

//-------------------------------------------------
//スライダー
//-------------------------------------------------

	this._draw_slider=function(context,x,y,w,h,cursor,tri){
		context.beginPath();
		context.strokeStyle="#5f5fef";
		context.fillStyle="#c7e5f9";
		if(tri){
			context.moveTo(x,y+h);
			context.lineTo(x+w,y+h);
			context.lineTo(x+w,y);
			context.lineTo(x,y+h);
		}else{
			context.moveTo(x,y);
			context.lineTo(x+w,y);
			context.lineTo(x+w,y+h);
			context.lineTo(x,y+h);
			context.lineTo(x,y);
		}
		context.fill();
		context.closePath();
		context.stroke();

		context.beginPath();
		context.strokeStyle="#000000";
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
		
		var canvas=document.getElementById("color_circle");
		var context=canvas.getContext("2d");
		
		if(this._focus==FOCUS_COLOR || (click && this._is_range(x,y,this._color_circle_x,this._color_circle_y,this._color_circle_width,this._color_circle_height))){
			this._cursor_x=Math.floor(x-this._color_circle_x);
			if(this._cursor_x<0) this._cursor_x=0;
			if(this._cursor_x>=this._color_circle_width) this._cursor_x=this._color_circle_width-1;
			var color=this._get_image_color(this._color_circle.data,this._cursor_x,0,this._color_circle_width);
			this._set_base_color(color);
			g_palette.set_color(this.get_hex_color());
			this._focus=FOCUS_COLOR;
		}

		if(this._focus==FOCUS_BOX || (click && this._is_range(x,y,this._color_box_x,this._color_box_y,this._color_box_width,this._color_box_height))){
			this._box_x=x-this._color_box_x;
			this._box_y=y-this._color_box_y;
			if(this._box_x<0) this._box_x=0;
			if(this._box_x>=this._color_box_width) this._box_x=this._color_box_width-1;
			if(this._box_y<0) this._box_y=0;
			if(this._box_y>=this._color_box_height) this._box_y=this._color_box_height-1;
			this._color=this._get_image_color(this._color_box.data,this._box_x,this._box_y,this._color_box_width);
			g_palette.set_color(this.get_hex_color());
			this._draw(context);
			this._focus=FOCUS_BOX;
		}
		
		if(this._focus==FOCUS_SIZE || (click && this._is_range(x,y,this._size_slider_x,this._size_slider_y,this._size_slider_width,this._size_slider_height))){
			this._pen_size[this._tool]=x-this._size_slider_x;
			if(this._pen_size[this._tool]<1) this._pen_size[this._tool]=1;
			if(this._pen_size[this._tool]>this._size_slider_width) this._pen_size[this._tool]=this._size_slider_width;
			this._draw(context);
			this._focus=FOCUS_SIZE;
		}
		
		if(this._focus==FOCUS_ALPHA || (click && this._is_range(x,y,this._alpha_slider_x,this._alpha_slider_y,this._alpha_slider_width,this._alpha_slider_height))){
			this._alpha[this._tool]=x-this._alpha_slider_x;
			if(this._alpha[this._tool]<0) this._alpha[this._tool]=0;
			if(this._alpha[this._tool]>100) this._alpha[this._tool]=100;
			this._draw(context);
			this._focus=FOCUS_ALPHA;
		}

if(click && this._is_range(x,y,this._layer_x,this._layer_y,this._layer_width,this._layer_height)){
			this._layer=1-this._layer;
			this._draw(context);
		}
		
		this._is_hold=true;
	}
	
	this.on_mouse_move=function(x,y){
		if(this._is_hold){
			this.on_mouse_down_core(x,y,false);
		}
	}
	
	this.on_mouse_up=function(){
		this._is_hold=false;
		this._focus=FOCUS_NONE;
	}

	this._get_mx=function(x){
		var canvasRect = document.getElementById("color_circle").getBoundingClientRect();
		return (x-canvasRect.left);
	}
	
	this._get_my=function(y){
		var canvasRect =  document.getElementById("color_circle").getBoundingClientRect();
		return (y-canvasRect.top);
	}
	
	this._get_image_color=function(data,x,y,w){
		var adr=y*w+x;
		adr*=4;
		var r=data[adr+0];
		var g=data[adr+1];
		var b=data[adr+2];
		var a=0;//data[adr+3];
		return (a<<24) | (r<<16) | (g<<8) | b;
	}
	
	this.on_tool_change=function(tool){
		var canvas=document.getElementById("color_circle");
		var context=canvas.getContext("2d");
		if(tool=="pen"){
			this._tool=0;
		}else{
			this._tool=1;
		}
		this._draw(context);
	}
	
	this._set_base_color=function(color){
		this._base_color=color;
		this._redraw_box();
		this._color=this._get_image_color(this._color_box.data,this._box_x,this._box_y,this._color_box_width);
		this._redraw();
	}
	
	this._redraw_box=function(){
		var canvas=document.getElementById("color_circle");
		var context=canvas.getContext("2d");
		this._color_box=this._boxg(context,0,0,this._color_box_width,this._color_box_height,this._base_color);
	}
	
	this._redraw=function(){
		var canvas=document.getElementById("color_circle");
		var context=canvas.getContext("2d");
		this._draw(context);
	}
	
	this.set_color=function(color){
		this._decide_cursor(color);
		this._redraw_box();
		this._decide_box(color);
		this._color=color&0xffffff;
		this._redraw();
		g_palette.set_color(this.get_hex_color());
	}
	
	this.change_palette=function(color){
		color=parseInt(color.replace("#","0x"));
		this._decide_cursor(color);
		this._redraw_box();
		this._decide_box(color);
		this._color=color;
		this._redraw();
	}

	this._decide_cursor=function(color){
		var as=(color>>24)&0xff;
		var rs=(color>>16)&0xff;
		var gs=(color>>8)&0xff;
		var bs=(color>>0)&0xff;
		
		var width=this._color_circle_width;

		var min_o=Math.floor(width*Math.atan2(Math.sqrt(3)*(gs-bs),2*rs-gs-bs)/(2*Math.PI));
		if(min_o<0) min_o+=width;
		min_o=min_o%width;
		
		this._cursor_x=min_o;
		this._base_color=this._get_image_color(this._color_circle.data,this._cursor_x,0,this._color_circle_width);
	}
	
	this._decide_box=function(color){
		var min_d=(1<<30);
		var min_x,min_y;

		var rs=(color>>16)&0xff;
		var gs=(color>>8)&0xff;
		var bs=(color>>0)&0xff;
		
		for(var y=0;y<this._color_box_height;y++){
			for(var x=0;x<this._color_box_width;x++){
				var adr=y*this._color_box_width+x;
				adr=adr*4;
				var r=this._color_box.data[adr+0];
				var g=this._color_box.data[adr+1];
				var b=this._color_box.data[adr+2];
				var d=(r-rs)*(r-rs)+(g-gs)*(g-gs)+(b-bs)*(b-bs);
				if(min_d>d){
					min_d=d;
					min_x=x;
					min_y=y;
				}
			}
		}
		
		this._box_x=min_x;
		this._box_y=min_y;
	}
	
//-------------------------------------------------
//カラーサークル
//-------------------------------------------------

	this._get_color=function(x){
		var unit=this._color_circle_width/6;

		var no=Math.floor(x/unit);
		var a=(x-no*unit)/unit;
		
		var r=Math.floor((this._color_map[no].r*(1-a)+this._color_map[no+1].r*a)*255);
		var g=Math.floor((this._color_map[no].g*(1-a)+this._color_map[no+1].g*a)*255);
		var b=Math.floor((this._color_map[no].b*(1-a)+this._color_map[no+1].b*a)*255);
		
		var ret=new Object();
		ret.r=r;
		ret.g=g;
		ret.b=b;
		
		return ret;
	}
	
	this.get_hex_color=function(){
		return "#"+("00000" + this._color.toString(16).toUpperCase()).substr(-6);
	}

//-------------------------------------------------
//カラーボックス
//-------------------------------------------------

	this._boxg=function(context,tx,ty,tw,th,color){
			var h = this.getH((color>>16)&0xff, (color>>8)&0xff, (color) & 0xff);
			var pixels = context.createImageData(tw,th);
			pixels.length = tw * th;
			var adr = 0;
			var step_h = 255 / (tw-1);
			var step_v = 255 / (th-1);
			for(var y=0;y<th;y++){
				var hy=255 - y * step_v;
				var hx=0;
				for (var x = 0; x < tw; x++) {
					this.writeRgbFromHsv(pixels.data ,adr, h, Math.floor(hx), hy);
					adr += 4;
					hx+=step_h;
				}
			}
			return pixels;
		}
		
		this.getH=function(r,g,b){
			var max = Math.max(r, g, b);
			var min = Math.min(r, g, b);
			if (max == 0) return 0;
			var diff = max - min;
			var h = 0;
			
			if (diff == 0)
				return 0;
			else if (max == r)
				h = 60.0 * (g - b) / diff;
			else if (max == g)
				h = 60.0 * (b - r) / diff + 120.0;
			else
				h = 60.0 * (r - g) / diff + 240.0;
			
			if (h < 0) h += 360.0;
			return h;
		}

		this.writeRgbFromHsv=function(rgb,adr, h, s, v){
			rgb[adr+3] = 255;

			if (s == 0) {
				rgb[adr+0] = v;
				rgb[adr+1] = v;
				rgb[adr+2] = v;
				return;
			}
			
			var hi = Math.floor(h / 60.0);
			var f = (h / 60.0) - hi;
			var m = Math.floor(v * (1 - s / 255.0));
			var n = Math.floor(v * (1 - s * f / 255.0));
			var k = Math.floor(v * (1 - s * (1 - f) / 255.0));
			
			switch(Math.floor(hi)) {
				case 0: rgb[adr+0] = v; rgb[adr+1] = k; rgb[adr+2] = m; break;
				case 1: rgb[adr+0] = n; rgb[adr+1] = v; rgb[adr+2] = m; break;
				case 2: rgb[adr+0] = m; rgb[adr+1] = v; rgb[adr+2] = k; break;
				case 3: rgb[adr+0] = m; rgb[adr+1] = n; rgb[adr+2] = v; break;
				case 4: rgb[adr+0] = k; rgb[adr+1] = m; rgb[adr+2] = v; break;
				case 5: rgb[adr+0] = v; rgb[adr+1] = m; rgb[adr+2] = n; break;
				defalut: rgb[adr+0] = 0; rgb[adr+1] = 0; rgb[adr+2] = 0; break;
			}
		}
}

//-------------------------------------------------
//イベント
//-------------------------------------------------

function ipad_color_circle_on_mouse_down(e){
	if(e.touches){
		g_color_circle.on_mouse_down(e.touches[0].clientX,e.touches[0].clientY);
		e.preventDefault();
		return;
	}
	g_color_circle.on_mouse_down(e.clientX,e.clientY);
	e.preventDefault();
}

function ipad_color_circle_on_mouse_move(e){
	if(e.touches){
		g_color_circle.on_mouse_move(e.touches[0].clientX,e.touches[0].clientY);
		e.preventDefault();
		return;
	}
	g_color_circle.on_mouse_move(e.clientX,e.clientY);
	e.preventDefault();
}

function ipad_color_circle_on_mouse_up(e){
	if(e.touches){
		g_color_circle.on_mouse_up();
		e.preventDefault();
		return;
	}
	g_color_circle.on_mouse_up();
	e.preventDefault();
}
