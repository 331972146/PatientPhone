angular.module('zjubme.services', ['ionic','ngResource'])

// 客户端配置
.constant('CONFIG', {
  baseUrl: 'http://10.12.43.72:9000/Api/v1/',
  wsServerIP : "ws://" + "10.12.43.61" + ":4141",
  role: "Patient",
  //revUserId: "",
  //TerminalName: "",
  //TerminalIP: "",
  DeviceType: '1',
  ImageAddressIP: "http://121.43.107.106:8088",
  ImageAddressFile : "/PersonalPhoto",
  // ImageAddress = ImageAddressIP + ImageAddressFile + "/" + DoctorId + ".jpg";
  consReceiptUploadPath: 'cons/receiptUpload',
  userResUploadPath: 'user/resUpload',

  cameraOptions: {  // 用new的方式创建对象? 可以避免引用同一个内存地址, 可以修改新的对象而不会影响这里的值: 用angular.copy
    quality: 75,
    destinationType: 0,  // Camera.DestinationType = {DATA_URL: 0, FILE_URI: 1, NATIVE_URI: 2};
    sourceType: 0,  // Camera.PictureSourceType = {PHOTOLIBRARY: 0, CAMERA: 1, SAVEDPHOTOALBUM: 2};
    allowEdit: true,  // 会导致照片被正方形框crop, 变成正方形的照片
    encodingType: 0,  // Camera.EncodingType = {JPEG: 0, PNG: 1};
    targetWidth: 100,  // 单位是pix/px, 必须和下面的属性一起出现, 不会改变原图比例?
    targetHeight: 100,
    // mediaType: 0,  // 可选媒体类型: Camera.MediaType = {PICTURE: 0, VIDEO: 1, ALLMEDIA: 2};
    // correctOrientation: true,
    saveToPhotoAlbum: false,
    popoverOptions: { 
      x: 0,
      y:  32,
      width : 320,
      height : 480,
      arrowDir : 15  // Camera.PopoverArrowDirection = {ARROW_UP: 1, ARROW_DOWN: 2, ARROW_LEFT: 4, ARROW_RIGHT: 8, ARROW_ANY: 15};
    },
    cameraDirection: 0  // 默认为前/后摄像头: Camera.Direction = {BACK : 0, FRONT : 1};
  },

  uploadOptions: {
    // fileKey: '',  // The name of the form element. Defaults to file. (DOMString)
    // fileName: '.jpg',  // 后缀名, 在具体controller中会加上文件名; 这里不能用fileName, 否则将CONFIG.uploadOptions赋值给任何变量(引用赋值)后, 如果对该变量的同名属性fileName的修改都会修改CONFIG.uploadOptions.fileName
    fileExt: '.jpg',  // 后缀名, 在具体controller中会加上文件名
    httpMethod: 'POST',  // 'PUT'
    mimeType: 'image/jpg',  // 'image/png'
    //params: {_id: $stateParams.consId},
    // chunkedMode: true,
    //headers: {Authorization: 'Bearer ' + Storage.get('token')}
  }
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
        Activition:{method:'POST',params:{route:'Activition'},timeout:10000},
        GetHealthCoachListByPatient: {method:'Get', isArray: true, params:{route: 'GetHealthCoachListByPatient'},timeout: 10000},
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
                submitSMS: {method:'POST', params:{route: 'message'},timeout: 10000},
                GetSMSDialogue:{method:'GET', isArray:true, params:{route: 'messages'},timeout: 10000}
        
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

    var TaskInfo = function () {
    return $resource(CONFIG.baseUrl + ':path/:route', {path:'PlanInfo'},
      {
        GetTasklist: {method:'GET',isArray:true,params:{route: 'Tasks', $filter:"InvalidFlag eq '1'"}, timeout: 10000},
        Done:{method:'POST',params:{route: 'ComplianceDetail'}, timeout: 10000}
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
      serve.TaskInfo = TaskInfo();
      }, 0, 1);
    };
    serve.Users = Users();
    serve.Service = Service();
    serve.VitalInfo = VitalInfo(); 
    serve.MessageInfo = MessageInfo();
    serve.TaskInfo = TaskInfo();
    
    return serve;
}])


// 用户操作函数
// --------登录注册-熊佳臻----------------
.factory('userservice',['$http','$q', 'Storage','Data', function($http,$q,Storage,Data){ 
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


.factory('Users', ['$q', '$http', 'Data',function ( $q,$http, Data) {
  var self = this;

  self.GetHealthCoachListByPatient = function (PatientId, CategoryCode) {
      var deferred = $q.defer();
      Data.Users.GetHealthCoachListByPatient({PatientId:PatientId, CategoryCode:CategoryCode}, function (data, headers) {
        deferred.resolve(data);
      }, function (err) {
      deferred.reject(err);
      });
      return deferred.promise;
  };

  self.myTrial = function (DoctorInfo) {
    var deferred = $q.defer();
    Data.Users.myTrialPost(DoctorInfo, function (data, headers) {
      deferred.resolve(data);
    }, function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  };

  self.myTrial2 = function (userid) {
    // Storage.set(13131313,userid);
    //由于API中要求有userID变量 DATA 中只能写死 所以动态生成一个方法
    var temp = $resource(CONFIG.baseUrl + ':path/:uid/:route', {
      path:'Users',  
    }, {
      myTrialGET: {method:'GET', params:{uid: userid,route:'DoctorInfo'}, timeout: 10000}
    });


    var deferred = $q.defer();
    temp.myTrialGET({}, function (data, headers) {
      console.log("获得了数据"+data)
      deferred.resolve(data);
    }, function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  };

  self.getquestionnaire = function(UserId,CategoryCode) {
    var deferred = $q.defer();
    Data.ModuleInfo.getModuleInfo({UserId: _UserId, CategoryCode: _CategoryCode},
          function(data,status){
            deferred.resolve(data);
          },
          function(err){
            deferred.reject(err);
          });
        return deferred.promise;
  };

   return self;
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
      dt.fulldate=dt.year+dt.month+dt.day;
      dt.fulltime=dt.hour+dt.minute+dt.second;
      dt.full=dt.year+dt.month+dt.dat+dt.hour+dt.minute+dt.second;
      // console.log(dt);
      return dt;
    },
    dictionary:function(d){
      var dictionary={
        "TD0001":"#/tab/task/healtheducation",
        "TF0001":"#/tab/task/bpm",
        "TF0002":"#/tab/task/bpm",
        "TA0001":"#/tab/task/measureweight"
      }
      var r='';
      angular.forEach(dictionary,function(value,key){
        if(key==d){r=value;}
      })
      return r;
    },
    refreshflag:function(d,f){//d==操作；f==标志位
      if(d=='set')
      {
        switch(f)
        {
          case "graphRefresh": window.localStorage.setItem("graphRefresh","1");break;
          case "recordlistrefresh":window.localStorage.setItem("recordlistrefresh","1");break;
        }
      }else if(d=='get')
      {
        switch(f)
        {
          case "graphRefresh": return window.localStorage.getItem("graphRefresh");break;
          case "recordlistrefresh":return window.localStorage.getItem("recordlistrefresh");break;
        }
      }
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

  self.VitalSigns = function (PatientId,Module,StartDate,Num) {
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

.factory('TaskInfo', ['$q', 'Data','extraInfo', function($q, Data, extraInfo){
  var self = this;
  self.GetTasklist = function(data){
    var deferred = $q.defer();
    Data.TaskInfo.GetTasklist(data,function(s){
      deferred.resolve(s);
    },function(e){
      deferred.reject(e);
    });
    return deferred.promise;
  }

  self.insertstate = function(arr)
  {
    for(var i=0;i<arr.length;i++)
    {
      arr[i].index=i;
      arr[i].go=extraInfo.dictionary(arr[i].Code);
    }
    return arr;
  }

  self.done = function(arr,PLN)
  {
    var data={
      "PlanNo":PLN,
      "Date": extraInfo.DateTimeNow().fulldate,
      "CategoryCode": arr.Instruction,
      "Code": arr.Code,
      "Status": arr.Status,
      "Description": arr.Description
    };
    // console.log(data);
    var deferred = $q.defer();
      Data.TaskInfo.Done(data,function(s){
        deferred.resolve(s);
      },function(e){
        deferred.reject(e);
    });
    return deferred.promise;
  }
  return self;
}])

.factory('NotificationService',['$cordovaLocalNotification',function($cordovaLocalNotification){
  return{
    save:function(arr){
      var a=[];
      a[0]=arr;
      var t= angular.fromJson(window.localStorage['alertlist']);
      if(t)
      {
        for(var i=0;i<t.length;i++)
        {
          a[i+1]=t[i];
          a[i+1].index=i+1;
        }
      }
      window.localStorage['alertlist'] = angular.toJson(a);
      var n={
        id: arr.ID,
        title: arr.title,
        text: arr.detail,
        firstAt: arr.time,
        every: "day",
        sound: "file://sources/Nokia.mp3",
        icon: "file://img/ionic.png"
      };
      $cordovaLocalNotification.schedule(n);
    },
    get:function(){
      var alert = window.localStorage['alertlist'];
      return angular.fromJson(alert);
    },
    remove:function(index){
      var t= angular.fromJson(window.localStorage['alertlist']);
      $cordovaLocalNotification.cancel(t[index].ID);
      t.splice(index,1);
      if(t)
      {
        for(var i=index;i<t.length;i++)
        {
          t[i].index--;
        }
      }
      window.localStorage['alertlist'] = angular.toJson(t);
    },
    update:function(arr){
      var t= angular.fromJson(window.localStorage['alertlist']);
      t[arr.index]=arr;
      window.localStorage['alertlist'] = angular.toJson(t);
    }
  }
}])

// --------李山----------------
.factory('PlanInfo', ['$q', '$http', 'Data', function ( $q,$http, Data) {
  var self = this;
  self.GetImplementationForPhone = function (UserId,ItemType,ItemCode) {
    var deferred = $q.defer();
    Data.PlanInfo.GetImplementationForPhone({UserId:UserId,ItemType:ItemType,ItemCode:ItemCode}, function (data, headers) {
      deferred.resolve(data);
    }, function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  };
  self.GetSignInfoByCode = function (PatientId,Module,StartDate,Num) {
    var deferred = $q.defer();
    Data.PlanInfo.GetSignInfoByCode({PatientId:PatientId,Module:Module,StartDate:StartDate,Num:Num}, function (data, headers) {
      deferred.resolve(data);
    }, function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  };
  self.GetImplementationByDate = function (PatientId,Module,StartDate,Num) {
    var deferred = $q.defer();
    Data.PlanInfo.GetImplementationByDate({PatientId:PatientId,Module:Module,StartDate:StartDate,Num:Num}, function (data, headers) {
      deferred.resolve(data);
    }, function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  };
    return self;
}])

.factory('Patients',['$q', '$http', 'Data','Storage','$resource','CONFIG',function ($q, $http, Data,Storage,$resource,CONFIG){ //LRZ
  //get patients
  //remove certain patients
  //add  patients
  //blablabla used by two controllers

  return {
    all: function() {
      return patients_array;
    },
    remove: function(patient) {
      patients_array.splice(patients_array.indexOf(chat), 1);
    },
    get: function(patientid) {
      for (var i = 0; i < patients_array.length; i++) {
        if (patients_array[i].id === parseInt(patientid)) {
          return patients_array[i];
        }
      }
      return null;
    }
  }
}])

// --------上传头像----------------
.factory('Camera', ['$q','$cordovaCamera','CONFIG', '$cordovaFileTransfer',function($q,$cordovaCamera,CONFIG,$cordovaFileTransfer) { //LRZ
  return {
    getPicture: function() {

      var options = { 
          quality : 75, 
          destinationType : 0, 
          sourceType : 1, 
          allowEdit : true,
          encodingType: 0,
          targetWidth: 300,
          targetHeight: 300,
          popoverOptions: CONFIG.popoverOptions,
          saveToPhotoAlbum: false
      };

     var q = $q.defer();

      $cordovaCamera.getPicture(options).then(function(imageData) {
          imgURI = "data:image/jpeg;base64," + imageData;
          // console.log("succeed" + imageData);
          q.resolve(imgURI);
      }, function(err) {
          // console.log("sth wrong");
          imgURI = undefined;
          q.resolve(err);
      });      
      return q.promise; //return a promise
    },

    getPictureFromPhotos: function(){
      var options = { 
          quality : 75, 
          destinationType : 0, 
          sourceType : 0, 
          allowEdit : true,
          encodingType: 0,
          targetWidth: 300,
          targetHeight: 300
      };
        //从相册获得的照片不能被裁减 调研~
     var q = $q.defer();
      $cordovaCamera.getPicture(options).then(function(imageData) {
          imgURI = "data:image/jpeg;base64," + imageData;
          // console.log("succeed" + imageData);
          q.resolve(imgURI);
      }, function(err) {
          // console.log("sth wrong");
          imgURI = undefined;
          q.resolve(err);
      });      
      return q.promise; //return a promise      
    },

    uploadPicture : function(imgURI){
        // document.addEventListener('deviceready', onReadyFunction,false);
        // function onReadyFunction(){
          var uri = encodeURI(CONFIG.ImageAddressIP + "/upload.php");
          var options = {
            fileKey : "file",
            fileName : "ZXF" + ".jpg",
            chunkedMode : true,
            mimeType : "image/jpeg"
          };
          var q = $q.defer();
          console.log("jinlaile");
          $cordovaFileTransfer.upload(uri,imgURI,options)
            .then( function(r){
              console.log("Code = " + r.responseCode);
              console.log("Response = " + r.response);
              console.log("Sent = " + r.bytesSent);
              q.resolve(r);        
            }, function(err){
              alert("An error has occurred: Code = " + error.code);
              console.log("upload error source " + error.source);
              console.log("upload error target " + error.target);
              q.resolve(error);          
            }, function (progress) {
              console.log(progress);
            })

            ;
          return q.promise;  
        // }


        // var ft = new FileTransfer();
        // $cordovaFileTransfer.upload(imgURI, uri, win, fail, options);
      
    },

  uploadPicture2: function(imgURI){
    document.addEventListener("deviceready", onDeviceReady, false);

    function onDeviceReady() {
   // as soon as this function is called FileTransfer "should" be defined
      console.log(FileTransfer);
      console.log(File);
    }
  }
  }
}])


;
