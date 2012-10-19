//-------------------------------------------------
//イラブペイント　パレット
//copyright 2010-2012 ABARS all rights reserved.
//-------------------------------------------------

function Palette(){
	//メンバ変数
	this._color="rgba(255,0,0,1)";
	this._palette_color=new Array();
	this._palette_color_n;
	this._selecting_no=0;

	//クリックした
	this.on_click=function(color,is_touch){
		var new_color=this._palette_color[color];
		this._color=new_color;
		this._selecting_no=color;
		g_color_circle.change_palette(new_color);
		this.update();
	}

	this.init=function(){
		this._palette_color[0]="#000000";
		this._palette_color[1]="#404040";
		this._palette_color[2]="#606060";
		this._palette_color[3]="#808080";
		this._palette_color[4]="#a0a0a0";
		this._palette_color[5]="#c0c0c0";
		this._palette_color[6]="#eeeeee";
		this._palette_color[7]="#ffffff";
		this._palette_color[8]="#bc700c";
		this._palette_color[9]="#ec9d86";
		this._palette_color[10]="#ffc39e";
		this._palette_color[11]="#ffd9c2";
		this._palette_color[12]="#ff0000";
		this._palette_color[13]="#ffacac";
		this._palette_color[14]="#d894e0";
		this._palette_color[15]="#0000ff";
		this._palette_color[16]="#00ffff";
		this._palette_color[17]="#50ff50";
		this._palette_color[18]="#50bc50";
		this._palette_color[19]="#ffff00";
		this.on_click(0);
	}
	
	this.update=function(){
		this._palette_color_n=20;
		var txt="";
		for(var i=0;i<this._palette_color_n;i++){
			txt+="<div id='palette"+i+"'style='float:left;width:"+g_color_width+"px;height:"+g_color_width+"px;background-color:"+this._palette_color[i]+";'";
			if(ipad_is_pc()){
				txt+=" onclick='javascript:g_palette.on_click("+i+",false);'";
			}
			txt+=">";
			txt+="</div>";
			if(i==(this._palette_color_n/2)-1){
				txt+="<BR>";
			}
		}
		document.getElementById("palette").innerHTML=txt;

		if(!ipad_is_pc()){
		    for(var i=0;i<this._palette_color_n;i++){
				document.getElementById("palette"+i).addEventListener("touchstart", g_palette_click,false);
		    }
		}

		for(var i=0;i<this._palette_color_n;i++){
			var w=g_color_width;
			var h=g_color_width;
			var alpha=1;
			if(i==this._selecting_no){
				w=g_color_width-4;
				h=g_color_width-4;
				document.getElementById("palette"+i).style.border="solid 2px #ffffff";
			}else{
				document.getElementById("palette"+i).style.border="none";
			}
			document.getElementById("palette"+i).style.width=w;
			document.getElementById("palette"+i).style.height=h;
		}

		g_bottom_tool.update_color();
	}
	
	this.get_color=function(){
		if(g_tool.get_tool()=="eraser" || g_tool.get_tool()=="blur_eraser"){
			return "#ffffff";
		}
		return this._color;
	}
	
	this.set_color=function(color){
		this._palette_color[this._selecting_no]=color;
		this._color=color;
		this.update();
	}
}

function g_palette_click(e){
	g_palette.on_click(this.id.split("palette")[1],true);
	e.preventDefault();
}
