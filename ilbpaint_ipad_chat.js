//-------------------------------------------------
//イラブペイント　チャットモード
//copyright 2010-2012 ABARS all rights reserved.
//-------------------------------------------------

var WATCH_DOG_COUNT=10;				//10回分の時間successが帰って来なかったらfailedと判断する
var GET_COMMAND_LIMIT=250;			//コマンドを読み込んでくる単位
var WORKER_INITIAL_INTERVAL=1000;	//1秒に一回イニシャルロード
var WORKER_POST_INTERVAL=2000;		//3秒に一回データを送信
var SNAPSHOT_PERCENT=75;			//使用率が上がった場合にスナップショットを取る
var WAIT_FOR_UNDO_MSEC=1000;		//UNDO用に1秒待機
var HEART_BEAT_INTERVAL=60*1000;	//1分に1回はハートビートを送る

var SNAPSHOT_ALERT=0;				//スナップショットの状況を表示するかどうか
var SNAPSHOT_SNAP_BUTTON=0;			//スナップボタンを表示するかどうか

//-------------------------------------------------
//グローバルコールバック
//-------------------------------------------------

var g_chat_key=null;	//チャットモードの場合はROOMのKEYが入る
var g_chat_user_id=null;	//ユーザのID
var g_chat_user_name="名無しさん";	//ユーザの名前
var g_viewmode=false;			//見るだけのモードかどうか
var g_initial_snapshot_created=false;	//最低一回はスナップショットを作成したか

//チャットモードの場合は最初にinitが呼ばれる
function chat_init(key,user_id,user_name,server_time,viewmode,token,client_id){
	//ユーザ情報
	g_chat_user_id=user_id
	g_chat_user_name=user_name
	
	//ローカルお絵かきモード
	if(key=="local" || key==""){
		return;
	}

	//Channel接続
	chat_channel_init(token);
	
	//チャットモード
	g_chat_key=key;
	g_viewmode=viewmode;
	
	//時間設定
	user_set_time_delta(server_time);
	
	//デバッグ用
	g_chat_user_name=g_chat_user_name;
	g_chat_user_id=client_id;//g_chat_user_id+"_"+server_time
}

//ワーカコールバック
function chat_initial_load_worker(){
	g_chat._initial_load_worker();
}

function chat_post_worker(){
	g_chat._post_worker();
}

//コマンドGETコールバック
function chat_get_callback(obj){
	if(obj.status=="success"){
		g_chat._get_success(obj.command_list,obj.count);
		return;
	}
	if(obj.status=="failed"){
		g_chat._get_failed();
		g_chat._get();	//リトライ
		return;
	}
	if(obj.status=="disconnect"){
		chat_server_error("ChannelAPIが切断されました。");
		return;
	}
	if(obj.status=="not_found"){
		chat_server_error("ルームが終了されました。");
		return;
	}
	chat_server_error("不明なエラー[GET:"+obj.status+"]が発生しました。")
}

//コマンドPOSTコールバック
function chat_post_callback(obj){
	if(obj.status=="success"){
		g_chat._send_success();
		var percent=g_user.set_object_size(obj.size)
		if(percent<SNAPSHOT_PERCENT/2){
			g_chat.reset_snapshot();
		}
		if(percent>=SNAPSHOT_PERCENT/2 && (!g_initial_snapshot_created || percent<SNAPSHOT_PERCENT)){
			g_chat.prepare_snapshot();	//スナップショットデータを準備
		}
		if(percent>=SNAPSHOT_PERCENT){
			g_chat.snapshot();	//スナップショットを作成して容量を削減
		}
		return;
	}
	if(obj.status=="failed"){
		g_chat._send_failed();
		return;
	}
	if(obj.status=="disconnect"){
		chat_server_error("ChannelAPIが切断されました。");
		return;
	}
	if(obj.status=="not_found"){
		chat_server_error("ルームが終了されました。");
		return;
	}
	chat_server_error("不明なエラー[POST:"+obj.status+"]が発生しました。")
}

//スナップショットコールバック
function chat_snapshot_callback(obj){
	if(obj.status=="success"){
		g_chat._snapshot_success();
	}
	if(obj.status=="failed"){
		g_chat._snapshot_failed();
	}
}

function chat_get_snapshot_callback(obj){
	if(obj.status=="success"){
		g_chat._get_snapshot_success(obj);
	}
	if(obj.status=="failed"){
		chat_server_error("スナップショットの読み込みに失敗しました。");
	}
}

function chat_get_userlist_callback(obj){
	if(obj.status=="success"){
		//退室チェック
		var user_list=new Array();
		var name_map=new Object();
		for(var client in obj.user_list){
			user_list.push(client);
			name_map[client]=obj.user_list[client];
		}
		g_user.update_user_list(user_list,name_map);
	}
	if(obj.status=="failed"){
		//chat_server_error("ユーザリストの読込に失敗しました。リトライします。");
		g_chat._get_user_list(); //リトライ
	}
	if(obj.status=="not_found"){
		chat_server_error("ルームが終了されました。");
		return;
	}
}

//サーバエラー
function chat_server_error(message){
	alert(""+message+"イラブチャットポータルに戻ります。");
	window.location.href="./chat";
}

//-------------------------------------------------
//Channel API
//-------------------------------------------------

function chat_channel_init(token){
	var channel = new goog.appengine.Channel( token );
	var socket = channel.open({
		onopen      :   function(){
			//  ソケットopen完了時(受信可となったタイミング)にコールされる処理
			//g_buffer._update_comment({"comment":"サーバとのコネクションを確立しました。"});
		}
	,	onmessage   :   function(message) {
			//  メッセージを受信したときにコールされる処理
			//  message.data が受信した文字列
			if(message.data=="update"){
				//g_buffer._update_comment({"comment":"サーバから更新を受信しました。"});
				g_chat._get();
			}
			if(message.data=="update_user"){
				//g_buffer._update_comment({"comment":"サーバからユーザの変更を受信しました。"});
				g_chat._get_user_list();
			}
		}
	,	onerror     :   function(error) {
			//  ソケットで何らかの異常が発生したときにコールされる処理
			//  error.codeにエラーコード、error.descriptionに理由が入る
			//  ※token の有効期限が切れた際にも呼ばれる
			g_buffer._update_comment({"comment":"サーバとの接続でエラーが発生しました。リロードして下さい。"+error.description});
		}
	,	onclose     :   function(){
			//  ソケットが何らかの理由でクローズされたときにコールされる処理
			//  ※token の有効期限が切れた際にも呼ばれる
			//  ※試した範囲では、自分で socket.close()を呼んでもコールされなかった
			g_buffer._update_comment({"comment":"サーバとの接続がクローズされました。リロードして下さい。"});
		}
	});
}

//-------------------------------------------------
//チャットクラス
//-------------------------------------------------

function Chat(){
	this._geted_count;		//どのネットワークコマンドまでGETしているかの位置
	this._geting_count;		//今、GETしている数
	this._geting_retry;		//GETしてからの経過時間
	this._initial_load;		//初期読込かどうか
	
	this._posted_count;		//どのローカルコマンドまでPOSTしているかの位置
	this._posting_count;	//今、POSTしている数
	this._posting_retry;	//POSTしてからの経過時間

	this._local_packet_count;		//ローカルのユニークパケットID
	
	this.snapshot_creating;
	this.snapshot_data;
	
	//初期化
	this.init=function(){
		this._get_init();
		this._post_init();
		this._local_packet_count=0;
		
		this.snapshot_creating=false;
		this.snapshot_data=null;
		
		//ローカルお絵かきモード
		if(g_chat_key==null)
			return;

		//スナップショットを取得する
		var url="chat?mode=snap_shot&key="+g_chat_key;
		illustbook.request.get("./"+url,chat_get_snapshot_callback);

		//スナップショットの取得が完了したらワーカーのタイマー呼び出しを開始する
	}

	//ユーザリストの取得
	this._get_user_list=function(){
		var url="chat?mode=user_list&key="+g_chat_key;
		illustbook.request.get("./"+url,chat_get_userlist_callback);
	}

	//初期ロードコールバック
	this._initial_load_worker=function(){
		//最新情報が存在するかどうか
		if(this._initial_load){
			//最新のコマンドを取得する
			this._get();
		}
	}
	
	//ワーカー
	this._post_worker=function(){
		//ローカルお絵かきモードの場合はPOSTしない
		if(g_chat_key==null){
			return;
		}

		//ビューモードの場合はGETするだけ
		if(g_viewmode){
			return;
		}
		
		//コマンドを送信する
		this._send();
	}

//-------------------------------------------------
//GET系
//-------------------------------------------------

	this._get_init=function(){
		this._geted_count=0;
		this._geting_count=0;
		this._geting_retry=0;
		this._initial_load=true;
	}
	
	//サーバから最新のコマンドリストを取得
	this._get=function(){
		//GET中はGETしない
		if(this._geting_count){
			this._geting_retry++;
			if(this._geting_retry>=WATCH_DOG_COUNT){
				this._get_failed();
			}
			return;
		}
		
		//コマンドリストを取得
		this._geting_retry=0;
		this._geting_count=GET_COMMAND_LIMIT;
		var url="chat?mode=get_command&offset="+this._geted_count+"&limit="+GET_COMMAND_LIMIT+"&key="+g_chat_key+"&client_id="+g_chat_user_id;
		
		//同じスレッドでGETする
		illustbook.request.get("./"+url,chat_get_callback);
	}
	
	//コマンドの取得に成功した
	this._get_success=function(cmd_list,count){
		//アサーション
		if(count === undefined){
			chat_server_error("サーバから返却されたcount値が不正です。");
			return;
		}

		//コマンドを1つずつ処理
		for(var i=0;i<count;i++){
			var cmd=cmd_list[i];
			g_buffer.push_network_command(cmd);
		}
		
		//取得した位置を更新
		this._geted_count+=count;
		this._geting_count=0;

		//初期読み込みの完了通知
		if(count!=GET_COMMAND_LIMIT && this._initial_load){
			g_buffer.notify_initial_load_finish();
			g_user.notify_user_login(g_chat_user_name);
			//g_buffer._update_comment({"comment":ipad_is_english() ? "Finish initial loading":"初期読込が完了しました。"});
			this._initial_load=false;
			
			//送信ワーカの起動
			setInterval(chat_post_worker,WORKER_POST_INTERVAL);
		}
	}
	
	//コマンドの取得に失敗した
	this._get_failed=function(){
		this._geting_count=0;
	}

//-------------------------------------------------
//POST系
//-------------------------------------------------

	this._post_init=function(){
		this._posted_count=0;
		this._posting_count=0;
		this._posting_retry=0;
		this._heart_beat_cnt=0;
	}

	//サーバにコマンド送信
	this._send=function(){
		//送信するデータが存在するかを判定
		var len=g_buffer.get_local_command_len()-this._posted_count;
		if(len<=0){
			this._heart_beat_cnt++;
			if(this._heart_beat_cnt<HEART_BEAT_INTERVAL/WORKER_POST_INTERVAL){	//1分に一回はHeartBeatを送る
				return;
			}
		}
		
		//送信するデータを準備
		var cmd_list=new Array();
		var now_time=g_buffer.get_now_time();
		for(var i=0;i<len;i++){
			var cmd=g_buffer.get_local_command(this._posted_count+i);
			var time=g_buffer.get_local_time(this._posted_count+i);
			if(now_time-time<=WAIT_FOR_UNDO_MSEC){
				//UNDO用に一定時間送信を待つ
				len=i;
				break;
			}
			cmd_list.push(cmd);
		}

		//送信中は送信しない
		if(this._posting_count){
			this._posting_retry=this._posting_retry+1;
			if(this._posting_retry>=WATCH_DOG_COUNT){
				this._send_failed();
			}
			return;
		}

		//送信
		this._posting_retry=0;
		this._send_core(cmd_list);
		this._heart_beat_cnt=0;
	}
	
	//サーバにコマンドリストを送信
	this._send_core=function(cmd_list){
		post_data=new Object();
		post_data["user_count"]=g_user.get_user_count();
		post_data["command_count"]=cmd_list.length;
		for(var i=0;i<cmd_list.length;i++){
			post_data["command"+i]=cmd_list[i];
		}
		this._posting_count=cmd_list.length;
		illustbook.request.post_async("./chat?mode=post_command&key="+g_chat_key+"&client_id="+g_chat_user_id,post_data,chat_post_callback);
		g_tool.update_undo_redo_status();
	}
	
	this._send_success=function(){
		this._posted_count+=this._posting_count;
		this._posting_count=0;
	}
	
	this._send_failed=function(){
		this._posting_count=0;
	}
	
	this.get_posted_count=function(){
		return this._posting_count+this._posted_count;
	}

//-------------------------------------------------
//コマンドリスト構築
//-------------------------------------------------

	//チャットモードかどうか
	this.is_chat_mode=function(){
		return g_chat_key!=null
	}
	
	//ビューモードかどうか
	this.is_view_mode=function(){
		return g_viewmode;
	}

	//ユーザID取得
	this.get_user_id=function(){
		return g_chat_user_id;
	}
	
	//パケットID取得
	this.get_packet_no=function(){
		this._local_packet_count++;
		return this._local_packet_count;
	}
	
	//ヘッダ作成
	this.create_command=function(cmd_no,obj){
		var txt="[{";
		txt+="'user_id':'"+g_chat.get_user_id()+"',"
		txt+="'packet_no':"+g_chat.get_packet_no()+","
		txt+="'cmd':"+cmd_no;
		for(tag in obj){
			var data=obj[tag];
			txt+=",";
			txt+="'"+tag+"':'"+data+"'";
		}
		txt+="}]";
		return txt;
	}

//-------------------------------------------------
//コメント
//-------------------------------------------------

	//コメントする
	this.comment=function(){
		var comment=document.getElementById("comment").value
		if(comment==""){
			return;
		}
		if(comment=="debug"){
			SNAPSHOT_ALERT=1;
			document.getElementById("comment").value=""
			g_user._update_status();
			return;
		}
		comment=""+g_chat_user_name+"＞"+comment;
		
		var obj=new Object();
		obj.comment=comment;
		var txt=this.create_command(CMD_TEXT,obj);
		
		g_buffer.push_command(txt);

		document.getElementById("comment").value=""
	}

//-------------------------------------------------
//スナップショット作成
//-------------------------------------------------

	//スナップショットを準備する
	//　スナップショットポイントが他のユーザのリードポイントを追い越さないように
	//　半分の容量の段階で準備しておく
	//　もしも追い越した場合はNOPでユーザに警告してリロードしてもらう
	this.prepare_snapshot=function(){
		if(this.snapshot_data){
			return;
		}
		if(this._initial_load){
			return;
		}
		
		if(SNAPSHOT_ALERT){
			g_buffer._update_comment({"comment":"スナップショットを準備します。"});
		}
		
		var range=this._geted_count;

		var image_array=new Array();
		
		for(var layer=0;layer<LAYER_N;layer++){
			var image=can_fixed[layer].toDataURL("image/png");
			image_array[layer] = g_upload._header_split(image);
		}
		
		g_upload._create_thumbnail();
		var thumbnail_can=document.getElementById("canvas_thumbnail");
		var thumbnail = g_upload._header_split(thumbnail_can.toDataURL("image/jpeg",0.95));
		
		post_data=new Object();
		for(var layer=0;layer<LAYER_N;layer++){
			post_data["snap_shot_"+layer]=image_array[layer];
		}
		post_data["snap_range"]=range;
		post_data["thumbnail"]=thumbnail;
		
		this.snapshot_data=post_data;
		g_initial_snapshot_created=true;
	}

	//スナップショットを作成する
	this.snapshot=function(){
		if(this._initial_load){
			return;
		}
		if(!this.snapshot_data){
			return;
		}
		if(SNAPSHOT_ALERT){
			g_buffer._update_comment({"comment":"スナップショットを送信します。"});
		}
		this.snapshot_creating=true;
		illustbook.request.post_async("./chat?mode=post_snapshot&key="+g_chat_key,this.snapshot_data,chat_snapshot_callback);
	}
	
	this._snapshot_success=function(){
		if(SNAPSHOT_ALERT){
			g_buffer._update_comment({"comment":"スナップショットの送信に成功。"});
		}
		this.snapshot_data=null;
		this.snapshot_creating=false;
	}
	
	this._snapshot_failed=function(){
		if(SNAPSHOT_ALERT){
			g_buffer._update_comment({"comment":"スナップショットの送信に失敗。"});
		}
		this.snapshot_creating=false;
	}
	
	//スナップショットを読み込む
	this._get_snapshot_success=function(obj){
		if(SNAPSHOT_ALERT){
			g_buffer._update_comment({"comment":"スナップショットの読込に成功しました。"});
		}
		
		//スナップショット取得成功
		if(obj.snap_range){
			this._geted_count=obj.snap_range;

			//アサーション
			if(obj.snap_range === undefined){
				chat_server_error("サーバから返却されたスナップショットのrange値が不正です。");
				return;
			}

			//スナップショットを反映
			var image=new Array(LAYER_N);
			for(var layer=0;layer<LAYER_N;layer++){
				image[layer]=new Image();
				image[layer].onload=(function(layer){
					return function(){
					if(SNAPSHOT_ALERT){
						g_buffer._update_comment({"comment":"レイヤー"+layer+"のスナップショットを更新 "+image[layer].width+"x"+image[layer].height});
					}
					if(image[layer].width==0 || image[layer].height==0){
						g_buffer._update_comment({"comment":"レイヤー"+layer+"のスナップショットの読み込みエラー"});
					}
					try{
						g_draw_primitive.clear(can_fixed[layer]);
						//can_fixed[layer].getContext("2d").fillStyle = "rgb(255, 0, 0)";
						//can_fixed[layer].getContext("2d").fillRect(0,0,100,100);
						can_fixed[layer].getContext("2d").drawImage(image[layer],0,0);
						g_buffer.undo_redo_exec_on_local_tool();	//新規追加
					}catch(e){
						alert("スナップショットの更新に失敗")
					}
					}
				})(layer);
				image[layer].src="data:image/png;base64,"+obj["snap_shot_"+layer];
			}
		}

		//ユーザリストを取得する
		g_chat._get_user_list();

		//イニシャルロードワーカー
		setInterval(chat_initial_load_worker,WORKER_INITIAL_INTERVAL);
	}
	
	this.reset_snapshot=function(){
		this.snapshot_data=null;	//スナップショットデータを初期化
	}
}