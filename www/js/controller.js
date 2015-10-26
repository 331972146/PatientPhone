
angular.module('zjubme.controllers', ['ionic','ngResource','zjubme.services', 'zjubme.directives', 'ja.qr','ionic-datepicker'])

// 初装或升级App的介绍页面控制器
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
    //$state.go('tab.tasklist');
    if((logOn.username!="") && (logOn.password!="")){ 
      var saveUID = function(){
        var UIDpromise=userservice.UID('PhoneNo',logOn.username);
        UIDpromise.then(function(data){
          if(data.result!=null){
            Storage.set('UID', data.result);
          }
        },function(data){
        });
      }
                
      var promise=userservice.userLogOn('PhoneNo' ,logOn.username,logOn.password,'Patient');
      if(promise==7){
        $scope.logStatus='手机号验证失败！';
        return;
      }
      promise.then(function(data){
        $scope.logStatus=data.result.substr(0,4);
        Storage.set('TOKEN', data.result.substr(12));
        Storage.set('USERNAME', logOn.username);
        saveUID();
        $timeout(function(){$state.go('tab.tasklist');} , 1000);
      },function(data){
        $scope.logStatus=data.data.result;
      });
    }else{
      $scope.logStatus="请输入完整信息！";
    }
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
//任务
.controller('TaskListCtrl', ['$scope', '$http','$ionicSideMenuDelegate','$timeout','$ionicPopup',
    function($scope, $http, $ionicSideMenuDelegate,$timeout, $ionicPopup) {
       ////获取任务列表数据
      $http.get('data/tasklist.json').success(function(data){
        $scope.tasklist = data;
      })

      $scope.toggleLeftMenu = function() {
          $ionicSideMenuDelegate.toggleLeft();
      };

      $scope.doRefresh = function() {
          // $http.get('data/tasks1.json')  
          //     .success(function(data) {
          //         $scope.tasks = data;
          //     })
          //     .finally(function() {
          //         $scope.$broadcast('scroll.refreshComplete');
          // });
      };
}])

.controller('bpmcontroller',['$scope',  '$timeout', '$cordovaBluetoothSerial', '$ionicLoading', '$cordovaBLE', 'BloodPressureMeasure', '$ionicModal', 'VitalInfo',
  function($scope,  $timeout, $cordovaBluetoothSerial, $ionicLoading, $cordovaBLE, BloodPressureMeasure, $ionicModal, VitalInfo){
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
              VitalInfo.PostPatientVitalSigns(jn).then(function(r){alert('savesuccess')},function(e){alert('e.result');});
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
  $http.get('data/HElist.json').success(function(data){
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

.controller('medicinecontroller',['$scope', '$timeout', '$ionicModal', '$http', 'BloodPressureMeasure', 'VitalInfo', 'extraInfo',function($scope, $timeout, $ionicModal, $http, BloodPressureMeasure, VitalInfo, extraInfo) {
  
  extraInfo.PatientId('mtest');
  extraInfo.TerminalIP('168.0.0.1');
  extraInfo.TerminalName('testphone');
  extraInfo.DeviceType(1);
  extraInfo.revUserId('revUserId');

  var highbp=VitalInfo.InsertServerData();
      highbp.Unit='mmHg';
      highbp.ItemType='Bloodpressure';
      highbp.ItemCode='Bloodpressure_1';
      highbp.Value=110;
  var lowbp=VitalInfo.InsertServerData();
      lowbp.Unit='mmHg';
      lowbp.ItemType='Bloodpressure';
      lowbp.ItemCode='Bloodpressure_2';
      lowbp.Value=70;
  var jn=VitalInfo.InsertServerData();
      jn.Unit='次';
      jn.ItemType='Pulserate';
      jn.ItemCode='Pulserate_1';
      jn.Value=75;

  var bpc=BloodPressureMeasure.BloodPressureChart();
  var chart = AmCharts.makeChart("chartdiv",bpc,500);
  progressJs('#targetElement').start().autoIncrease(4, 500);

  $scope.title=true;

  var disabledDates = [
      new Date(1437719836326),
      new Date(),
      new Date(2015, 7, 10), //months are 0-based, this is August, 10th!
      new Date('Wednesday, August 12, 2015'), //Works with any valid Date formats like long format
      new Date("08-14-2015"), //Short format
      new Date(1439676000000) //UNIX format
    ];
     var weekDaysList = ["Sun", "Mon", "Tue", "Wed", "thu", "Fri", "Sat"];
      var monthList =["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];
  $scope.datepickerObject = {
      titleLabel: 'Title',  //Optional
      todayLabel: 'Today',  //Optional
      closeLabel: 'Close',  //Optional
      setLabel: 'Set',  //Optional
      setButtonType : 'button-assertive',  //Optional
      todayButtonType : 'button-assertive',  //Optional
      closeButtonType : 'button-assertive',  //Optional
      inputDate: new Date(),    //Optional
      mondayFirst: true,    //Optional
      disabledDates: disabledDates, //Optional
      weekDaysList: weekDaysList,   //Optional
      monthList: monthList, //Optional
      templateType: 'popup', //Optional
      showTodayButton: 'true', //Optional
      modalHeaderColor: 'bar-positive', //Optional
      modalFooterColor: 'bar-positive', //Optional
      from: new Date(2012, 8, 2),   //Optional
      to: new Date(2018, 8, 25),    //Optional
      callback: function (val) {    //Mandatory
        datePickerCallback(val);
      }
    };
    var datePickerCallback = function (val) {
      if (typeof(val) === 'undefined') {
        console.log('No date selected');
      } else {
        console.log('Selected date is : ', val)
      }
    };
    $scope.save = function(){
      console.log(highbp);
       VitalInfo.PostPatientVitalSigns(highbp).then(function(r){
          VitalInfo.PostPatientVitalSigns(lowbp).then(function(r){
            VitalInfo.PostPatientVitalSigns(jn).then(function(r){alert('savesuccess')},function(e){alert('e.result');});
          },function(e){alert('e.result');});
       },function(e){alert('e.result');}); 
    };
    $scope.test = function(){
      console.log("test");
      $scope.title = ! $scope.title;
      chart.dataProvider[0].points=120;
      chart.dataProvider[1].points=75;
      chart.dataProvider[2].points=75;
      chart.graphs[0].labelText="[[points]][[Unit]]";
      chart.allLabels[0].text=BloodPressureMeasure.BPConclusion(120,75);
      chart.validateData();
    }
}])

// --------依从率图-李山----------------
.controller('TargetCtrl', ['$scope', '$http','$ionicSideMenuDelegate','$timeout','$ionicPopup',
    function($scope, $http, $ionicSideMenuDelegate,$timeout, $ionicPopup) {

       $scope.toggleLeftMenu = function() {
          $ionicSideMenuDelegate.toggleLeft();
       };
        $scope.lineStacked='9';
        $scope.doRefresh = function() {
        console.log(1);      
          };
      $scope.loadMore = function() {
         console.log(4); 

      };
//$scope.$broadcast('scroll.infiniteScrollComplete');  
  }])

.controller('graphcontroller', ['$scope', '$http','$ionicSideMenuDelegate','$timeout','$ionicPopover','$state','$window',
    function($scope, $http, $ionicSideMenuDelegate,$timeout, $ionicPopup, $state,$window) {

     $scope.doRefresh = function() {
        console.log(1);      
          };
      $scope.reload = function() {
         //$state.go("tab.target.graph", {}, { reload: true });    
         //$state.reload();
         $window.location.reload(true);
      };
  }])
.controller('recordlistcontroller', ['$scope', '$http','$ionicSideMenuDelegate','$timeout','$ionicPopover','$state',
    function($scope, $http, $ionicSideMenuDelegate,$timeout, $ionicPopup, $state) {

  }])
// --------我的专员-苟玲----------------
//我的专员消息列表
.controller('ChatsCtrl', ['$scope', 'information','$ionicSideMenuDelegate', function($scope, information, $ionicSideMenuDelegate) {
  $scope.toggleLeftMenu = function() {
     $ionicSideMenuDelegate.toggleLeft();
  };

  $scope.information = information.all();
  $scope.remove = function(chat) {
    information.remove(chat);
  };
}])

//一对一交流界面
.controller('ChatDetailCtrl',['$scope', '$http','$ionicSideMenuDelegate', '$stateParams', 'information', '$resource', 'MessageInfo', 'Data', '$ionicScrollDelegate', function($scope, $http, $stateParams, information, $resource, MessageInfo, Data, $ionicScrollDelegate) 
{
    $scope.aa ={};
    $scope.aa.SMScontent = "";
    var WsUserId = "P001";
    var WsUserName = "患者1";
    var wsServerIP = "ws://" + "10.12.43.61" + ":4141"; 

    $http.get('data/Dialog.json').success(function(data) {
          $scope.Dialog = data;
          console.log(data);
          $ionicScrollDelegate.scrollBottom(true);
    });

    $scope.$watch('$viewContentLoaded', function() {  
          $scope.SocketInit();
    });  

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
             $scope.Dialog.push({"IDFlag": "Receive","SendDateTime": DataArry[2],"Content":DataArry[3]});
             console.log($scope.Dialog);
             $ionicScrollDelegate.scrollBottom(true);
             //SetSMSRead(ThisUserId, TheOtherId);//改写阅读状态
             //playBeep();
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
    }

    //获取消息对话
    $scope.GetSMSDialogue = function()
    {
        var Reciever = "U201510220004";
        var SendBy = "D001";
        var promise = MessageInfo.GetSMSDialogue(Reciever,SendBy);
        promise.then(function(data) 
        {  // 调用承诺API获取数据 .resolve  
            alert(2);         
            console.log(data);
        }, 
        function(data) {  // 处理错误 .reject  
        });      
    }

    window.localStorage['i']=$stateParams.tt;
    var allinfo=information.all();
    $scope.chat = allinfo[$stateParams.tt];
    console.log($stateParams.tt);
    var messageOptions = [];
   
    var messageIter = 0;
    $scope.messages = messageOptions;
  
    //发送消息
    $scope.submitSMS = function(SendBy,Content,Receiver) {
 
      var SendBy = "U201510220004"
      var Receiver = "D001";
      var piUserId = "1";
      var piTerminalName = "1";
      var piTerminalIP = "1";
      var piDeviceType = 19;
      if($scope.aa.SMScontent != "")
      {
          var promise = MessageInfo.submitSMS(SendBy,$scope.aa.SMScontent,Receiver,piUserId,piTerminalName,piTerminalIP,piDeviceType);  
          console.log(promise);   
          promise.then(function(data) {  // 调用承诺API获取数据 .resolve  
            if (data.result == "数据插入成功")
            {
                $scope.Dialog.push({"IDFlag": "Send","SendDateTime": "2015-05-27 16:00:45","Content":$scope.aa.SMScontent});
                console.log($scope.Dialog);
                $ionicScrollDelegate.scrollBottom(true);
                $scope.SocketSubmit("P001" +  "||" + "D001" + "||" + "2015-05-27 16:00:45" + "||" + $scope.aa.SMScontent);
                $scope.aa.SMScontent = "";
            }              
          }, function(data) {  // 处理错误 .reject  
          });      
      }
    }
}])

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

.controller('personalInfoCtrl',['$scope', '$ionicHistory', '$ionicSideMenuDelegate',
   function($scope, $ionicHistory,$ionicSideMenuDelegate) {

      $scope.toggleLeftMenu = function() {
          $ionicSideMenuDelegate.toggleLeft();
       };
}])

// --------侧边栏-----------------
.controller('PersonalInfoCtrl',['$scope', '$ionicHistory', 
   function($scope, $ionicHistory) {
      $scope.nvGoback = function() {
        $ionicHistory.goBack();
       }
       $scope.groups = [{name: "基本信息", items: ['性别','年龄'], show: false},{name: "体征信息", items: [1], show: false}];

        // for (var i=0; i<10; i++) {
        //   $scope.groups[i] = {
        //     name: i,
        //     items: [],
        //     show: false
        //   };
        //   for (var j=0; j<3; j++) {
        //     $scope.groups[i].items.push(i + '-' + j);
        //   }
        // }
        
        /*
         * if given group is the selected group, deselect it
         * else, select the given group
         */
        $scope.toggleGroup = function(group) {
          group.show = !group.show;
        };
        $scope.isGroupShown = function(group) {
          return group.show;
        };
    }])

;


