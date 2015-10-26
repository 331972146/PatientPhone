angular.module('zjubme.services', ['ionic','ngResource'])

// 客户端配置
.constant('CONFIG', {
  baseUrl: 'http://10.12.43.72:9000/Api/v1/',
  role: "Patient",
  //revUserId: "",
  //TerminalName: "",
  //TerminalIP: "",
  DeviceType: '1'
  })

// 本地存储函数
.factory('Storage', ['$window', function ($window) {
  return {
    set: function(key, value) {
      $window.localStorage.setItem(key, value);
    },
    get: function(key) {
      return $window.localStorage.getItem(key);
    },
    rm: function(key) {
      $window.localStorage.removeItem(key);
    },
    clear: function() {
      $window.localStorage.clear();
    }
  };
}])

// 数据模型函数, 具有取消(cancel/abort)HTTP请求(HTTP request)的功能
.factory('Data',['$resource', '$q','$interval' ,'CONFIG','Storage' , function($resource,$q,$interval ,CONFIG,Storage){
   var serve={};
   var abort = $q.defer();
   var getToken=function(){
     return Storage.get('TOKEN') ;
   }

   var Users = function(){
      return $resource(CONFIG.baseUrl + ':path/:route',{path:'Users',},{
        LogOn:{method:'POST',headers:{token:getToken()}, params:{route: 'LogOn'}, timeout: 10000},
        Register:{method:'POST', params:{route: 'Register'}, timeout: 10000},
        ChangePassword:{method:'POST',params:{route:'ChangePassword'},timeout: 10000},
        Verification:{method:'POST',params:{route:'Verification'},timeout:10000},
        UID:{method:'GET',params:{route:'UID',Type:'@Type',Name:'@Name'},timeout:10000},
        Activition:{method:'POST',params:{route:'Activition'},timeout:10000}
      });
    };
    var Service = function(){
      return $resource(CONFIG.baseUrl + ':path/:route',{
        path:'Service',
      },{
              sendSMS:{method:'POST',headers:{token:getToken()}, params:{route: 'sendSMS',phoneNo:'@phoneNo',smsType:'@smsType'}, timeout: 10000},
              checkverification:{method:'POST',headers:{token:getToken()}, params:{route: 'checkverification', mobile:'@mobile',smsType: '@smsType', verification:'@verification'},timeout: 10000},
      })
    };
    var VitalInfo = function () {
      return $resource(CONFIG.baseUrl + ':path/:route', {path:'VitalInfo'},
          {
            GetLatestPatientVitalSigns: {method:'GET', params:{route: 'VitalSign'}, timeout: 10000},
            GetSignsDetailByPeriod: {method:'GET', params:{route: 'VitalSign'}, timeout: 10000},
            PostPatientVitalSigns:{method:'POST',params:{route: 'VitalSign'},timeout: 10000},

            // 获取某日期之前，一定条数血压（收缩压/舒张压）和脉率的数据详细时刻列表,用于phone，支持继续加载
            VitalSigns:{method:'GET',params:{route: 'VitalSigns'},timeout: 10000}
      });
    };
    var MessageInfo = function () {
        return $resource(CONFIG.baseUrl + ':path/:route', {path:'MessageInfo'},
          {
              submitSMS: {method:'POST', params:{route: 'message'}, headers:{token:'aGFZMnEwVlFCcy8vcW85ODNQRlRjb0hkc3lnSUw1VWpaVFpLVWhUbnpxQT06MTU5NTcxOTE0MzI6UGF0aWVudDoyMDE1LTEwLTIyIDIxOjI1OjA0'},timeout: 10000},
              GetSMSDialogue:{method:'GET', params:{route: 'messages'}, headers:{token:'aGFZMnEwVlFCcy8vcW85ODNQRlRjb0hkc3lnSUw1VWpaVFpLVWhUbnpxQT06MTU5NTcxOTE0MzI6UGF0aWVudDoyMDE1LTEwLTIyIDIxOjI1OjA0'},timeout: 10000}
        });
    };

    var PlanInfo = function () {
        return $resource(CONFIG.baseUrl + ':path/:route', {path:'PlanInfo'},
          {
              GetImplementationForPhone: {method:'GET', params:{route: 'GetImplementationForPhone'},timeout: 10000},
              GetSignInfoByCode: {method:'GET', params:{route: 'GetSignInfoByCode'},timeout: 10000},
              GetImplementationByDate: {method:'GET', params:{route: 'GetImplementationByDate'},timeout: 10000}               
        });
    };

    serve.abort = function ($scope) {
    abort.resolve();
    $interval(function () {
      abort = $q.defer();
      serve.Users = Users(); 
      serve.Service = Service();
      serve.VitalInfo = VitalInfo(); 
      serve.MessageInfo = MessageInfo(); 
      }, 0, 1);
    };
    serve.Users = Users();
    serve.Service = Service();
    serve.VitalInfo = VitalInfo(); 
    serve.MessageInfo = MessageInfo();
    
    return serve;
}])

// 用户操作函数
// --------登录注册-熊佳臻----------------
.factory('userservice',['$http','$q' , 'Storage','Data', function($http,$q,Storage,Data){ 
  var serve = {};
    var status = "";
    //新的方法BEGIN
    var returnMessage="";
    serve.getMessage = function(){
      return returnMessage;
    }

    var phoneReg=/^(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
    var passReg1=/([a-zA-Z]+[0-9]+|[0-9]+[a-zA-Z]+)/;
    var passReg2=/^.[A-Za-z0-9]+$/;
    serve.userLogOn = function(_PwType,_username,_password,_role){
        if(!phoneReg.test(_username)){
          return 7; 
        }
        // if(logpass.length >18  ||  logpass.length<6){ //密码格式要求
    //  return 4;
    // }else if(!passReg1.test(logpass)){
    //  return 5;
    // }else if(!passReg2.test(logpass)){
            // return 6;
    // }

    var deferred = $q.defer();   
        Data.Users.LogOn({PwType:_PwType, username:_username, password:_password, role: _role},
      function(data,hearders,status){ 
        deferred.resolve(data);
      },
      function(err){
        deferred.reject(err);
        });
        return deferred.promise;
    }

    serve.Verification = function(_userId,_PwType){
        if(!phoneReg.test(_phoneNo)){
          return 7; 
        }

        var deferred = $q.defer();
        Data.Users.Verification({userId:_userId,PwType:_PwType},
          function(data){

            deferred.resolve(data);
          },
          function(err){
            deferred.resolve(err);
          });
        return deferred.promise;
    }
    
    serve.UID = function(_Type,_Name){
      if(!phoneReg.test(_Name)){
          return 7; 
        }

        var deferred = $q.defer();
        Data.Users.UID({Type: _Type, Name:_Name},
        function(data){
          deferred.resolve(data);
        },
        function(err){
          deferred.reject(err);   
        });
        return deferred.promise;      
    }
    serve.sendSMS = function( _phoneNo,_smsType){
        if(!phoneReg.test(_phoneNo)){
          return 7; 
        }
        
        var deferred = $q.defer();
        Data.Service.sendSMS({phoneNo: _phoneNo, smsType:_smsType},
        function(data){
          deferred.resolve(data);
        },
        function(err){
          deferred.reject(err);   
        });
        return deferred.promise;
    }
    serve.checkverification = function(_mobile,_smsType,_verification){
      var deferred = $q.defer();
      Data.Service.checkverification({mobile:_mobile,smsType:_smsType,verification:_verification},
        function(data,status){
          deferred.resolve(data);
        },
        function(err){
          deferred.reject(err);
        })
      return deferred.promise;
    }

    serve.changePassword = function(_OldPassword,_NewPassword,_UserId){
      var deferred = $q.defer();
        Data.Users.ChangePassword({OldPassword:_OldPassword, NewPassword: _NewPassword, UserId:_UserId,  "revUserId": "sample string 4","TerminalName": "sample string 5", "TerminalIP": "sample string 6","DeviceType": 1},
          function(data,headers,status){
            deferred.resolve(data);
          },
          function(err){
            deferred.reject(err);
          })
        return deferred.promise;
    }

    serve.userRegister = function(_PwType, _userId, _UserName, _Password,_role){
      var deferred = $q.defer();
      Data.Users.Register({"PwType":_PwType,"userId":_userId,"Username":_UserName,"Password":_Password,role:_role,"revUserId": "sample string 6","TerminalName": "sample string 7","TerminalIP": "sample string 8","DeviceType": 1},
        function(data,headers,status){
              deferred.resolve(data);
        },
        function(err){
                deferred.reject(err);;
        })
      return deferred.promise;
    }
    serve.Activition = function(_UserId,_InviteCode,_role){
      var deferred = $q.defer();
      Data.Users.Register({UserId:_UserId,InviteCode:_InviteCode,role:_role},
        function(data,headers,status){
              deferred.resolve(data);
        },
        function(err){
                deferred.reject(err);;
        })
      return deferred.promise;
    }        
    //新的方法END

  // var isPassValid = function(pass){
  //  if(pass.length >18  ||  pass.length<6){
  //    return 4;
  //  }else if(!passReg1.test(pass)){
  //    return 5;
  //  }else if(!passReg2.test(pass)){
 //            return 6;
  //  }else{
  //    return 0;
  //  }
  // }

  return serve;
}])

// --------交流-苟玲----------------
.factory('MessageInfo', ['$q', '$http', 'Data',function ( $q,$http, Data) {
    var self = this;
    self.submitSMS = function (SendBy,Content,Receiver,piUserId,piTerminalName,piTerminalIP,piDeviceType) {
      var deferred = $q.defer();
      Data.MessageInfo.submitSMS({SendBy:SendBy,Content:Content,Receiver:Receiver,piUserId:piUserId,piTerminalName:piTerminalName,piTerminalIP:piTerminalIP,piDeviceType:piDeviceType}, function (data, headers) {
        deferred.resolve(data);
        }, function (err) {
        deferred.reject(err);
        });
      return deferred.promise;
    };

    self.GetSMSDialogue = function (Reciever,SendBy) {
      var deferred = $q.defer();
      Data.MessageInfo.GetSMSDialogue({Reciever:Reciever,SendBy:SendBy}, function (data, headers) {
        deferred.resolve(data);
        }, function (err) {
        deferred.reject(err);
        });
      return deferred.promise;
    };

    return self;
}])

.factory('Socket', ['socketFactory', 'CONFIG', function (socketFactory, CONFIG) {
  // return socketFactory({
  //   // prefix: '',
  //   // scope: '',  // 要用scope需要改造返回函数为: return function($scope) {return socketFactory({scope: $scope})}; 然后使用方法为: Socket($scope).emit()...
  //   ioSocket: io.connect(CONFIG.baseUrl + CONFIG.ioDefaultNamespace)  // 文档里是用io.connect()方法; 必须连接全URL地址(可以加namespace), 而不能是相对路径, 因为在App中, 相对路径访问的是本地资源, 因此不会给服务器发送socket消息
  //   // ioSocket: io(CONFIG.baseUrl + CONFIG.ioDefaultNamespace, {multiplex: false})  // 直接用io()也可以, 加multiplex选项强制每次使用新的socket Manager(不会改变服务器的socket.id!!!)
  // });

  // return {
  //   default: socketFactory({
  //     // prefix: '',
  //     ioSocket: io.connect(CONFIG.baseUrl + CONFIG.ioDefaultNamespace)
  //   }),
  //   chat: socketFactory({
  //     // prefix: '',
  //     ioSocket: io.connect(CONFIG.baseUrl + CONFIG.ioDefaultNamespace + '/chat')
  //   }),
  //   consume: socketFactory({
  //     // prefix: '',
  //     ioSocket: io.connect(CONFIG.baseUrl + CONFIG.ioDefaultNamespace + '/consume')
  //   })
  // };
  
  var self = this;
  var ioSocket = io.connect(CONFIG.baseUrl + CONFIG.ioDefaultNamespace);
  self.default = socketFactory({
    // prefix: '',
    // ioSocket: io.connect(CONFIG.baseUrl + CONFIG.ioDefaultNamespace)
    ioSocket: ioSocket
  });
  // self.chat = socketFactory({
  //   // prefix: '',
  //   ioSocket: io.connect(CONFIG.baseUrl + CONFIG.ioDefaultNamespace + '/chat')
  // });
  // self.consume = socketFactory({
  //   // prefix: '',
  //   ioSocket: io.connect(CONFIG.baseUrl + CONFIG.ioDefaultNamespace + '/consume')
  // });
  self.new = function () {
    ioSocket = io.connect(CONFIG.baseUrl + CONFIG.ioDefaultNamespace);
    console.log(CONFIG.baseUrl + CONFIG.ioDefaultNamespace);
    self.default = socketFactory({
      // prefix: '',
      // ioSocket: io.connect(CONFIG.baseUrl + CONFIG.ioDefaultNamespace)
      ioSocket: ioSocket
    });
  };
  self.getSocket = function () {
    return ioSocket;
  };
  return self;
}])

.factory('information', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var information = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'img/1.jpg'
  }, {
    id: 1,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'img/2.jpg'
  }, {
    id: 2,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'img/3.jpg'
  }, {
    id: 3,
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'img/4.jpg'
  }, {
    id: 4,
    name: 'Mike Harrington',
    lastText: 'This is wicked good ice cream.',
    face: 'img/5.jpg'
     }, {
    id: 5,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'img/6.jpg'
  }, {
    id: 6,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'img/7.jpg'
  }, {
    id: 7,
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'img/8.jpg'
  }, {
    id: 8,
    name: 'Mike Harrington',
    lastText: 'This is wicked good ice cream.',
    face: 'img/9.jpg'
     }, {
    id: 9,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'img/10.jpg'
  }, {
    id: 10,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'img/11.jpg'
  }, {
    id: 11,
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'img/12.jpg'
  
  }];

  return {
    all: function() {
      return information;
    },
    remove: function(chat) {
      information.splice(information.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < information.length; i++) {
        if (information[i].id === parseInt(chatId)) {
          return information[i];
        }
      }
      return null;
    }
  };
})

// --------任务、插件-马志彬----------------

.factory('extraInfo',function(){
  return{
    PatientId:function(data){
      if(data==null)
      {
        return window.localStorage.getItem("PatientId");
      }else {
        window.localStorage.setItem("PatientId",data);
      }},
    TerminalIP:function(data){
      if(data==null)
      {
        return window.localStorage.getItem("TerminalIP");
      }else {
        window.localStorage.setItem("TerminalIP",data);
      }},
    TerminalName:function(data){
      if(data==null)
      {
        return window.localStorage.getItem("TerminalName");
      }else {
        window.localStorage.setItem("TerminalName",data);
      }},
    DeviceType:function(data){
      if(data==null)
      {
        return window.localStorage.getItem("DeviceType");
      }else {
        window.localStorage.setItem("DeviceType",data);
      }},
    revUserId:function(data){
      if(data==null)
      {
        return window.localStorage.getItem("ID");
      }else {
        window.localStorage.setItem("ID",data);
      }},
    DateTimeNow:function(){
      var date = new Date();
      var dt={};
      dt.year=date.getFullYear().toString();
      dt.year.length==1?dt.year='0'+dt.year:dt.year=dt.year;
      dt.month=(date.getMonth()+1).toString();
      dt.month.length==1?dt.month='0'+dt.month:dt.month=dt.month;
      dt.day=date.getDate().toString();
      dt.day.length==1?dt.day='0'+dt.day:dt.day=dt.day;
      dt.hour=date.getHours().toString();
      dt.hour.length==1?dt.hour='0'+dt.hour:dt.hour=dt.hour;
      dt.minute=date.getMinutes().toString();
      dt.minute.length==1?dt.minute='0'+dt.minute:dt.minute=dt.minute;
      dt.second=date.getSeconds().toString();
      dt.second.length==1?dt.second='0'+dt.second:dt.second=dt.second;
      return dt;
    }
  }
})

.factory('Projects', function(){
  return {
    all: function() {
      var projectString = window.localStorage['projects'];
      if(projectString) {
        return angular.fromJson(projectString);
      }
      return [];
    },
    save: function(projects) {
      window.localStorage['projects'] = angular.toJson(projects);
    },
    newProject: function(projectTitle) {
      // Add a new project
      return {
        title: projectTitle,
        tasks: []
      };
    },
    getLastActiveIndex: function() {
      return parseInt(window.localStorage['lastActiveProject']) || 0;
    },
    setLastActiveIndex: function(index) {
      window.localStorage['lastActiveProject'] = index;
    }
  }
})

.factory('BloodPressureMeasure', function(){
  return {
    BPConclusion:function(h,l){
      if(parseInt(h)<130&&parseInt(l)<85)
      {
        return '您的血压属于正常\n范围，请继续保持';
      }else {
        return '您的血压偏高，请注意降压';
      }
    },
    FindCommand: function() {
      var bttestdata=new Uint8Array(8);
          bttestdata[0]=0x4F;
          bttestdata[1]=0xFF;
          bttestdata[2]=0xFF;
          bttestdata[3]=0xFF;
          bttestdata[4]=0x02;
          bttestdata[5]=0xFF;
          bttestdata[6]=0xFF;
          bttestdata[7]=bttestdata[0]^bttestdata[1]^bttestdata[2]^bttestdata[3]^bttestdata[4]^bttestdata[5]^bttestdata[6];
      return bttestdata;
    },
    StartCommand:function(arr){
      var StartCommand = new Uint8Array(arr);
          StartCommand[4]=0x03;
          StartCommand[7]=0xFE;
          StartCommand[8]=StartCommand[0]^StartCommand[1]^StartCommand[2]^StartCommand[3]^StartCommand[4]^StartCommand[5]^StartCommand[6]^StartCommand[7];
          console.log(StartCommand);
      return StartCommand;
    },
    BloodPressureChart:function(){
      var bpc={
          "type": "serial",
          "theme": "chalk",
          "dataProvider": [{
              "name": "收缩压",
              "points": 13,
              "Unit":"/mmHg",
              "color": "#DB4C3C",
              "bullet": "img/icon/00.gif"
          }, {
              "name": "舒张压",
              "points": 13,
              "Unit":"/mmHg",
              "color": "#7F8DA9",
              "bullet": "img/icon/00.gif"
          }, {
              "name": "心率",
              "points": 13,
              "Unit":"次/分",
              "color": "#FEC514",
              "bullet": "img/icon/00.gif"
          }],
          "valueAxes": [{
              "maximum": 200,
              "minimum": 0,
              "axisAlpha": 0,
              "dashLength": 4,
              "position": "left",
              "stackType": "regular"
          }],
          "startDuration": 1,
          "graphs": [{
              "balloonText": "<span style='font-size:13px;'>[[category]]: <b>[[value]]</b></span>",
              "bulletOffset": 16,
              "bulletSize": 34,
              "colorField": "color",
              "cornerRadiusTop": 8,
              "customBulletField": "bullet",
              "fillAlphas": 0.8,
              "lineAlpha": 0,
              "type": "column",
              "valueField": "points",
              "labelText": "",
              "color": "#000000"
          }],
          "marginTop": 0,
          "marginRight": 0,
          "marginLeft": 0,
          "marginBottom": 0,
          "autoMargins": false,
          "categoryField": "name",
          "categoryAxis": {
              "axisAlpha": 0,
              "gridAlpha": 0,
              "inside": true,
              "tickLength": 0
          },
          "allLabels": [
            {
              "text": "",
              "bold": true,
              "align":"center"
            }
          ],
          "export": {
            "enabled": true
          }
      }
      console.log(bpc);
      return bpc;
    }
  }
})

.factory('VitalInfo', ['$q', 'Data', 'extraInfo',function($q, Data, extraInfo){
  var self = this;
  self.InsertServerData = function()
  {
    var insertserverdata={};
    insertserverdata.UserId=extraInfo.PatientId();
    insertserverdata.RecordDate=extraInfo.DateTimeNow().year+extraInfo.DateTimeNow().month+extraInfo.DateTimeNow().day;
    insertserverdata.RecordTime=extraInfo.DateTimeNow().hour+extraInfo.DateTimeNow().minute+extraInfo.DateTimeNow().second;
    insertserverdata.ItemType='';
    insertserverdata.ItemCode='';
    insertserverdata.Value='';
    insertserverdata.Unit='';
    insertserverdata.revUserId=extraInfo.revUserId();
    insertserverdata.TerminalName=extraInfo.TerminalName();
    insertserverdata.TerminalIP=extraInfo.TerminalIP();
    insertserverdata.DeviceType=parseInt(extraInfo.DeviceType());
    return insertserverdata;
  };

  self.PostPatientVitalSigns = function(data){
    var deferred = $q.defer();
    Data.VitalInfo.PostPatientVitalSigns(data,
      function(s){
        deferred.resolve(s);
      },function(e){
        deferred.reject(e);
      });
    return deferred.promise;
  };

  self.GetSignsDetailByPeriod = function (PatientId,Module,StartDate,Num) {
    var deferred = $q.defer();
    Data.VitalInfo.VitalSigns({PatientId:PatientId,Module:Module,StartDate:StartDate,Num:Num}, function (data, headers) {
      deferred.resolve(data);
    }, function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  };

  return self;
}])

// --------李山----------------

;