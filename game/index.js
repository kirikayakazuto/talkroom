var websocket = require("websocket");
var utils = require("utils");

var STYPE_TALKROOM = 1;
var TalkCmd = {
	Enter: 1, // 用户进来
	Exit: 2, // 用户离开ia
	UserArrived: 3, // 别人进来;
	UserExit: 4, // 别人离开

	SendMsg: 5, // 自己发送消息,
    UserMsg: 6, // 收到别人的消息
    
    SendList: 7,
    RemoveChild: 8,

    talkroom_num: 9,
};

var Respones = {
	OK: 1,
	IS_IN_TALKROOM: -100, // 玩家已经在聊天室
	NOT_IN_TALKROOM: -101, // 玩家不在聊天室
	INVALD_OPT: -102, // 玩家非法操作
	INVALID_PARAMS: -103, // 命令格式不对
};

cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
        // -330
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        /*
        websocket.register_serivces_handler({
            1: this.on_talk_room_service_return.bind(this),
        });
        */
        
        this.sex = user_info.sex;  // 默认是男性 1
        var toggle = this.node.getChildByName("sex").getChildByName("toggle");
        var all_toggle = [];
        all_toggle = toggle.children;
        for(var i=0; i<all_toggle.length; i++) {
            if(i == (this.sex-1)) {
                all_toggle[i].getComponent(cc.Toggle).isChecked = true;
            }else {
                all_toggle[i].getComponent(cc.Toggle).isChecked = false;
            }
            
        }
        this.node.getChildByName("name").getChildByName("input").getComponent(cc.EditBox).string = user_info.uname;
        this.talkroom_num = this.node.getChildByName("talkroom_num").getComponent(cc.Label);
    },

    start () {

    },

    // 选择性别
    get_sex_toggle (event, data) {
        if(data == 1){ // 选择性别为男
            this.sex = 1;
        }else if(data == 2) { // 选择性别为女
            this.sex = 2;
        }
    },

    // 点击进入聊天室按钮
    enter_talkroom () {
        
        var name = this.node.getChildByName("name").getChildByName("input").getComponent(cc.EditBox).string;

        if(name == null || name == "undefind" || name == ""){
            return ;
        }
        user_info.uname = name;
        user_info.sex = this.sex;
        cc.director.loadScene("talkroom");
    },

    /* on_talk_room_service_return: function(stype, cmd, body) {
        
        switch(cmd) {
            case TalkCmd.talkroom_num:
            {
                if (body[0] == Respones.OK) {
                    // 将房间的人数返回
                    var num = body[1];
                    console.log("num : ", num);
                    this.talkroom_num.string = "当前聊天室已经有 "+ num +" 个人";
                }
            }
            break;
        }
    }, */

    // update (dt) {},
});
