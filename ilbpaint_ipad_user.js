//-------------------------------------------------
//イラブペイント　ログインユーザ管理
//copyright 2010-2012 ABARS all rights reserved.
//-------------------------------------------------

var g_server_time_delta=0;

function user_set_time_delta(server_time){
	var date = new Date();
	g_server_time_delta=server_time-date.getTime()/1000;
}

function User(){
	this._user_list;
	this._datastore_size;
	
	this.init=function(){
		this._user_list=new Array();
		this._datastore_size=0;
	}

	this.update_user_list=function(oj,name_map){
		//ログアウト
		for(var i=0;i<this._user_list.length;i++){
			var exist=0;
			for(var j=0;j<oj.length;j++){
				if(this._user_list[i].id==oj[j]){
					exist=1;
					break;
				}
			}
			if(!exist){
				this._logout_user(this._user_list[i].id);
			}
		}

		//ログイン
		for(var i=0;i<oj.length;i++){
			this._update_user_list_core(oj[i],name_map[oj[i]]);
		}
	}

	this._update_user_list_core=function(id,name){
		//既にいるユーザは反映しない
		for(var i=0;i<this._user_list.length;i++){
			if(this._user_list[i].id==id){
				return;
			}
		}
		this._add_user(name,id,0);
	}
	
	//ユーザ一覧を表示
	this._show_all_user=function(){
		var txt="";
		for(var i=0;i<this._user_list.length;i++){
			var user=this._user_list[i];
			var name=user.name;
			var id=user.id.split("_")[0];
			txt+="<a href='./mypage?user_id="+id+"' target='_BLANK' title='"+name+"'>";
			txt+="<img src='./show_icon?key="+id+"' width='30px' height='30px' alt='"+name+"'>";
			txt+="</a>";
		}
		txt+="<BR><small>"+this._user_list.length+"人参加</small>";

		document.getElementById("user_list").innerHTML=txt;
	}
	
	this._update_status=function(){
		var perc=this._datastore_size;
		var txt="<small>容量の"+perc+"%を使用</small>";
		document.getElementById("status").innerHTML=txt;
	}
	
	this._logout_user=function(client_id){
		for(var i=0;i<this._user_list.length;i++){
			var user=this._user_list[i];
			if(user.id==client_id){
				g_buffer._update_comment({"comment":""+user.name+"さんが退室しました。"});
				this._user_list.splice(i,1);
				this._show_all_user();	//ステータス更新
				return;
			}
		}
	}
	
	//ユーザ追加
	this._add_user=function(name,id,time){
		g_buffer._update_comment({"comment":""+name+"さんが参加しました。"});

		var obj=new Object();
		obj.name=name;
		obj.id=id;
		obj.time=time;
		this._user_list.push(obj);

		this._show_all_user();
	}
	
	this.get_user_count=function(){
		return this._user_list.length;
	}
	
	this.set_object_size=function(size){
		this._datastore_size=Math.round((size*100)/(1*1024*1024));
		this._update_status();
		return this._datastore_size
	}
}
