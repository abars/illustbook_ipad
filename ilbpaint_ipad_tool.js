//-------------------------------------------------
//イラブペイント　基本ツール
//copyright 2010-2012 ABARS all rights reserved.
//-------------------------------------------------

//-------------------------------------------------
//ツールボックス
//-------------------------------------------------

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
		txt+=this._add_button("g_tool.set_eraser","消しゴム",s,0);
		txt+=this._add_button("g_tool.set_spoit","スポイト",s,0);
		txt+=this._add_button("g_tool.set_hand","ハンド",s,0);

		txt+=this._add_button("g_hand.zoom_in","ズーム<BR>+",s,margin);
		txt+=this._add_button("g_hand.zoom_out","ズーム<BR>-",s,0);
		if(!(g_chat.is_chat_mode())){
			txt+=this._add_button("g_draw_canvas.clear","クリア",s,margin);
		}
		if(!(g_chat.is_view_mode())){
			txt+=this._add_button("ipad_switch_upload_form","投稿",s,margin);
		}
		
		//デバッグ
		if(SNAPSHOT_ALERT){
			txt+=this._add_button("g_chat.prepare_snapshot();g_chat.snapshot();","スナップ",s,margin);
		}

		document.getElementById("toolmenu").innerHTML=txt+"<br clear='both'>";

		//遅延登録が必須
		if(!ipad_is_pc()){
			document.getElementById("g_undo_redo.undo").addEventListener("touchstart", function(e){g_undo_redo.undo(true);},false);
			document.getElementById("g_undo_redo.redo").addEventListener("touchstart", function(e){g_undo_redo.redo(true);},false);
			document.getElementById("g_tool.set_pen").addEventListener("touchstart", function(e){g_tool.set_pen();},false);
			document.getElementById("g_tool.set_eraser").addEventListener("touchstart", function(e){g_tool.set_eraser();},false);
			document.getElementById("g_tool.set_spoit").addEventListener("touchstart", function(e){g_tool.set_pen();},false);
			document.getElementById("g_tool.set_hand").addEventListener("touchstart", function(e){g_tool.set_hand();},false);
			document.getElementById("g_hand.zoom_out").addEventListener("touchstart", function(e){g_hand.zoom_out(true);},false);
			document.getElementById("g_hand.zoom_in").addEventListener("touchstart", function(e){g_hand.zoom_in(true);},false);
			if(!(g_chat.is_chat_mode())){
				document.getElementById("g_draw_canvas.clear").addEventListener("touchstart", function(e){g_draw_canvas.clear(true);},false);
			}
			if(!(g_chat.is_view_mode())){
				document.getElementById("ipad_switch_upload_form").addEventListener("touchstart", function(e){ipad_switch_upload_form(true);},false);
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
	
	this._set_core=function(tool){
		var color="#c7e5f9";
		document.getElementById("g_tool.set_pen").style["background-color"]=color;
		document.getElementById("g_tool.set_eraser").style["background-color"]=color;
		document.getElementById("g_tool.set_hand").style["background-color"]=color;
		document.getElementById("g_tool.set_spoit").style["background-color"]=color;

		color="#a7c5d9"
		document.getElementById("g_tool.set_"+tool).style["background-color"]=color;
		
		this._tool=tool;
		g_color_circle.on_tool_change(tool);
	}
	
	this.get_tool=function(){
		return this._tool;
	}
}

