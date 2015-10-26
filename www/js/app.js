// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires' 
angular.module('zjubme', ['ionic','zjubme.services', 'zjubme.directives', 'zjubme.controllers','ngCordova'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

// --------路由, url模式设置----------------
.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  //注册与登录
  $stateProvider
    .state('signin', {
      cache: false,
      url: '/signin',
      templateUrl: 'partials/login/signin.html',
      controller: 'SignInCtrl'
    })   
    .state('phonevalid', {
      url: '/phonevalid',
      cache: false,
      templateUrl: 'partials/login/phonevalid.html',
      controller: 'phonevalidCtrl'
    })
    .state('setpassword', {
      cache:false,
      url: '/setpassword',
      templateUrl: 'partials/login/setPassword.html',
      controller: 'setPasswordCtrl'
    })
    .state('userdetail',{
      url:'/userdetail',
      templateUrl:'partials/login/userDetail.html',
      controller:'userdetailCtrl'
    });

  //主界面
  $stateProvider
    .state('tab', {
      abstract: true,
      url: '/tab',
      templateUrl: 'partials/tabs/tabs.html',
    })
    .state('tab.tasklist', {
      url: '/tasklist',
      views: {
        'tab-tasks': {
          templateUrl: 'partials/tabs/tab.task.tasklist.html',
          controller: 'TaskListCtrl'
        }
      }
    })
    .state('tab.tasks', {
      url: '/tasks',
      abstract: true,
      views: {
        'tab-tasks': {
          template:'<ion-nav-view/>'
        }
      }
    })
    .state('tab.tasks.tl', {
      url:"/:tl",
        templateUrl:function($stateParams)
        {
          console.log("$stateParams.tl is "+$stateParams.tl);
          return "partials/tabs/tab.task."+$stateParams.tl+".html";
        },
        controllerProvider:function($stateParams)
        {
            return $stateParams.tl + 'controller';
       }
    })  
    // .state('tab.target', {
    //   url: '/target',
    //   views: {
    //     'tab-target': {
    //       templateUrl: 'partials/tabs/tab-target.html',
    //       controller: 'TargetCtrl'
    //     }
    //   }
    // })
    .state('tab.target', {
      url: '/target',
      abstract: true,
      views: {
        'tab-target': {
          templateUrl: 'partials/tabs/tab-target.html',
          controller: 'TargetCtrl'
        }
      }
    })
    // .state('tab.target1', {
    //   url: '/target',
    //   abstract: true,
    //   views: {
    //     'tab-target': {
    //       template:'<ion-nav-view/>'
    //     }
    //   }
    // })
    .state('tab.target.tl', {
      url:"/:tl",
      views: {
        'tab-target1': {
        templateUrl:function($stateParams)
        {
          return "partials/tabs/tab.target."+$stateParams.tl+".html";
        },
        controllerProvider:function($stateParams)
        {
            return $stateParams.tl + 'controller';
       }
     }}
    })
    .state('tab.chats', {
      url: '/chats',
      abstract: true,
      views:{
        'tab-chats':{
          template:'<ion-nav-view/>'
        }
      }
    })
    .state('tab.chats.r', {
        url: '/:tt',
        // views: {
        //   '': {
            templateUrl: function ($stateParams){
              if ($stateParams.tt=='list')
              {
                return 'partials/tabs/tab-chats.html';
              }
              else return 'partials/tabs/chat-detail.html';   
            },
            controllerProvider: function($stateParams) {
              if($stateParams.tt=='list')
              {
                return 'ChatsCtrl';
              }
              else
              {
                return 'ChatDetailCtrl';
              }
            }    
       //    } 
       // }     
    })
    .state('healthCoach', {
      url: '/healthCoach',
      abstract: true,
      template:'<ion-nav-view/>'
    })
    .state('healthCoach.r', {
        url: '/:tt',   
          templateUrl: function ($stateParams){
            if($stateParams.tt=='healthCoachList') return 'partials/healthCoach/healthCoachList.html';
            else if($stateParams.tt=='commentList') return 'partials/healthCoach/commentList.html';
            else if($stateParams.tt=='setComment') return 'partials/healthCoach/setComment.html';
            else return 'partials/healthCoach/healthCoachInfo.html';   
          },
          controllerProvider: function($stateParams) {
            if($stateParams.tt=='healthCoachList') return 'HealthCoachListCtrl';
            else if($stateParams.tt=='commentList') return 'CommentListCtrl';
            else if($stateParams.tt=='setComment') return 'SetCommentCtrl';
            else return 'HealthCoachInfoCtrl';
          }      
  })
    .state('tab.others', {
        url: '/others',
        views: {
          'tab-others': {
            templateUrl: 'partials/tabs/tab-others.html',
            controller: 'OthersCtrl'
          }
        }
    });
  
  //左侧菜单
 $stateProvider
    .state('sideMenu',{
      abstract:true,
      url:"/sideMenu",
      template:'<ion-nav-view/>'
    })
    .state('sideMenu.changePassword', {
        url: '/changePassword',
        views: {
          '': {
            templateUrl: 'partials/sideMenu/changePassword.html',
            controller: 'changePasswordCtrl'
          }
        }
    })
    .state('sideMenu.personalInfo', {
        url: '/personalInfo',
        views: {
          '': {
            templateUrl: 'partials/sideMenu/personalInfo.html',
            controller: 'PersonalInfo'
          }
        }
    })
    ;  
  
  $urlRouterProvider.otherwise('/signin');
})
// --------不同平台的相关设置----------------
.config(function($ionicConfigProvider) {
  $ionicConfigProvider.views.maxCache(5);

  // note that you can also chain configs
  $ionicConfigProvider.tabs.position('bottom');
  $ionicConfigProvider.tabs.style('standard');
  $ionicConfigProvider.navBar.alignTitle('center');
  $ionicConfigProvider.navBar.positionPrimaryButtons('left');
  $ionicConfigProvider.navBar.positionSecondaryButtons('right');
  $ionicConfigProvider.form.checkbox('circle');
});
