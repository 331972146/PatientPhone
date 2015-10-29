
angular.module('zjubme.controllers', ['ionic','ngResource','zjubme.services', 'zjubme.directives', 'ja.qr','ionic-datepicker'])//,'ngRoute'

// 初装或升级App的介绍页面控制器  /暂时不用
.controller('intro', ['$scope', 'Storage', function ($scope, Storage) {
  // Storage.set('initState', 'simple.homepage');
  Storage.set('myAppVersion', myAppVersion);
}])

// --------登录注册、设置修改密码-熊佳臻----------------
//登录
.controller('SignInCtrl', ['$scope','$state','$http', '$timeout','$window', 'userservice','Storage' , function($scope, $state,$http, $timeout ,$window, userservice, Storage) {
 
  if(Storage.get('USERNAME')!=null){
    $scope.logOn={username:Storage.get('USERNAME'),password:""};
  }else{
    $scope.logOn={username:"",password:""};
  }

  $scope.signIn = function(logOn) {
    $timeout(function(){$state.go('tab.tasklist');} , 1000);
    // if((logOn.username!="") && (logOn.password!="")){ 
    //   var saveUID = function(){
    //     var UIDpromise=userservice.UID('PhoneNo',logOn.username);
    //     UIDpromise.then(function(data){
    //       if(data.result!=null){
    //         Storage.set('UID', data.result);
    //       }
    //     },function(data){
    //     });
    //   }
                
    //   var promise=userservice.userLogOn('PhoneNo' ,logOn.username,logOn.password,'Patient');
    //   if(promise==7){
    //     $scope.logStatus='手机号验证失败！';
    //     return;
    //   }
    //   promise.then(function(data){
    //     $scope.logStatus=data.result.substr(0,4);
    //     Storage.set('TOKEN', data.result.substr(12));
    //     Storage.set('USERNAME', logOn.username);
    //     saveUID();
    //     $timeout(function(){$state.go('tab.tasklist');} , 1000);
    //   },function(data){
    //     $scope.logStatus=data.data.result;
    //   });
    // }else{
    //   $scope.logStatus="请输入完整信息！";
    // }
  }

  $scope.toRegister = function(){
    $state.go('phonevalid');   
    Storage.set('setPasswordState','register');
  }
  $scope.toReset = function(){
    $state.go('phonevalid');
    Storage.set('setPasswordState','reset');
  } 
}])

//注册
.controller('userdetailCtrl',['$scope','$state','$cordovaDatePicker','$rootScope','$timeout' ,'userservice','Storage' ,function($scope,$state,$cordovaDatePicker,$rootScope,$timeout,userservice,Storage){
  $scope.birthday="点击设置";
  var datePickerCallback = function (val) {
    if (typeof(val) === 'undefined') {
      console.log('No date selected');
    } else {
      $scope.datepickerObject.inputDate=val;
      var dd=val.getDate();
      var mm=val.getMonth()+1;
      var yyyy=val.getFullYear();
      var birthday=yyyy+'/'+mm+'/'+dd;
      $scope.birthday=birthday;
    }
  };

  var  monthList=["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"];
  var weekDaysList=["日","一","二","三","四","五","六"];
  $scope.datepickerObject = {
    titleLabel: '出生日期',  //Optional
    todayLabel: '今天',  //Optional
    closeLabel: '取消',  //Optional
    setLabel: '设置',  //Optional
    setButtonType : 'button-assertive',  //Optional
    todayButtonType : 'button-assertive',  //Optional
    closeButtonType : 'button-assertive',  //Optional
    inputDate: new Date(),    //Optional
    mondayFirst: false,    //Optional
    //disabledDates: disabledDates, //Optional
    weekDaysList: weekDaysList,   //Optional
    monthList: monthList, //Optional
    templateType: 'popup', //Optional
    showTodayButton: 'false', //Optional
    modalHeaderColor: 'bar-positive', //Optional
    modalFooterColor: 'bar-positive', //Optional
    from: new Date(1900, 1, 1),   //Optional
    to: new Date(),    //Optional
    callback: function (val) {    //Mandatory
      datePickerCallback(val);
    }
  };  
  // $scope.birthdaySet = function(){     //ngCordova DatePicker
  //   var options = {
  //     date: new Date(),
  //     mode: 'date', // or 'time'
  //     // minDate: new Date() - 10000,
  //     // allowOldDates: true,
  //     // allowFutureDates: false,
  //     // doneButtonLabel: 'DONE',
  //     // doneButtonColor: '#F2F3F4',
  //     // cancelButtonLabel: 'CANCEL',
  //     // cancelButtonColor: '#000000'
  //   };
  //   $cordovaDatePicker.show(options).then(function(date){
  //       alert(date);
  //   })
  // }
  $scope.infoSetup = function(userName,userGender){

    // var activition = function(){

    //   var UIDpromise=userservice.UID('PhoneNo',$rootScope.userId);
    //   UIDpromise.then(function(data){
    //     var uid=data.result;
    //     if(uid!=null){
    //       userservice.Activition(uid,)
    //     }
    //   },function(data){
    //   });
    // }
    console.log(userName,userGender,$scope.birthday);
    var promise=userservice.userRegister("PhoneNo",$rootScope.userId, userName, $rootScope.password,"Patient");
    promise.then(function(data){
      $scope.logStatus=data.result;
      //activition();
    },function(data){
      $scope.logStatus=data.data.result;
    });
    //以下临时跳转
    $timeout(function(){$state.go('tab.tasklist');} , 2000);

  }
}])

//设置密码
.controller('setPasswordCtrl', ['$scope','$state','$rootScope' ,'$timeout' , 'userservice','Storage',function($scope,$state,$rootScope,$timeout,userservice,Storage) {
  var setPassState=Storage.get('setPasswordState');
  if(setPassState=='reset'){
    $scope.headerText="重置密码";
    $scope.buttonText="确认修改";
  }else{
    $scope.headerText="设置密码";
    $scope.buttonText="下一步";
  }
  $scope.setPassword={newPass:"" , confirm:""};
  $scope.resetPassword=function(setPassword){
    if((setPassword.newPass!="") && (setPassword.confirm!="")){
      if(setPassword.newPass == setPassword.confirm){
        if(setPassState=='register'){
          $rootScope.password=setPassword.newPass;
          $state.go('userdetail');
        }else{
          var userId=Storage.get('UID');
          var promise=userservice.changePassword('#*bme319*#',setPassword.newPass,userId);
          promise.then(function(data,status){
            $scope.logStatus=data.result;
            if(data.result=='修改密码成功'){
              $timeout(function(){$state.go('tab.tasklist');} , 500);
            }
          },function(data){
            $scope.logStatus=data.data.result;
          });
          //以下临时跳转
          $timeout(function(){$state.go('tab.tasklist');} , 3000);
        }
      }else{
        $scope.logStatus="两次输入的密码不一致";
      }
    }else{
      $scope.logStatus="请输入两遍新密码"
    }
  }
}])

//修改密码
.controller('changePasswordCtrl',['$scope','$state','$timeout', 'userservice','Storage', '$ionicHistory', function($scope , $state,$timeout, userservice,Storage, $ionicHistory){
  $scope.ishide=true;
  $scope.change={oldPassword:"",newPassword:"",confirmPassword:""};
  $scope.passwordCheck = function(change){
    var promiseold=userservice.userLogOn('PhoneNo',Storage.get('USERNAME'),change.oldPassword,'Patient');
    promiseold.then(function(data){
      $scope.logStatus1='验证成功';
      //$scope.ishide=false;
      $timeout(function(){$scope.ishide=false;} , 500);
    },function(data){
      $scope.logStatus='密码错误';
    });
  }

  $scope.gotoChange = function(change){
    if((change.newPassword!="") && (change.confirmPassword!="")){
      if(change.newPassword == change.confirmPassword){
        var promiseSet=userservice.changePassword(change.oldPassword,change.newPassword,Storage.get('UID'));
        promiseSet.then(function(data){
          $scope.logStatus2='修改成功';
          $timeout(function(){$scope.change={originalPassword:"",newPassword:"",confirmPassword:""};
          $state.go('tab.tasklist');
          $scope.ishide=true;
          } , 500);
        },function(data){
          $scope.logStatus2=data.data.result;
        })
      }else{
        $scope.logStatus2="两次输入的密码不一致";
      }
    }else{
      $scope.logStatus2="请输入两遍新密码"
    }
  }

  $scope.nvGoback = function() {
    $ionicHistory.goBack();
  }
}])

//获取验证码
.controller('phonevalidCtrl', ['$scope','$state','$interval','$rootScope', 'Storage', 'userservice', function($scope, $state,$interval,$rootScope,Storage,userservice) {
  var setPassState=Storage.get('setPasswordState');

  $scope.veriusername="" 
  $scope.verifyCode="";
  $scope.veritext="获取验证码";


  
  $scope.gotoReset = function(veriusername,verifyCode){
    //$state.go('setpassword');
    if(veriusername!=0 && verifyCode!=0){
      console.log(veriusername,'varification',verifyCode);
      var promise=userservice.checkverification(veriusername,'verification',verifyCode);
      promise.then(function(data){
        console.log(data);
        if(data.result==1){
          $scope.logStatus='验证成功';
          $state.go('setpassword');
        }
        $scope.logStatus=data.result;
      },function(data){
        console.log(data);
        $scope.logStatus=data.statusText;
        //测试用，以下强行跳转
        var time=1,timer;
        timer = $interval(function(){
          if(time==0){
            $interval.cancel(timer);
            timer=undefined;        
            $state.go('setpassword');        
          }else{
            time--;
          }
        },2000);
        //
    });
    }else{
      $scope.logStatus="请输入完整信息！"
    }

  }
  
  $scope.isable=false;
  $scope.getcode=function(veriusername){
    $rootScope.userId=veriusername;
    var sendSMS = function(){  
      var promiseSMS=userservice.sendSMS(veriusername,'verification');
      if(promise==7){
        $scope.logStatus='手机号验证失败！';
        return;
      }
      promiseSMS.then(function(data){
          $scope.logStatus='您的验证码已发送';
      },function(data){
        $scope.logStatus=data.statusText;
      }) 
    }; 
    if(Storage.get('setPasswordState')!='register'){
      var promise=userservice.UID('PhoneNo',veriusername);
      if(promise==7){
        $scope.logStatus='手机号验证失败！';
        return;
      }
      promise.then(function(data){
        if(data.result!=null){
          Storage.set('UID',data.result);
          sendSMS();//发送验证码
        }else{
          Storage.set('UID','');
          $scope.logStatus="用户不存在";
        }
      },function(data){
        $scope.logStatus=data.statusText;
      })
    }else{
      sendSMS();
    }

    $scope.isable=true;//BUTTON效果
    $scope.veritext="5S再次发送"; 
    var time = 4;
    var timer;
    timer = $interval(function(){
      if(time==0){
        $interval.cancel(timer);
        timer=undefined;        
        $scope.veritext="获取验证码";       
        $scope.isable=false;
      }else{
        $scope.veritext=time+"S再次发送";
        time--;
      }
    },1000);
  }
}])

// --------任务列表-马志彬----------------
//侧边提醒
.controller('SlidePageCtrl', ['$scope', '$ionicHistory', '$timeout', '$ionicModal', '$ionicSideMenuDelegate', '$http','NotificationService',
   function($scope, $ionicHistory, $timeout, $ionicModal, $ionicSideMenuDelegate, $http,NotificationService) {
      $scope.text = 'Hello World!';
      ////获取任务列表数据
      // $http.get('testdata/tasklist.json').success(function(data){
      //  $scope.tasklist = data;
      // })
      ///获取菜单栏列表数据
      $http.get('data/catalog.json').success(function(data){
        $scope.catalog = data;
      })
      $scope.toggleProjects = function() {
        $ionicSideMenuDelegate.toggleLeft();
      };
      $scope.nvGoback = function() {
        $ionicHistory.goBack();
      }
      $scope.lastviewtitle = $ionicHistory.backTitle();
      ////////////设置提醒/////////////
      $ionicModal.fromTemplateUrl('partials/other/addalert.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.modal = modal;
      });
      $scope.openModal = function(i) {
        console.log(i);
        $scope.modal.show(); 
        $scope.alertcontent=
        {
          title:'',
          detail:'',
          time:new Date(),
          hour:(new Date()).getHours(),
          minute:(new Date()).getMinutes(),
          index:0,
          ID:parseInt(Math.random()*1000+1)
        };
        if(i!=undefined)
        {
          $scope.alertcontent=i;
          $scope.flag='update';
        }
        $scope.timePickerObject.inputEpochTime=((new Date()).getHours() * 60 * 60+(new Date()).getMinutes()*60);
      };
      $scope.closeModal = function() {
        $scope.modal.hide();
      };
      $scope.alertlist = NotificationService.get();
      $scope.timePickerObject = {
        inputEpochTime: ((new Date()).getHours() * 60 * 60+(new Date()).getMinutes()*60),  //Optional
        step: 1,  //Optional
        format: 24,  //Optional
        titleLabel: '选择时间',  //Optional
        setLabel: '确认',  //Optional
        closeLabel: '取消',  //Optional
        setButtonType: 'button-positive',  //Optional
        closeButtonType: 'button-stable',  //Optional
        callback: function (val) {    //Mandatory
          timePickerCallback(val);
        }
      };
      function timePickerCallback(val) {
        if (typeof (val) === 'undefined') {
          console.log('Time not selected');
        } else {
          var SelectedTime = new Date(val * 1000);
          $scope.alertcontent.time.setHours(SelectedTime.getUTCHours());
          $scope.alertcontent.time.setMinutes(SelectedTime.getUTCMinutes());
          $scope.alertcontent.time.setSeconds(0);
          $scope.alertcontent.hour = SelectedTime.getUTCHours();
          $scope.alertcontent.minute = SelectedTime.getUTCMinutes();
          console.log('Selected epoch is : ', val, 'and the time is ', SelectedTime.getUTCHours(), ':', SelectedTime.getUTCMinutes(), 'in UTC');
        }
      };
      $scope.save = function()
      {
        console.log($scope.flag);
        if($scope.flag=='update')
        {
          $scope.flag='save';
          NotificationService.update($scope.alertcontent);
          $scope.alertlist = NotificationService.get();
          $scope.closeModal();
        }else{
          console.log('save');
          console.log($scope.alertcontent);
          NotificationService.save($scope.alertcontent);
          $scope.alertlist = NotificationService.get();
          console.log($scope.alertlist);
          $scope.closeModal();
        }
      }
      $scope.remove = function(index)
      {
        console.log(index);
        NotificationService.remove(index);
        $scope.alertlist = NotificationService.get();
      }
  /////////////////////////
}])

//任务详细
.controller('taskdetailcontroller',['$scope','$ionicModal','$stateParams','$state','extraInfo', 'TaskInfo',
 function($scope,$ionicModal,$stateParams,$state,extraInfo,TaskInfo) {
  var data={"ParentCode":$stateParams.tl,"PlanNo":"C001","Date":"NOW","PatientId":'CP001'};
  ionic.DomUtil.ready(function(){
    get();
  })
  $scope.doRefresh = function() {
    get();
  }
  var get = function()
  {
    TaskInfo.GetTasklist(data).then(function(s){
      console.log(s);
      $scope.$broadcast('scroll.refreshComplete');
      $scope.taskdetaillist = TaskInfo.insertstate(s);
    },function(e){
      console.log(e);
      $scope.$broadcast('scroll.refreshComplete');
    });
  }
  $scope.done = function(index)
  {
    console.log(index);
    TaskInfo.done($scope.taskdetaillist[index],data.PlanNo).then(function(s){
      console.log(s);
      $scope.taskdetaillist[index].Status='1';
      extraInfo.refreshflag('set','graphRefresh');
    })
  }
}])

//任务列表
.controller('tasklistcontroller',['$scope','$ionicModal','$timeout','$http', 'TaskInfo','extraInfo',function($scope,$ionicModal,$timeout,$http,TaskInfo,extraInfo) {
  var data={"ParentCode":"T","PlanNo":"C001","Date":"NOW","PatientId":'CP001'};
  ionic.DomUtil.ready(function(){
    get();
  });
  $scope.doRefresh = function() {
    get();
  }
  var get = function()
  {
    TaskInfo.GetTasklist(data).then(function(s){
      console.log(s);
      $scope.$broadcast('scroll.refreshComplete');
      $scope.tasklist = s;
    },function(e){
      console.log(e);
      $scope.$broadcast('scroll.refreshComplete');
    });
    // $http.get('testdata/tasklist.json').success(function(data){
    //  $scope.tasklist = TaskInfo.insertstate(data);
    // })
  }
}])

//血压
.controller('bpmcontroller',['$scope',  '$timeout', '$cordovaBluetoothSerial', '$ionicLoading', '$cordovaBLE', 'BloodPressureMeasure', '$ionicModal', 'VitalInfo','extraInfo',
  function($scope,  $timeout, $cordovaBluetoothSerial, $ionicLoading, $cordovaBLE, BloodPressureMeasure, $ionicModal, VitalInfo,extraInfo){
    console.log('bpmcontroller');
    var bpc=BloodPressureMeasure.BloodPressureChart();
    var chart = AmCharts.makeChart("chartdiv",bpc,500);
    $scope.device_a='';
    $scope.device_c='';
    $scope.showscanicon=false;
    $scope.btstatus='正在准备设备，请稍等。。。';
    var highbp=VitalInfo.InsertServerData();
      highbp.Unit='mmHg';
      highbp.ItemType='Bloodpressure';
      highbp.ItemCode='Bloodpressure_1';
    var lowbp=VitalInfo.InsertServerData();
      lowbp.Unit='mmHg';
      lowbp.ItemType='Bloodpressure';
      lowbp.ItemCode='Bloodpressure_2';
    var jn=VitalInfo.InsertServerData();
      jn.Unit='次/分';
      jn.ItemType='Pulserate';
      jn.ItemCode='Pulserate_1';
    // var highbp,lowbp,jn;
    var btstart=new Uint8Array(9);
    var BPdata=new Uint8Array(30);
    ionic.DomUtil.ready(function()
    {
      setInterval(function()
      {
        $cordovaBluetoothSerial.available().then(//有多少位数据
          function(numBytes){
            if(numBytes==8)
            {
              for(var i=0;i<numBytes;i++)
              {
                readbloothbuffer(i,1);
              }
              $scope.btstatus='已准备好设备，请点击"测量"按钮开始测量';
            }else if(numBytes==30)
            {
              getbpmdata();
              $timeout(function(){
                $scope.btstatus='测量完毕';
                $scope.DisConnect();
                $ionicLoading.hide();
              },500)
            }
          },
          function(){$scope.btstatus='设备故障，请点击手动设置';}
        );
      },1000);
      ConnectedList();
      $cordovaBluetoothSerial.isConnected().then(
        function(){},
        function(){
          $cordovaBluetoothSerial.connect('8C:DE:52:99:26:23').then(
            function(){
              $timeout(function(){
                StartMeasure();
              },1000)
            },
            function(error){
              $scope.btstatus='设备连接失败，请确保设备正常，点此手动设置';
            }
          );
        }
      );
    });
    $scope.isBleEnable = function()
    {
      //document.addEventListener('deviceready', function () {
      $cordovaBluetoothSerial.isEnabled().then(
        function(success){
          alert('bluetooth is available');
        },
        function(error){
          alert('err! bluetooth is not available')
        }
      );
     // }, false);
    }
    $scope.EnableBle = function()
    {
      $cordovaBluetoothSerial.enable().then(
        function(success){
          alert('enable bluetooth');
        },
        function(error){
          alert('err! enable bluetooth failure')
        }
      );
    }
    $scope.ScanDevices = function()
    {
      $scope.showscanicon=true;
      $cordovaBluetoothSerial.discoverUnpaired().then(
        function(success){
          $scope.device_a=success;
          $scope.showscanicon=false;
        },
        function(error){
          alert('err! Can not Scan Devices')
        }
      );
    }
    $scope.ConnectDevice = function(address)
    {
      alert('click connect button'+address);
      $ionicLoading.show({
        template: '<ion-spinner icon="lines" class="spinner-calm"></ion-spinner><br/>正在连接蓝牙设备，请稍等。。。',
        noBackdrop: false,
        duration: 10000,
        hideOnStateChange: true
      });
      $cordovaBluetoothSerial.connect(address).then(
        function(){
          $ionicLoading.hide();
          $scope.ConnectedList();
        },
        function(error){
          $ionicLoading.hide();
          alert('connect failure');
        }
      );
    }
    var ConnectedList = function()
    {
      $cordovaBluetoothSerial.list().then(
        function(devices) {
            $scope.device_c=devices;
        },
        function(){
            alert("Err");
      });
    }
    $scope.DisConnect = function()
    {
      $cordovaBluetoothSerial.disconnect(
        function(){
          alert("disconnect");
        },
        function(err){
          alert(err);
        }
      );
    }
    $scope.IsConnected = function()
    {
      alert("click IsConnected");
      $cordovaBluetoothSerial.isConnected().then(
        function(){
          alert("IsConnected");
        },
        function(){
          alert("Connectting...");
        }
      );
    }
    $scope.ReadBTbuffer = function()
    {
      $cordovaBluetoothSerial.available().then(
        function(numBytes){
          alert("There are " + numBytes + " available to read.");
          for(var i=0;i<numBytes;i++)
          {
            readbloothbuffer(i);
          }
        },
        function(){}
      );
    }
    var readbloothbuffer = function(i,flag)
    {
      if(flag==1)
      {
        $cordovaBluetoothSerial.read().then(
          function(data){
            (data==null)?btstart[i]=0x00:btstart[i]=data.charCodeAt(0);
          },
          function(){}
        );
      }else if(flag==2)
      {
        $cordovaBluetoothSerial.read().then(
          function(data){
            (data==null)?BPdata[i]=0x00:BPdata[i]=data.charCodeAt(0);
          },
          function(){}
        );
      }
    }
    var StartMeasure = function()
    {
      $cordovaBluetoothSerial.isConnected().then(//首先判断是否连接了蓝牙设备
        function(){
          $cordovaBluetoothSerial.clear().then(//如果连接了设备，先清除蓝牙缓存，随后发送探查指令，等待设备返回序列号等信息
            function(){
              $cordovaBluetoothSerial.write(BloodPressureMeasure.FindCommand()).then(//发送探查指令
                function()
                {},
                function(){
                  $scope.btstatus='设备故障，请点击手动设置';
                  alert('write data error');
                }
              );
            },function(){$scope.btstatus='设备故障，请点击手动设置';}
          );
        },
        function(){
          $scope.btstatus='设备故障，请点击手动设置';
        }
      );
    }
    $scope.realstart = function()
    {
      if($scope.btstatus == '正在准备设备，请稍等。。。')
      {
        alert('正在准备设备，请稍等。。。')
      }else if($scope.btstatus == '正在测量，请稍等。。。')
      {
        alert('正在测量，请稍等。。。');
      }else{
        $scope.btstatus='正在测量，请稍等。。。';
        $ionicLoading.show({
          template: '<ion-spinner icon="lines" class="spinner-calm"></ion-spinner><br/>正在测量，请稍等。。。',
          noBackdrop: false,
          duration: 100000,
          hideOnStateChange: true
        });
        var errcheck=setInterval(function()
        {
          $cordovaBluetoothSerial.isConnected().then(
            function(){
            },
            function(){
              $ionicLoading.hide();
              if($scope.btstatus=='正在测量，请稍等。。。')
              {
                alert('设备异常');
                $scope.btstatus='设备异常';
                clearInterval(errcheck);
              }else{
                //alert('clearInterval');
                clearInterval(errcheck);
              }
            }
          );
        },1000);
        $cordovaBluetoothSerial.write(BloodPressureMeasure.StartCommand(btstart)).then(//发送开始测量指令
          function(){
            //正在测量
          },
          function(){}
        );
      }
    }
    var getbpmdata = function()
    {
      $cordovaBluetoothSerial.available().then(//有多少位数据
        function(numBytes){
          for(var i=0;i<numBytes;i++)
          {
            readbloothbuffer(i,2);
          }
        },
        function(){}
      );
      $timeout(function() {
        escape(BPdata[16])!=0?highbp.Value=escape(BPdata[16]):highbp='';
        escape(BPdata[17])!=0?lowbp.Value=escape(BPdata[17]):lowbp='';
        escape(BPdata[19])!=0?jn.Value=escape(BPdata[19]):jn='';
        validatechart(highbp.Value,lowbp.Value,jn.Value);
      }, 500);
    }
    var validatechart=function(hbp,lbp,jn)
    {
      console.log(chart.dataProvider[0].points);
      chart.dataProvider[0].points=hbp;
      chart.dataProvider[1].points=lbp;
      chart.dataProvider[2].points=jn;
      chart.graphs[0].labelText="[[points]][[Unit]]";
      chart.allLabels[0].text=BloodPressureMeasure.BPConclusion(highbp.Value,lowbp.Value);
      chart.validateData();
    };    
    $scope.save = function(){
      if($scope.btstatus=='测量完毕')
      {
         VitalInfo.PostPatientVitalSigns(highbp).then(function(r){
            VitalInfo.PostPatientVitalSigns(lowbp).then(function(r){
              VitalInfo.PostPatientVitalSigns(jn).then(function(r){
                alert('savesuccess');
                extraInfo.refreshflag('set','graphRefresh');
                extraInfo.refreshflag('set','recordlistrefresh');
                refreshflag
              },function(e){alert('e.result');});
            },function(e){alert('e.result');});
         },function(e){alert('e.result');}); 
      }
    };
    $ionicModal.fromTemplateUrl('setbt.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });
    $scope.openModal = function() {
      if($scope.btstatus == '正在测量，请稍等。。。')
      {
        alert('正在测量，请稍等。。。');
      }else{
        $scope.modal.show();
      }      
    };
    $scope.closeModal = function() {
      $scope.modal.hide();
    };
}])

.controller('healtheducationcontroller',['$scope', '$cordovaInAppBrowser', '$cordovaMedia', '$http', '$ionicModal',function($scope, $cordovaInAppBrowser, $cordovaMedia, $http, $ionicModal){
  $http.get('testdata/HElist.json').success(function(data){
    $scope.helist = data;
    console.log($scope.helist);
  });
  $ionicModal.fromTemplateUrl('my-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });
  var options = {
    location: 'no',
    clearcache: 'yes',
    toolbar: 'no'};
  $scope.play = function(r)
  {
    if(r.Type=='mp3'||r.Type=='mp4')
    {
      console.log('openUrl');
      $scope.modal.show();
      $scope.mediatitle=r.name;
      $scope.mediadescribe=r.describe;
      document.getElementById("myVideo").src=r.Url;
      document.getElementById("myVideo").poster=r.poster;
      //$cordovaInAppBrowser.open(url, '_blank', options);
    }else if(r.Type=='jpg')
    {
      console.log('openUrl');
      $cordovaInAppBrowser.open(r.Url, '_blank', options);
    }
     
  }
  $scope.closeModal = function() {
    $scope.modal.hide();
  };
}])

.controller('measureweightcontroller',['$scope', function($scope){
  $scope.BMI={}
  $scope.test = function()
  {
    $scope.BMI.BMI=($scope.BMI.weight/($scope.BMI.height*$scope.BMI.height));
    console.log($scope.BMI.BMI);
  }
}])

.controller('alertcontroller',['$scope', '$timeout', '$ionicModal', '$ionicHistory', '$cordovaDatePicker','$cordovaLocalNotification','NotificationService',
function($scope, $timeout, $ionicModal,$ionicHistory, $cordovaDatePicker,$cordovaLocalNotification, NotificationService) {
  // $scope.nvGoback = function() {
  //   $ionicHistory.goBack();
  // }
  // $scope.lastviewtitle = $ionicHistory.backTitle();
}])

// --------依从率图-李山----------------
//目标公共界面
.controller('TargetCtrl', ['$scope', '$http','$ionicSideMenuDelegate','$timeout','$ionicPopup',
    function($scope, $http, $ionicSideMenuDelegate,$timeout, $ionicPopup) {

       $scope.toggleLeftMenu = function() {
          $ionicSideMenuDelegate.toggleLeft();
       }; 
  }])

//目标-图表
.controller('graphcontroller', ['$scope', '$http','$ionicSideMenuDelegate','$timeout','$state','$window','$ionicPopover', 'PlanInfo','$ionicLoading', 'Storage',
    function($scope, $http, $ionicSideMenuDelegate,$timeout, $state, $window, $ionicPopover, PlanInfo, $ionicLoading, Storage) {

       //固定变量guide 也可读自json文件
       var SBPGuide='';
       var DBPGuide='';
       var PulseGuide='';
       var BloodGlucoseGuide='';
       //SBPGuide=[{"value":"129","toValue":"#CC0000","label":"","lineColor":"#FF5151","lineAlpha":"1","dashLength":"8","color":"#CC0000","fontSize":"8","position":"right","inside":"","fillAlpha":"","fillColor":""},{"value":"110","toValue":"#CC0000","label":"","lineColor":"#CC0000","lineAlpha":"1","dashLength":"4","color":"#CC0000","fontSize":"14","position":"right","inside":"","fillAlpha":"","fillColor":""},{"value":"90","toValue":"120","label":"偏低","lineColor":"","lineAlpha":"","dashLength":"","color":"#CC0000","fontSize":"14","position":"right","inside":"true","fillAlpha":"0.1","fillColor":"#8080C0"},{"value":"120","toValue":"140","label":"正常","lineColor":"","lineAlpha":"","dashLength":"","color":"#CC0000","fontSize":"14","position":"right","inside":"true","fillAlpha":"0.1","fillColor":"#00DB00"},{"value":"140","toValue":"160","label":"警戒","lineColor":"","lineAlpha":"","dashLength":"","color":"#CC0000","fontSize":"14","position":"right","inside":"true","fillAlpha":"0.1","fillColor":"#FFA042"},{"value":"160","toValue":"180","label":"偏高","lineColor":"","lineAlpha":"","dashLength":"","color":"#CC0000","fontSize":"14","position":"right","inside":"true","fillAlpha":"0.1","fillColor":"#FF60AF"},{"value":"180","toValue":"200","label":"很高","lineColor":"","lineAlpha":"","dashLength":"","color":"#CC0000","fontSize":"14","position":"right","inside":"true","fillAlpha":"0.1","fillColor":"#FF0000"},{"value":"90","toValue":"#CC0000","label":"90","lineColor":"#CC0000","lineAlpha":"0.15","dashLength":"","color":"#CC0000","fontSize":"8","position":"left","inside":"","fillAlpha":"","fillColor":""},{"value":"120","toValue":"#CC0000","label":"120","lineColor":"#CC0000","lineAlpha":"0.15","dashLength":"","color":"#CC0000","fontSize":"8","position":"left","inside":"","fillAlpha":"","fillColor":""},{"value":"140","toValue":"#CC0000","label":"140","lineColor":"#CC0000","lineAlpha":"0.15","dashLength":"","color":"#CC0000","fontSize":"8","position":"left","inside":"","fillAlpha":"","fillColor":""},{"value":"160","toValue":"#CC0000","label":"160","lineColor":"#CC0000","lineAlpha":"0.15","dashLength":"","color":"#CC0000","fontSize":"8","position":"left","inside":"","fillAlpha":"","fillColor":""},{"value":"180","toValue":"#CC0000","label":"180","lineColor":"#CC0000","lineAlpha":"0.15","dashLength":"","color":"#CC0000","fontSize":"8","position":"left","inside":"","fillAlpha":"","fillColor":""},{"value":"200","toValue":"#CC0000","label":"200","lineColor":"#CC0000","lineAlpha":"0.15","dashLength":"","color":"#CC0000","fontSize":"8","position":"left","inside":"","fillAlpha":"","fillColor":""}];
       //DBPGuide=[{"value":"85","toValue":"#CC0000","label":"","lineColor":"#FF5151","lineAlpha":"1","dashLength":"8","color":"#CC0000","fontSize":"8","position":"right","inside":"","fillAlpha":"","fillColor":""},{"value":"70","toValue":"#CC0000","label":"","lineColor":"#CC0000","lineAlpha":"1","dashLength":"4","color":"#CC0000","fontSize":"14","position":"right","inside":"","fillAlpha":"","fillColor":""},{"value":"40","toValue":"60","label":"偏低","lineColor":"","lineAlpha":"","dashLength":"","color":"#CC0000","fontSize":"14","position":"right","inside":"true","fillAlpha":"0.1","fillColor":"#8080C0"},{"value":"60","toValue":"80","label":"正常","lineColor":"","lineAlpha":"","dashLength":"","color":"#CC0000","fontSize":"14","position":"right","inside":"true","fillAlpha":"0.1","fillColor":"#00DB00"},{"value":"80","toValue":"100","label":"警戒","lineColor":"","lineAlpha":"","dashLength":"","color":"#CC0000","fontSize":"14","position":"right","inside":"true","fillAlpha":"0.1","fillColor":"#FFA042"},{"value":"100","toValue":"120","label":"偏高","lineColor":"","lineAlpha":"","dashLength":"","color":"#CC0000","fontSize":"14","position":"right","inside":"true","fillAlpha":"0.1","fillColor":"#FF60AF"},{"value":"120","toValue":"140","label":"很高","lineColor":"","lineAlpha":"","dashLength":"","color":"#CC0000","fontSize":"14","position":"right","inside":"true","fillAlpha":"0.1","fillColor":"#FF0000"},{"value":"40","toValue":"#CC0000","label":"40","lineColor":"#CC0000","lineAlpha":"0.15","dashLength":"","color":"#CC0000","fontSize":"8","position":"left","inside":"","fillAlpha":"","fillColor":""},{"value":"60","toValue":"#CC0000","label":"60","lineColor":"#CC0000","lineAlpha":"0.15","dashLength":"","color":"#CC0000","fontSize":"8","position":"left","inside":"","fillAlpha":"","fillColor":""},{"value":"80","toValue":"#CC0000","label":"80","lineColor":"#CC0000","lineAlpha":"0.15","dashLength":"","color":"#CC0000","fontSize":"8","position":"left","inside":"","fillAlpha":"","fillColor":""},{"value":"100","toValue":"#CC0000","label":"100","lineColor":"#CC0000","lineAlpha":"0.15","dashLength":"","color":"#CC0000","fontSize":"8","position":"left","inside":"","fillAlpha":"","fillColor":""},{"value":"120","toValue":"#CC0000","label":"120","lineColor":"#CC0000","lineAlpha":"0.15","dashLength":"","color":"#CC0000","fontSize":"8","position":"left","inside":"","fillAlpha":"","fillColor":""},{"value":"140","toValue":"#CC0000","label":"140","lineColor":"#CC0000","lineAlpha":"0.15","dashLength":"","color":"#CC0000","fontSize":"8","position":"left","inside":"","fillAlpha":"","fillColor":""}];
       
       $http.get('data/guide-sbp.json').success(function(data) {
         SBPGuide=data;  //json文件前两项分别为 初始线 和目标线
       });

       $http.get('data/guide-dbp.json').success(function(data) {
         DBPGuide=data;
       });

      $http.get('data/guide-pulse.json').success(function(data) {
         PulseGuide=data;
       });

      $http.get('data/guide-bloodGlucose.json').success(function(data) {
         BloodGlucoseGuide=data;
       });

       //var PulseGuide=  
       var ChartData=""; //图形数据
       var chart="";  //图形对象 全局变量target-phone
      
      
      //初始化
      init_graph();

      $scope.toggleLeftMenu = function() {
          $ionicSideMenuDelegate.toggleLeft();
      };
      
      //弹框初始化
      var template = '<ion-popover-view style="opacity:1"></ion-popover-view>';
      var popover=$ionicPopover.fromTemplate(template);


      //监视进入页面
      $scope.$on('$ionicView.enter', function() {   //$viewContentLoaded
          //console.log("enter graphView") ;
          if(Storage.get('graphRefresh')=='1') //任务完成或插入体征则刷新
          {
            init_graph();
            Storage.set('graphRefresh','0');
          }
          
      });
      
      //提升切换  切换上图Y轴、标题、分级guide
     $scope.changeVitalInfo = function(option) {

         changeDataset(option.SignCode);
         //setTimeout(function(){$ionicLoading.hide();},500);
     };

      //初始化函数
    function init_graph()
    {
        $ionicLoading.show({
          template: '<ion-spinner style="height:2em;width:2em"></ion-spinner>'
         });

        //体征下拉框 默认收缩压
        $scope.options = [{"SignName":"收缩压","SignCode":"Bloodpressure|Bloodpressure_1"},{"SignName":"舒张压","SignCode":"Bloodpressure|Bloodpressure_2"},{"SignName":"脉率","SignCode":"Pulserate|Pulserate_1"},{"SignName":"血糖","SignCode":"BloodGlucose|BloodGlucose_1"}];
        $scope.vitalInfo =$scope.options[0];

        //从restful或者jon文件获取数据
        $http.get('data/newphone.json').success(function(data) {
          //ChartData = data;
          createStockChart(data); //画图
          setTimeout(function(){
            chart.panels[1].addListener("clickGraphItem",showDetailInfo); 
            $ionicLoading.hide();
            chart.panels[0].valueAxes[0].guides=SBPGuide; //添加分级guide
            chart.validateNow();
        },300); //添加点击事件
        });
  
    }

     //体征切换函数
    var changeDataset = function(ItemCode) {
       //切换上图Y值数据源，目前不需连restful
       //同时修改初始值和目标值，有显示，无则隐藏  未做
       if(ItemCode=="Bloodpressure|Bloodpressure_1")
        {
          chart.panels[0].title="收缩压 （单位：mmHg）";
          chart.panels[0].stockGraphs[0].valueField="SBPValue";
          chart.panels[0].valueAxes[0].minimum=80;
          chart.panels[0].valueAxes[0].maximum=200;
          chart.panels[0].valueAxes[0].guides=SBPGuide; 
        }
        else if(ItemCode=="Bloodpressure|Bloodpressure_2")
        {
          chart.panels[0].title="舒张压 （单位：mmHg）";
          chart.panels[0].stockGraphs[0].valueField="DBPValue";
          chart.panels[0].valueAxes[0].minimum=60;
          chart.panels[0].valueAxes[0].maximum=130;
          chart.panels[0].valueAxes[0].guides=DBPGuide; 
        }
        else if(ItemCode=="Pulserate|Pulserate_1")
        {
          chart.panels[0].title="脉率 （单位：次/分）";
          chart.panels[0].stockGraphs[0].valueField="PulseValue";
          chart.panels[0].valueAxes[0].minimum=0;
          chart.panels[0].valueAxes[0].maximum=150;
          chart.panels[0].valueAxes[0].guides=PulseGuide; 
          console.log(PulseGuide);
        }
        else
        {
           chart.panels[0].title="血糖 （单位：mmol/L）";
           chart.panels[0].stockGraphs[0].valueField="BloodGlucose";
           chart.panels[0].valueAxes[0].minimum=0;
           chart.panels[0].valueAxes[0].maximum=15;
           chart.panels[0].valueAxes[0].guides=BloodGlucoseGuide; 
        }

        chart.validateData();
        chart.validateNow(); 

     }//function end 

 
     //画图函数
     function createStockChart(ChartData) {
        
        chart="";
        chart=AmCharts.makeChart("chartdiv", {
          type: "stock",
          pathToImages: "img/amcharts/",
          dataDateFormat:"YYYYMMDD",
          categoryAxesSettings: {
            //minPeriod: "mm"
            parseDates: true,
            minPeriod:"DD",
            dateFormats:[{
              period: 'DD',
              format: 'MM/DD'
            }, {
              period: 'WW',
              format: 'MM DD'
            }, {
              period: 'MM',
              format: 'MM/DD'
            }, {
              period: 'YYYY',
              format: 'YYYY'
            }]
          },
          dataSets: [{  
            fieldMappings: [  
              {fromField: "SBPValue",toField: "SBPValue"},
              {fromField: "DBPValue",toField: "DBPValue"},
              {fromField: "PulseValue",toField: "PulseValue"},
              {fromField: "BloodGlucose",toField: "BloodGlucose"},
              {fromField: "BulletValue",toField: "BulletValue"}],
            //color: "#fac314",
            dataProvider: ChartData.GraphList, //数据集   
            //title: "体征和任务依从情况",
            categoryField: "Date"
          }],
          valueAxesSettings:{
            inside:true,
            reversed:false
          //labelsEnabled:true        
          },  
          PanelsSettings:{   
           //marginTop:90,
           //marginRight:90,
           //panelSpacing:400,
           // plotAreaBorderAlpha:1,
           // plotAreaBorderColor:"#000000"
           //usePrefixes: true,
          autoMargins:false
        },
        //autoMargins:false,
        panels: [{
          title: "血压 （单位：mmHg）",
          showCategoryAxis: false,
          percentHeight: 65,
          autoMargins:false,
            //marginTop:300,
            //marginLeft:90,
            //marginRight:90,
            valueAxes: [{
              id:"v1",
              //strictMinMax:true,
              //logarithmic : true,
              //baseValue:115,     //起始值，Y线
              //dashLength: 5,   //虚线
              //title:"血压",
              //axisThickness:4,
              showFirstLabel:true,
              showLastLabel:true,
              //inside:false,
              gridAlpha : 0,
              //labelOffset:0,
              labelsEnabled : false,
              minimum: 80,  
              maximum: 200,  
              guides:''   //区域划分ChartData.GraphGuide.GuideList
              
            }
            //,{id:"v2",minimum:10}
            ],
            categoryAxis: {
              //dashLength: 5 
            },
            stockGraphs: [{   
              //type: "line",
              id: "graph1",
              valueField: "SBPValue",
              lineColor: "#EA7500",
              //lineColorField:"SignColor",
              lineThickness : 3,
              lineAlpha:1,
              //connect:false,
              bullet: "round",
              //bulletField:"SignShape",
              bulletSize:12,
              //bulletSizeField:"bulletSize",
              //customBulletField : "customBullet", //客制化
              bulletBorderColor : "#FFFFFF",
              bulletBorderThickness : 1,
              bulletBorderAlpha : 1,    
              showBalloon: true,    
              balloonText: "血压：[[SBPValue]]/[[DBPValue]] mmHg<br>脉率：[[PulseValue]] 次/分<br>血糖：[[BloodGlucose]] mmol/L",
              ValueAxis:{
                id:"v1",
                //strictMinMax:true,
                //maximum: 190,  
                //minimum: 65,
                }
              }],
              stockLegend: {     //有这个才能显示title
                valueTextRegular: " ",
                markerType: "none"
                //autoMargins:false
              }
            },
            {
              title: "任务依从情况",
              showCategoryAxis: true,
              //backgroundColor:"#CC0000",
              percentHeight: 35,
              valueAxes: [{
              id:"v2",
              gridAlpha : 0,
              axisAlpha : 0,
              labelsEnabled : false
              //minimum: 10,
            }],
            categoryAxis: {   
              //dashLength: 5
            },
            stockGraphs: [{
              //type: "line",
              id: "graph2",
              valueField:"BulletValue",
              //lineColor: "#DADADA",
              lineColorField:"BulletColor",
              lineThickness : 0,
              lineAlpha:0,
              bullet: "round",
              bulletSize:20,
              //bulletSizeField:"bulletSize",
              customBulletField : "CustomBullet", //客制化
              bulletBorderColor : "#FFFFFF",
              bulletBorderThickness : 2,
              bulletBorderAlpha : 1,    
              showBalloon: true,    
              balloonText: "[[BulletDescription]]",
              //labelText:"[[drugDescription]]"
              }],
              stockLegend: {     //有这个才能显示title
                valueTextRegular: " ",
                markerType: "none",       
              }}
          ],
          balloon:{
             fadeOutDuration:3,   //3秒之后自动消失
             animationDuration:0.1,
             maxWidth:500,  //必须有，不然自排版是乱的
             textAlign:"left",
             horizontalPadding:12,
             verticalPadding:4,
             fillAlpha:0.8
          },
          chartCursorSettings:{
            usePeriod: "7DD",
            zoomable:false,
            pan:false,
            //pan:false,
              //zoomable:true,
            //leaveCursor:"false",
            //cursorPosition:"middle",
            categoryBalloonEnabled:false,
            categoryBalloonAlpha:1,
            categoryBalloonColor:"#ffff",
            categoryBalloonDateFormats:[{period:"YYYY", format:"YYYY"}, {period:"MM", format:"YYYY/MM"}, {period:"WW", format:"YYYY/MM/DD"}, {period:"DD", format:"YYYY/MM/DD"}],
            valueLineEnabled:false,  //水平线
            valueLineBalloonEnabled:false,
            valueBalloonsEnabled: true,  //上下值同时显现
            //graphBulletSize: 1,
          },
          chartScrollbarSettings: {  //时间缩放面板
            zoomable:false,
            pan:true,           
            enabled:true,
            position: "top",
            autoGridCount: true, //默认
            graph: "graph1",
            graphType:"line",
            graphLineAlpha:1,
            graphFillAlpha:0,
            height:30,
            dragIconHeight:28,
            dragIconWidth:20,
           //usePeriod: "10mm",     
          },
          responsive: {   //手机屏幕自适应
            enabled: true
          }
           });
      
      } //function end 
     

      //图上点击事件函数
      var showDetailInfo=function(event, scope)
      {
        //获取被点击的bullet的时间值和格式，处理成string"20150618"格式传到webservice
        var dateSelected=event.item.category;
        var theyear=dateSelected.getFullYear();
        var themonth=dateSelected.getMonth()+1;  
        if(themonth<10)
        {
          var themonth="0"+themonth.toString();
        }
        var theday=dateSelected.getDate();
        if(theday<10)
        {
          var theday="0"+theday.toString();
        }
        var theDate=theyear.toString()+themonth.toString()+theday.toString();
 
        console.log(theDate);

        $http.get('data/target-date.json').success(function(data) {
           
           template = '<ion-popover-view style="opacity:1"><ion-header-bar> <h1 class="title">2015-09-13 星期日</h1> </ion-header-bar> <ion-content>'; 
           template +=' <div class="list"><div class="item item-divider">体征测量</div><div class="item">✔血压：160/87mmHg</div><div class="item">✔脉率：67 次/分</div><div class="item item-divider">生活方式</div><div class="item">✘饮食</div><div class="item">✔运动</div></div>';
           template +='</ion-content></ion-popover-view>';

           popover.remove();
           popover=$ionicPopover.fromTemplate(template);
           popover.show();
        });

      } //function end 

  }])

//目标-列表
.controller('recordListcontroller', ['$scope', '$http','VitalInfo','$ionicLoading','Storage',
    function($scope, $http, VitalInfo,$ionicLoading, Storage) {

      init();
      function init(){
        $scope.status="加载更多"
        var PatientId=Storage.get("UID");
        var Module = "M1";
        var StartDate ="20501027" ;
        var Num = 10;
        var VitalSigns = function (PatientId,Module,StartDate,Num) {
        var promise = VitalInfo.VitalSigns(PatientId,Module,StartDate,Num);  
        promise.then(function(data) {  // 调用承诺API获取数据 .resolve  
             $scope.SignDetailByDs = data.SignDetailByDs;
             $scope.NextStartDate = data.NextStartDate;
             console.log(data.NextStartDate);
             $scope.$broadcast('scroll.infiniteScrollComplete');  
               }, function(data) {  // 处理错误 .reject  
              });     
        }

        VitalSigns(PatientId,Module,StartDate,Num); //运行函数
        $scope.onItemDelete = function(dayIndex, item) {
        $scope.SignDetailByDs[dayIndex].schedule.splice($scope.SignDetailByDs[dayIndex].schedule.indexOf(item), 1);
        }
      }
        $scope.loadMore = function(){
         

          if($scope.NextStartDate !=-1){

           $ionicLoading.show({
           template: '<ion-spinner style="height:2em;width:2em"></ion-spinner>'
           });
              var str = $scope.SignDetailByDs[9].Date.slice(0,4)+
                    $scope.SignDetailByDs[9].Date.slice(5,7)+
                    $scope.SignDetailByDs[9].Date.slice(8,10);
              var StartDate = str;
              var Num = 10;
              VitalInfo.VitalSigns(PatientId,Module,StartDate,Num).then(
                    function(data) {  
                      var l=$scope.SignDetailByDs.length;
                      var t=data.SignDetailByDs.length;
                      for(var i=0;i<t;i++)
                      {
                        $scope.SignDetailByDs[i+l]=data.SignDetailByDs[i];
                       }
                        $scope.NextStartDate = data.NextStartDate;
                        setTimeout(function(){$ionicLoading.hide();},500);
                                    }, function(e) {  // 处理错误 .reject  
                          console.log(e);
                                                    }); 
          }
          else
          {
              $scope.status="已加载完毕"
          }
        }
        
  }])
// --------我的专员-苟玲----------------
//我的专员消息列表
.controller('contactListCtrl',function($scope, $http, $state, $stateParams, Users, Storage){
    //console.log($stateParams.tt);
    

    $scope.contactList = {};
    $scope.contactList.list;

     $scope.$watch('$viewContentLoaded', function() {  
          $scope.GetHealthCoachListByPatient();
    }); 
    $scope.GetHealthCoachListByPatient = function()
    {
        var PatientId = Storage.get("UID");
        var CategoryCode = "M1";
        var promise = Users.GetHealthCoachListByPatient(PatientId, CategoryCode);  
        promise.then(function(data) {   
            $scope.contactList.list = data;
            //console.log($scope.contactList.list);
        }, function(data) {  
        });      
    }
})

.controller('ChatDetailCtrl' ,function($scope, $http, $stateParams, $resource, MessageInfo, $ionicScrollDelegate, CONFIG) 
{
    //console.log($stateParams.tt);
    $scope.Dialog = {};
    var paraArry = $stateParams.tt.split('&');
    $scope.DoctorId = paraArry[0];
    $scope.DoctorName =  paraArry[1];
    $scope.imageURL = paraArry[2];
    $scope.PatientId = "P001";

    $scope.Dialog.SMScontent = "";
    var WsUserId = $scope.PatientId;
    var WsUserName = "患者1";
    var wsServerIP = CONFIG.wsServerIP; 

    $scope.myImage = "img/mine.jpg";


    var footerBar; // gets set in $ionicView.enter
    var scroller;
    var txtInput; // ^^^

    //socket初始化
    $scope.SocketInit = function ()
    {
        $scope.socket = io.connect(wsServerIP);
          
        //告诉服务器由用户登陆
        $scope.socket.emit('login', {userid:WsUserId, username:WsUserName});                
          
        //监听消息
        $scope.socket.on('message', function(obj){
            var DataArry = obj.content.split("||");
            if (DataArry[0] == WsUserId)
            {
              if(DataArry[0] == $scope.Dialog.DoctorId)
              {
                  $scope.Dialog.push({"IDFlag": "Receive","SendDateTime": DataArry[2],"Content":DataArry[3]});
                  //console.log($scope.Dialog);
                  $ionicScrollDelegate.scrollBottom(true);
                  $scope.$apply();
                  //SetSMSRead(ThisUserId, TheOtherId);//改写阅读状态
                  //playBeep();
              }              
            }   
        });
    } 
    //socket发送消息到服务器   
    $scope.SocketSubmit = function(WsContent)
    {      
        var obj = {
          userid: WsUserId,
          username: WsUserName,
          content: WsContent
        };
        $scope.socket.emit('message', obj);
      return false;
    },

    //获取消息对话
    $scope.GetSMSDialogue = function(Reciever,SendBy)
    {
        var promise = MessageInfo.GetSMSDialogue(Reciever,SendBy);
        promise.then(function(data) 
        {  
            $scope.Dialog = data;
            $ionicScrollDelegate.scrollBottom(true);
        }, 
        function(data) {   
        });      
    }

    $scope.$watch('$viewContentLoaded', function() {  
        $scope.GetSMSDialogue($scope.PatientId, $scope.DoctorId);
        $scope.SocketInit();
        footerBar = document.body.querySelector('#userMessagesView .bar-footer');
        scroller = document.body.querySelector('#userMessagesView .scroll-content');
        txtInput = angular.element(footerBar.querySelector('textarea'));
    }); 
 
  
    //发送消息
    $scope.submitSMS = function() {
        var SendBy = $scope.PatientId;
        var Receiver = $scope.DoctorId;
        var piUserId = "1";
        var piTerminalName = "1";
        var piTerminalIP = "1";
        var piDeviceType = 19;
        if($scope.Dialog.SMScontent != "")
        {
            var promise = MessageInfo.submitSMS(SendBy,$scope.Dialog.SMScontent,Receiver,piUserId,piTerminalName,piTerminalIP,piDeviceType);  
            promise.then(function(data) {    
                if (data.Flag == "1")
                {
                    if (data.Time == null)
                    {
                        data.Time = "";
                    }
                    $scope.Dialog.push({"IDFlag": "Send","SendDateTime": data.Time,"Content":$scope.Dialog.SMScontent});
                    $ionicScrollDelegate.scrollBottom(true);
                    $scope.SocketSubmit(Receiver +  "||" + SendBy + "||" + data.Time + "||" + $scope.Dialog.SMScontent);
                    $scope.Dialog.SMScontent = "";
                }              
            }, function(data) {   
            });      
        }
    }


    $scope.$on('taResize', function(e, ta) {
        //console.log('taResize');
        if (!ta) return;
        
        var taHeight = ta[0].offsetHeight;
        //console.log('taHeight: ' + taHeight);
        
        if (!footerBar) return;
        
        var newFooterHeight = taHeight + 10;
        newFooterHeight = (newFooterHeight > 44) ? newFooterHeight : 44;
        
        footerBar.style.height = newFooterHeight + 'px';
        scroller.style.bottom = newFooterHeight + 'px'; 
    });

     // this keeps the keyboard open on a device only after sending a message, it is non obtrusive
    function keepKeyboardOpen() {
        //console.log('keepKeyboardOpen');
        txtInput.one('blur', function() {
            console.log('textarea blur, focus back on it');
            txtInput[0].focus();
        });
    } 
})

// --------专员选择-李山----------------
.controller('HealthCoachListCtrl', ['$scope', '$state','$ionicPopup','$ionicSideMenuDelegate','$http', '$ionicModal','$ionicPopover','$ionicHistory',
    function($scope, $state, $ionicPopup,$ionicSideMenuDelegate,$http, $ionicModal, $ionicPopover,$ionicHistory) { 
      
      
      $scope.nvGoback = function() {
        $ionicHistory.goBack();
      } 

      $http.get('data/healthCoachList.json').success(function(data) {
          $scope.healthCoachList = data.healthCoachList1;
       });

      $scope.doRefresh = function() {
              $http.get('data/tasks1.json')  
                  .success(function(data) {
                      $scope.tasks = data;
                  })
                  .finally(function() {
                      $scope.$broadcast('scroll.refreshComplete');
                  });
      };
      $scope.sideList = [
        { text: "姓名", value: "name" },
        { text: "年龄", value: "age" },
        { text: "评分", value: "score" },
      ];
      $scope.orderProp = 'name';
      $scope.reverseSort= false;
      $scope.Change = function() {
          $scope.reverseSort=!($scope.reverseSort);
      }; 
      $scope.sideChange = function(item) {
          $scope.orderProp= item.value;
      }; 
      
      $scope.sexList = [{ text: "男", checked: true },{ text: "女", checked: true }];

      $ionicModal.fromTemplateUrl('partials/healthCoach/filterHealthCoach.html', {
          scope: $scope,
          animation: 'slide-in-up'
        }).then(function(modal) {
          $scope.modal = modal;
        });

        $scope.openModal = function() {
          $scope.modal.show();
        };
        $scope.closeModal = function() {
          $scope.modal.hide();
        };
        $scope.finish = function() {
          $scope.modal.hide();
        };  
  }])

.controller('HealthCoachInfoCtrl',['$scope', '$ionicHistory', '$ionicSideMenuDelegate',
  function($scope, $ionicHistory,$ionicSideMenuDelegate) {

      $scope.nvGoback = function() {
        $ionicHistory.goBack();
      } 
}])

.controller('CommentListCtrl',['$scope', '$ionicHistory', '$ionicSideMenuDelegate',
   function($scope, $ionicHistory,$ionicSideMenuDelegate) {
    
      $scope.nvGoback = function() {
        $ionicHistory.goBack();
       }
}])

.controller('SetCommentCtrl',['$scope', '$ionicHistory', '$ionicLoading',
   function($scope, $ionicHistory,$ionicLoading) {

      $scope.comment={score:1, commentContent:""};

      $scope.nvGoback = function() {
        $ionicHistory.goBack();
       }
      $scope.ratingsObject = {
        iconOn: 'ion-ios-star',
        iconOff: 'ion-ios-star-outline',
        iconOnColor: 'rgb(200, 200, 100)',
        iconOffColor: 'rgb(200, 100, 100)',
        rating: 1,
        minRating: 1,
        readOnly:false,
        callback: function(rating) {
          $scope.ratingsCallback(rating);
        }
      };

      $scope.ratingsCallback = function(rating) {
        $scope.comment.score = rating;
        //console.log('Selected rating is : ', rating);
      };

      $scope.deliverComment = function() {
        if($scope.comment.commentContent =="")
        {
            $ionicLoading.show({
              template: '输入字数不足15字',
              noBackdrop: false,
              duration: 1500,
              hideOnStateChange: true
            });
        }
        else
        {
          $ionicLoading.show({
              template: '您给的评分是'+$scope.comment.score+'评论：'+$scope.comment.commentContent,
              noBackdrop: false,
              duration: 1500,
              hideOnStateChange: true
            });
          //restful
        }
      };
      
  }])

.controller('OthersCtrl',['$scope', '$ionicHistory', '$ionicSideMenuDelegate',
   function($scope, $ionicHistory,$ionicSideMenuDelegate) {

      $scope.toggleLeftMenu = function() {
          $ionicSideMenuDelegate.toggleLeft();
       };
}])

.controller('personalInfocontroller',['$scope','$state','$ionicPopover','$stateParams','Storage','Patients','Camera','Users',
   function($scope,$state,$ionicPopover,$stateParams,Storage,Patients,Camera,Users) {
        $scope.DtInfo = [
        { t:"单位",
          v: "某三本大学"
        }, 
        { t:"职务",
          v: "搬砖"
        }, 
        { t:"Level",
          v: "233"
        }, 
        { t:"科室",
          v: "217"
        }
        ];

        $scope.Info = {
          name: "叶良辰",
          gender: "男",
          birthday:"19980808",
          id: 1212
        }

        $scope.state = "未提交";
        
        $scope.imgURI = "img/Barot_Bellingham_tn.jpg"
        //the user skip this step put state to unuploaded.
        $scope.onClickSkip = function(){     
            $scope.state = "未提交";
            Storage.set(13,$scope.state);
            $state.go('coach.i',{'state': $scope.state,'info':null},"replace");
        };

        //the user submit
        $scope.onClickSubmit = function(){
            
            $scope.state = "审核中";
            //用户的信息封装进完整的一个对象里面 存localstorage 全局调用 JSON化 反 JSON 化

            var DtInfo2 = {
              unitname: $scope.DtInfo[0].v,
              jobTitle: $scope.DtInfo[1].v,
              level: $scope.DtInfo[2].v,
              dept: $scope.DtInfo[3].v
            };

            // console.log($scope.Info);
            // console.log(DtInfo2);

            var userInfo = {
              BasicInfo : $scope.Info,
              DtInfo : DtInfo2
            }
            var objStr=JSON.stringify(userInfo);
            // console.log(userInfo);

            Storage.set("userInfo",objStr);
            Storage.set(13,$scope.state);
            // Storage.set(13000);
            // Storage.set(131,$scope.DtInfo[0].v);
            // Storage.set(132,$scope.DtInfo[1].v);
            // Storage.set(133,$scope.DtInfo[2].v);
            // Storage.set(134,$scope.DtInfo[3].v);
            Storage.set(14,$scope.imgURI);
            // for(i=0;i<temp.length;i++)console.log(temp[i].v);
            // $state.go('coach.home',{'state': $scope.state, 'info' :  infoObject.name},"replace");
            $scope.upload();
            $state.go('coach.i',{},"replace");
        };

        //upload
        $scope.upload = function(){

          var DoctorInfo = {
            UserId: "ZXF",
            UserName: "ZXF",
            Birthday: 19930418,
            Gender: 1,
            IDNo: "ZXF",
            InvalidFlag: 0,
            piUserId: "ZXF",
            piTerminalName: "ZXFZXF",
            piTerminalIP: "ZXF",
            piDeviceType: 0
        };

          var responce = Users.myTrial(DoctorInfo);
          
          var temp = Users.myTrial2("ZXF");

          var temp2 = Camera.uploadPicture($scope.imgURI);
          // var temp2 = Camera.uploadPicture2($scope.imgURI);
          console.log("返回的数据" + temp2 );
        };
          //-----------------------------------------------------------

        $scope.onClickCamera = function($event){
          $scope.openPopover($event);
        };
        
         $scope.onClickCameraCancel = function(){
          $scope.closePopover();
        };


        $scope.onClickCameraPhotos = function(){
        
         console.log("选个照片"); 
         $scope.choosePhotos();
         $scope.closePopover();
        };

        $scope.onClickCameraCamera = function(){
          // console.log("要拍照了！");
          // Camera.getPicture().then(function(imageURI){
          //   console.log(imageURI);
          // },function(err){
          //   console.log(err);
          // });
          $scope.closePopover();
        };
        
        $scope.getPhoto = function() {
          console.log("要拍照了！");
          $scope.takePicture();
          $scope.closePopover();
        };

        $scope.takePicture = function() {
         Camera.getPicture().then(function(data) {
            // console.log(data);
            $scope.imgURI = data;
          }, function(err) {
            // console.err(err);
            $scope.imgURI = undefined;
          });
          // console.log($scope.imgURI);
        };
        
        $scope.choosePhotos = function() {
         Camera.getPictureFromPhotos().then(function(data) {
            // console.log(data);
            $scope.imgURI = data;
          }, function(err) {
            // console.err(err);
            $scope.imgURI = undefined;
          });
          // conso
        }
        // ionicPopover functions
          //-----------------------------------------------------------------
          // .fromTemplateUrl() method
        $ionicPopover.fromTemplateUrl('my-popover.html', {
          scope: $scope,
          animation: 'slide-in-up'
        }).then(function(popover) {
          $scope.popover = popover;
        });

        $scope.openPopover = function($event) {
          $scope.popover.show($event);
        };
        $scope.closePopover = function() {
          $scope.popover.hide();
        };
        //Cleanup the popover when we're done with it!
        $scope.$on('$destroy', function() {
          $scope.popover.remove();
        });
        // Execute action on hide popover
        $scope.$on('popover.hidden', function() {
          // Execute action
        });
        // Execute action on remove popover
        $scope.$on('popover.removed', function() {
          // Execute action
        });
}])

;


