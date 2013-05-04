//-------------------------------------------------
//イラブペイント　基本ツール
//copyright 2010-2012 ABARS all rights reserved.
//-------------------------------------------------

//-------------------------------------------------
//ツールボックス
//-------------------------------------------------

var TOOL_ENABLE_COLOR="#2f2fbf";
var TOOL_DISABLE_COLOR="#efefff";

function ToolBox(){
	this._add_button=function(cmd,info,s,margin){
		var button_style="width:"+g_button_width+"px;height:"+g_button_height+"px;color:"+TOOL_ENABLE_COLOR+";";
		var txt='<div id="'+cmd+'"';
		if(ipad_is_pc()){
			txt+=' onclick="javascript:'+cmd+'(false);"';
		}
		txt+=' class="tool_button" style="float:left;'+button_style+'margin-left:'+margin+'px;">'+info+'</div>';
		return txt;
	}

	this.init=function(){
		var txt="";
		var s=g_button_width+20;
		var margin=12;
		txt+=this._add_button("g_undo_redo.undo","取り消し",s,0);
		txt+=this._add_button("g_undo_redo.redo","やり直し",s,0);

		txt+=this._add_button("g_tool.set_pen","ペン",s,margin);
		txt+=this._add_button("g_tool.set_eraser","消しゴム1",s,0);
		txt+=this._add_button("g_tool.set_spoit","スポイトL",s,0);
		
		if(g_chat.is_chat_mode()){
			txt+=this._add_button("g_tool.set_hand","ハンド",s,0);
			txt+=this._add_button("g_hand.zoom_in","ズーム<BR>+",s,margin);
			txt+=this._add_button("g_hand.zoom_out","ズーム<BR>-",s,0);
		}else{
			if(ipad_is_pc()){
				txt+=this._add_button("g_tool.set_hand","ハンド",s,0);
			}else{
				txt+=this._add_button("g_tool.set_hand","ムーブ",s,0);
			}
		}
		var submit_button_exist=(window.innerWidth>480 || !g_chat.is_chat_mode());
		if(!(g_chat.is_view_mode()) && submit_button_exist){
			txt+=this._add_button("ipad_switch_storage_form","記録",s,margin);
			txt+=this._add_button("ipad_switch_upload_form","投稿",s,0);
		}
		
		//デバッグ
		if(SNAPSHOT_SNAP_BUTTON){
			txt+=this._add_button("g_chat.prepare_snapshot();g_chat.snapshot();","スナップ",s,margin);
		}

		document.getElementById("toolmenu").innerHTML=txt;

		//遅延登録が必須
		if(!ipad_is_pc()){
			document.getElementById("g_undo_redo.undo").addEventListener("touchstart", function(e){g_undo_redo.undo(true);e.preventDefault();},false);
			document.getElementById("g_undo_redo.redo").addEventListener("touchstart", function(e){g_undo_redo.redo(true);e.preventDefault();},false);
			document.getElementById("g_tool.set_pen").addEventListener("touchstart", function(e){g_tool.set_pen();e.preventDefault();},false);
			document.getElementById("g_tool.set_eraser").addEventListener("touchstart", function(e){g_tool.set_eraser();e.preventDefault();},false);
			document.getElementById("g_tool.set_spoit").addEventListener("touchstart", function(e){g_tool.set_spoit();e.preventDefault();},false);
			document.getElementById("g_tool.set_hand").addEventListener("touchstart", function(e){g_tool.set_hand();e.preventDefault();},false);
			if(g_chat.is_chat_mode()){
				document.getElementById("g_hand.zoom_out").addEventListener("touchstart", function(e){g_hand.zoom_out(true);e.preventDefault();},false);
				document.getElementById("g_hand.zoom_in").addEventListener("touchstart", function(e){g_hand.zoom_in(true);e.preventDefault();},false);
			}
			if(!(g_chat.is_view_mode()) && submit_button_exist){
				document.getElementById("ipad_switch_upload_form").addEventListener("touchstart", function(e){ipad_switch_upload_form(true);e.preventDefault();},false);
				document.getElementById("ipad_switch_storage_form").addEventListener("touchstart", function(e){ipad_switch_storage_form(true);e.preventDefault();},false);
			}
		}
	}

	this._get_button_color=function(enable){
		if(enable){
			return "#c7e5f9";
		}
		return "#ffffff";
	}

	this.update=function(){
		document.getElementById("ipad_switch_upload_form").style["backgroundColor"]=this._get_button_color(g_upload.is_upload_mode());
		document.getElementById("ipad_switch_storage_form").style["backgroundColor"]=this._get_button_color(g_storage.is_storage_mode());
	}
}

//-------------------------------------------------
//ツール
//-------------------------------------------------

function Tool(){
	this._tool;
	
	this.init=function(){
		this._tool=="";
		this._set_core("pen");
		this.update_undo_redo_status();
	}
	
	this.set_hand=function(){
		this._set_core("hand");
	}
	
	this.set_pen=function(){
		this._set_core("pen");
	}
	
	this.set_eraser=function(){
		this._set_core("eraser");
	}

	this.set_spoit=function(){
		this._set_core("spoit");
	}

	this._pen_mode=PEN_MODE_NORMAL;
	this._eraser_mode=ERASER_MODE_NORMAL;
	
	this._is_canvas_spoit=false;
	
	this._set_pen_name=function(){
		if(this._pen_mode==PEN_MODE_BLUR){
			document.getElementById("g_tool.set_pen").innerHTML="ブラシ";
		}
		if(this._pen_mode==PEN_MODE_NORMAL){
			document.getElementById("g_tool.set_pen").innerHTML="ペン";
		}
		if(this._eraser_mode==ERASER_MODE_BLUR){
			document.getElementById("g_tool.set_eraser").innerHTML="消しゴム2";
		}
		if(this._eraser_mode==ERASER_MODE_NORMAL){
			document.getElementById("g_tool.set_eraser").innerHTML="消しゴム1";
		}
		if(this._is_canvas_spoit){
			document.getElementById("g_tool.set_spoit").innerHTML="スポイトC";
		}else{
			document.getElementById("g_tool.set_spoit").innerHTML="スポイトL";
		}
	}
	
	this._set_core=function(tool){
		if(this._tool==tool){
			if(!(g_chat.is_chat_mode())){
				if(tool=="pen"){
					this._pen_mode++;
					if(this._pen_mode>=PEN_MODE_N){
						this._pen_mode=0;
					}
				}
				if(tool=="eraser"){
					this._eraser_mode++;
					if(this._eraser_mode>=ERASER_MODE_N){
						this._eraser_mode=0;
					}
				}
			}
			if(tool=="spoit"){
				this._is_canvas_spoit=!this._is_canvas_spoit;
			}
			this._set_pen_name();
			g_hand.resize(true);
			g_bottom_tool.on_tool_change(this.get_tool());
			return;
		}

		//background-colorだとFirefoxで動作しない
		//backgroundColorにすること

		var color="#ffffff";
		document.getElementById("g_tool.set_pen").style["backgroundColor"]=color;
		document.getElementById("g_tool.set_eraser").style["backgroundColor"]=color;
		document.getElementById("g_tool.set_hand").style["backgroundColor"]=color;
		document.getElementById("g_tool.set_spoit").style["backgroundColor"]=color;

		color="#c7e5f9"
		document.getElementById("g_tool.set_"+tool).style["backgroundColor"]=color;
		
		this._tool=tool;
		g_bottom_tool.on_tool_change(this.get_tool());
	}
	
	this.get_tool=function(){
		if(this._tool=="pen"){
			if(this._pen_mode==PEN_MODE_BLUR){
				return "blur";
			}
		}
		if(this._tool=="eraser"){
			if(this._eraser_mode==ERASER_MODE_BLUR){
				return "blur_eraser";
			}
		}
		if(this._tool=="spoit"){
			if(this._is_canvas_spoit){
				return "canvas_spoit";
			}
		}
		return this._tool;
	}

	this.update_undo_redo_status=function(){
		var color=TOOL_DISABLE_COLOR;
		if(g_undo_redo.is_undo_exist()){
			color=TOOL_ENABLE_COLOR;
		}
		document.getElementById("g_undo_redo.undo").style.color=color;

		color=TOOL_DISABLE_COLOR;
		if(g_undo_redo.is_redo_exist()){
			color=TOOL_ENABLE_COLOR;
		}
		document.getElementById("g_undo_redo.redo").style.color=color;
	}
}

