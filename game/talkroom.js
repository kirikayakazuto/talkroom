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

    SendTime: 9,  // 发送时间  有服务器发送
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
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...

        input: {
            default: null,
            type: cc.EditBox,
        },

        scroll_content: {
            default: null,
            type: cc.ScrollView,
        },

        desic_prefab: {
            default: null,
            type: cc.Prefab,
        },

        selftalk_prefab: {
            default: null,
            type: cc.Prefab,
        },

        othertalk_prefab: {
            default: null,
            type: cc.Prefab,
        },

        item_prefab: {
            default: null,
            type: cc.Prefab,
        },

        sprite_people: {    // 0是男  1是女 
            default: [],
            type: cc.SpriteFrame,

        }
    },

    // use this for initialization
    onLoad: function () {

        this.list_content = cc.find("Canvas/peoplelist/list/list_scrollview/view/content");
        this.list_item = [];
        
        websocket.register_serivces_handler({
            1: this.on_talk_room_service_return.bind(this),
        });
        

        // 游客xxxx
        this.random_uname = user_info.uname;
        this.random_sex = user_info.sex; // 1 man, 2 woman
        this.connect_to_talkroom();
        this.list_flag = 1;  //  1表示没有显示出来
        this.talkroom = {};  // 保存所有玩家信息  有服务器响应
        this.talkroom_head = cc.find("Canvas/peoplelist/list/listhead").getComponent(cc.Label);
    },

    show_tip_msg: function(str) {
        var node = cc.instantiate(this.desic_prefab);
        var label = node.getChildByName("desic").getComponent(cc.Label);
        label.string = str;

        this.scroll_content.content.addChild(node);

        this.scroll_content.scrollToBottom(0.1);
    },
 
    show_self_talk: function(uname, msg) {
        var node = cc.instantiate(this.selftalk_prefab);
        var label = node.getChildByName("uname").getComponent(cc.Label);
        label.string = uname;

        label = node.getChildByName("selfblue").getChildByName("msg").getComponent(cc.Label);
        label.string = msg;
       
        var bg_node = node.getChildByName("selfblue");
        var length = this._getLenPx(msg, 28);
        bg_node.width = length + 50;
        


        this.scroll_content.content.addChild(node);
        this.scroll_content.scrollToBottom(0.1);
    },

    show_other_talk: function(uname, msg) {
        var node = cc.instantiate(this.othertalk_prefab);
        var label = node.getChildByName("uname").getComponent(cc.Label);
        label.string = uname;

        label = node.getChildByName("otherblue").getChildByName("msg").getComponent(cc.Label);
        label.string = msg;

        
        var bg_node = node.getChildByName("otherblue");
        var length = this._getLenPx(msg, 28);
        bg_node.width = length + 50;
        

        this.scroll_content.content.addChild(node);
        this.scroll_content.scrollToBottom(0.1);
    },

    on_talk_room_service_return: function(stype, cmd, body) {
        
        switch(cmd) {
            case TalkCmd.Enter:
            {
                if (body == Respones.OK) {
                    this.show_tip_msg("你已经成功进入聊天室");
                }
            }
            break;
            case TalkCmd.Exit:
            {
                if (body == Respones.OK) {
                    this.show_tip_msg("你已经离开聊天室");
                    
                }
            }
            break;
            case TalkCmd.UserArrived:
            {
                this.show_tip_msg(body.uname + "进入聊天室");
                
            }
            break;
            case TalkCmd.UserExit:
            {
                this.show_tip_msg(body.uname + "离开聊天室");
            }
            break;
            case TalkCmd.SendMsg:
            {
                if(body[0] == Respones.OK) {
                    this.show_self_talk(body[1], body[3]);
                }
             }
            break;
            case TalkCmd.UserMsg:
            {
                this.show_other_talk(body[0], body[2]);
            }
            break;
            case TalkCmd.SendList:
            {   
                //  添加到列表
                var node = cc.instantiate(this.item_prefab);
                var num = node.getChildByName("num").getComponent(cc.Label);
                var name = node.getChildByName("name").getComponent(cc.Label);
                var sex = node.getChildByName("sex").getComponent(cc.Sprite);

                num.string = body[0];
                name.string = body[1].uname;
                sex.spriteFrame = this.sprite_people[body[1].usex - 1];
                this.list_content.addChild(node);
                // end
                
            }
            break;
            case TalkCmd.RemoveChild:  // 删除content上的子节点    发送了聊天室总人数
            {
                if(body[0] == Respones.OK){
                    this.list_content.removeAllChildren(true);
                    var num = body[1];
                    this.talkroom_head.string = "聊天室用户(" + num + ")";
                }
                
            }
            break;
            case TalkCmd.SendTime:
            {
                if(body[0] == Respones.OK){
                    this.show_tip_msg(body[1]);
                }
            }
            break;
        }
    },

    start: function() {
    },


    // 仅进行显示操作
    list_button_clicked: function() {

        var node = this.node.getChildByName("peoplelist");
        var mask = node.getChildByName("mask_button");

        if(this.list_flag == 1){
            this.list_flag = 2;
            var call_back1 = cc.callFunc(function() {
                mask.active = true;
            }.bind(this));
            var action_end = cc.moveTo(0.3, cc.p(20, -75));

            var call_back = cc.callFunc(function() {
                this.list_flag = 0;
            }.bind(this));

            var seq = cc.sequence([call_back1, action_end, call_back]);

            node.runAction(seq);
            
            return;
        }
        if(this.list_flag == 0){

            this.list_flag = 2;

            var call_back1 = cc.callFunc(function() {
                mask.active = false;
            });

            var action_begin = cc.moveTo(0.3, cc.p(-328, -75));

            var call_back = cc.callFunc(function() {
                this.list_flag = 1;
            }.bind(this));

            var seq = cc.sequence([call_back1, action_begin, call_back]);

            node.runAction(seq);
            return ;
        }
        
        // begin -328 -75
        // end 20 -75     
    },

    // 添加一个用户 , 将其添加到list中
    connect_to_talkroom: function() {
        
        // 发送到服务器
        websocket.send_cmd(STYPE_TALKROOM, TalkCmd.Enter, {
            uname: this.random_uname,
            usex: this.random_sex,
        });

        
    },

    // 主动退出连接
    disconnect_from_talkroom: function() {
        console.log("disconnect_from_talkroom");
        websocket.send_cmd(STYPE_TALKROOM, TalkCmd.Exit, null);



        cc.director.loadScene("index");
    },

    send_msg_to_talkroom: function() {
        var str = this.input.string;
        if (!str || str.length <= 0) {
            return;
        }

       // console.log(str);
        websocket.send_cmd(STYPE_TALKROOM, TalkCmd.SendMsg, str);
        this.input.string = "";
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },

    _getLenPx(str, font_size) {
        var str_leng = str.replace(/[^\x00-\xff]/gi, 'aa').length;
        return str_leng * font_size / 2
    }
});
