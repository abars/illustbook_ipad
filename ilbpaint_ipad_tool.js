//-------------------------------------------------
//イラブペイント　基本ツール
//copyright 2010-2012 ABARS all rights reserved.
//-------------------------------------------------

//-------------------------------------------------
//ツールボックス
//-------------------------------------------------

//var button_style="border:solid 1px #333333;border-radius:48px;width:48px;height:48px;";
//var inner_style="margin-left:4px;margin-top:8px;width:40px;";

function ToolBox(){
	this._add_button=function(cmd,info,s,margin){
		var button_style="margin:2px;margin-left:4px;text-align:center;width:"+g_button_width+"px;height:"+g_button_height+"px;border:solid 1px #5f5fef;background-color:#c7e5f9;";
		var txt='<div id="'+cmd+'"';
		if(ipad_is_pc()){
			txt+=' onclick="javascript:'+cmd+'(false);"';
		}
		txt+=' style="'+button_style+'margin-top:'+margin+'px;">'+info+'</div>';
		return txt;
	}
	
	this.init=function(){
		var txt="";
		var s=g_button_width+20;
		var margin=12;
		txt+=this._add_button("g_undo_redo.undo","取り消し",s,margin);
		txt+=this._add_button("g_undo_redo.redo","やり直し",s,0);

		txt+=this._add_button("g_tool.set_pen","ペン",s,margin);
		txt+=this._add_button("g_tool.set_eraser","消しゴム1",s,0);
		txt+=this._add_button("g_tool.set_spoit","スポイト",s,0);
		
		if(g_chat.is_chat_mode()){
			txt+=this._add_button("g_tool.set_hand","ハンド",s,0);
			txt+=this._add_button("g_hand.zoom_in","ズーム<BR>+",s,margin);
			txt+=this._add_button("g_hand.zoom_out","ズーム<BR>-",s,0);
		}else{
			txt+=this._add_button("g_tool.set_hand","ムーブ",s,0);
		}
		if(!(g_chat.is_view_mode())){
			txt+=this._add_button("ipad_switch_upload_form","投稿",s,margin);
		}
		if(!(g_chat.is_chat_mode())){
			txt+=this._add_button("g_draw_canvas.clear","クリア",s,margin);
		}
		
		//デバッグ
		if(SNAPSHOT_ALERT){
			txt+=this._add_button("g_chat.prepare_snapshot();g_chat.snapshot();","スナップ",s,margin);
		}

		document.getElementById("toolmenu").innerHTML=txt+"<br clear='both'>";

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
			if(!(g_chat.is_view_mode())){
				document.getElementById("ipad_switch_upload_form").addEventListener("touchstart", function(e){ipad_switch_upload_form(true);e.preventDefault();},false);
			}
			if(!(g_chat.is_chat_mode())){
				document.getElementById("g_draw_canvas.clear").addEventListener("touchstart", function(e){g_draw_canvas.clear(true);e.preventDefault();},false);
			}
		}
	}

	this.update=function(){
		var color="#c7e5f9";
		if(g_hand.is_hand_mode()){
			color="#a7c5d9"
		}
		document.getElementById("g_hand.hand_mode").style["background-color"]=color;
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
	
	this._is_blur_pen=false;
	this._is_blur_eraser=false;
	
	this._set_pen_name=function(){
		if(this._is_blur_pen){
			document.getElementById("g_tool.set_pen").innerHTML="ブラシ";
		}else{
			document.getElementById("g_tool.set_pen").innerHTML="ペン";
		}
		if(this._is_blur_eraser){
			document.getElementById("g_tool.set_eraser").innerHTML="消しゴム2";
		}else{
			document.getElementById("g_tool.set_eraser").innerHTML="消しゴム1";
		}
	}
	
	this._set_core=function(tool){
		if(this._tool==tool){
			if(!(tool=="pen" || tool=="eraser")){
				if(document.getElementById("edit_tool").style.display=="block"){
					document.getElementById("edit_tool").style.display="none";
				}else{
					document.getElementById("edit_tool").style.display="block";
				}
			}
			if(!(g_chat.is_chat_mode())){
				if(tool=="pen"){
					this._is_blur_pen=!this._is_blur_pen;
				}
				if(tool=="eraser"){
					this._is_blur_eraser=!this._is_blur_eraser;
				}
			}
			this._set_pen_name();
			g_hand.resize(true);
			g_bottom_tool.on_tool_change(this.get_tool());
			return;
		}
		
		var color="#c7e5f9";
		document.getElementById("g_tool.set_pen").style["background-color"]=color;
		document.getElementById("g_tool.set_eraser").style["background-color"]=color;
		document.getElementById("g_tool.set_hand").style["background-color"]=color;
		document.getElementById("g_tool.set_spoit").style["background-color"]=color;

		color="#a7c5d9"
		document.getElementById("g_tool.set_"+tool).style["background-color"]=color;
		
		this._tool=tool;
		g_bottom_tool.on_tool_change(this.get_tool());
	}
	
	this.get_tool=function(){
		if(this._tool=="pen"){
			if(this._is_blur_pen){
				return "blur";
			}
		}
		if(this._tool=="eraser"){
			if(this._is_blur_eraser){
				return "blur_eraser";
			}
		}
		return this._tool;
	}
}

