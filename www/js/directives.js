angular.module('zjubme.directives', ['zjubme.services'])

//依从率画图插件
.directive('amchart', function ($ionicPopup, $http, VitalInfo,$ionicPopover) {
  return {
    restrict: 'AE',
    replace: true,
    scope: {
         options: '=ng'
     },
    template: "<div style='width: 80%; height: 400px;margin-left:10%;' id='chartdiv'></div>",
    link: function (scope, ele, attr) {
console.log(3);

var template = '<ion-popover-view style="opacity:1"><ion-header-bar> <h1 class="title">My{{aa}}</h1> </ion-header-bar> <ion-content> Hello! </ion-content></ion-popover-view>';
               var aq=$ionicPopover.fromTemplate(template);

      var ChartData="";
      var chart;
      $http.get('data/target.json').success(function(data) {
        ChartData = data.ChartData;
        createStockChartNoOther(ChartData);
      });

      setTimeout(function(){chart.panels[1].addListener("clickGraphItem",showDetailInfo); },1000);
     
      var showDetailInfo=function(event, scope)
      {
        
        //scope.options=8;
        //获取被点击的bullet的时间值，事件格式，许处理成string"20150618"格式传到webservice
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
        //theDate=20150811;
        var promise = VitalInfo.GetSignsDetailByPeriod("U201508100021","M1",20150811,"7");
        promise.then(function(data) {  
              scope.options=data;

               if(theDate==20151008)
               {
                template = '<ion-popover-view style="opacity:1"><ion-header-bar> <h1 class="title">My{{aa}}</h1> </ion-header-bar> <ion-content> 1! </ion-content></ion-popover-view>';
               }
               else if(theDate==20151009)
               {
                template = '<ion-popover-view style="opacity:1"><ion-header-bar> <h1 class="title">My{{aa}}</h1> </ion-header-bar> <ion-content> 2! </ion-content></ion-popover-view>';
               }
                aq.remove();
             //console.log(data.NextStartDate);
               
               aq=$ionicPopover.fromTemplate(template);
               aq.show();

              //  if(theDate==20151008)
              //  {
              //   aq.show();
              //   console.log(aq);
              //  }
              //  else if(theDate==20151009)
              //  {
              //   aq.remove();
              //   aq='';
              //   console.log(aq);
  
              //  }
              //  else if(theDate==20151010)
              //  {
              //   template = '<ion-popover-view style="opacity:1"><ion-header-bar> <h1 class="title">My{{aa}}</h1> </ion-header-bar> <ion-content> Hel! </ion-content></ion-popover-view>';
              //    aq.show();
              //  }
              //  else{
              //   aq.remove();
              //   console.log(aq);
              // }
               
              
               
               
            //var template = '<ion-popover-view><ion-header-bar> <h1 class="title">My Popover Title</h1> </ion-header-bar> <ion-content> Hello! </ion-content></ion-popover-view>';


            //  $ionicPopover.fromTemplateUrl('my-popover.html', {
            //   scope: $scope
            // }).then(function(popover) {
            //   $scope.popover = popover;
            // });
             
            //  $ionicPopover.show($event);

            }, function(data) {  // 处理错误 .reject  
              
        });

        // $ionicPopup.alert({
        //  title: '详细:(',
        //    template: '该日详细依从情况'
        // });
      }

      function createStockChartNoOther(ChartData) {
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
              {fromField: "SignValue",toField: "SignValue"},
              {fromField: "DrugValue",toField: "DrugValue"}
            ],
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
              minimum: ChartData.GraphGuide.minimum,  
              maximum: ChartData.GraphGuide.maximum,   
                            //显示上下限不对  解决办法parseFloat(guides[0].minimum
              guides: ChartData.GraphGuide.GuideList  //区域划分
              
            }
            //,{id:"v2",minimum:10}
            ],
            categoryAxis: {
              //dashLength: 5 
            },
            stockGraphs: [{
              //type: "line",
              id: "graph1",
              valueField: "SignValue",
              lineColor: "#EA7500",
              //lineColorField:"SignColor",
              lineThickness : 3,
              lineAlpha:1,
              //connect:false,
              bullet: "round",
              bulletField:"SignShape",
              bulletSize:12,
              //bulletSizeField:"bulletSize",
              //customBulletField : "customBullet", //客制化
              bulletBorderColor : "#FFFFFF",
              bulletBorderThickness : 1,
              bulletBorderAlpha : 1,    
              showBalloon: true,    
              balloonText: "[[SignDescription]]",
              ValueAxis:{
                id:"v1",
                strictMinMax:true,
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
              valueField: "DrugValue",
              lineColor: "#FFFFFF",
              lineColorField:"DrugColor",
              lineThickness : 0,
              lineAlpha:0,
              bullet: "round",
              bulletSize:20,
              //bulletSizeField:"bulletSize",
              customBulletField : "DrugBullet", //客制化
              bulletBorderColor : "#FFFFFF",
              bulletBorderThickness : 2,
              bulletBorderAlpha : 1,    
              showBalloon: true,    
              balloonText: "[[DrugDescription]]",
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

    }
  };
})
// 写评论的五角星
.directive('ionicRatings',ionicRatings)
;
  
  function ionicRatings () {
    return {
      restrict: 'AE',
      replace: true,
      template: '<div class="text-center ionic_ratings">' +
        '<span class="icon {{iconOff}} ionic_rating_icon_off" ng-style="iconOffColor" ng-click="ratingsClicked(1)" ng-show="rating < 1" ng-class="{\'read_only\':(readOnly)}"></span>' +
        '<span class="icon {{iconOn}} ionic_rating_icon_on" ng-style="iconOnColor" ng-click="ratingsUnClicked(1)" ng-show="rating > 0" ng-class="{\'read_only\':(readOnly)}"></span>' +
        '<span class="icon {{iconOff}} ionic_rating_icon_off" ng-style="iconOffColor" ng-click="ratingsClicked(2)" ng-show="rating < 2" ng-class="{\'read_only\':(readOnly)}"></span>' +
        '<span class="icon {{iconOn}} ionic_rating_icon_on" ng-style="iconOnColor" ng-click="ratingsUnClicked(2)" ng-show="rating > 1" ng-class="{\'read_only\':(readOnly)}"></span>' +
        '<span class="icon {{iconOff}} ionic_rating_icon_off" ng-style="iconOffColor" ng-click="ratingsClicked(3)" ng-show="rating < 3" ng-class="{\'read_only\':(readOnly)}"></span>' +
        '<span class="icon {{iconOn}} ionic_rating_icon_on" ng-style="iconOnColor" ng-click="ratingsUnClicked(3)" ng-show="rating > 2" ng-class="{\'read_only\':(readOnly)}"></span>' +
        '<span class="icon {{iconOff}} ionic_rating_icon_off" ng-style="iconOffColor" ng-click="ratingsClicked(4)" ng-show="rating < 4" ng-class="{\'read_only\':(readOnly)}"></span>' +
        '<span class="icon {{iconOn}} ionic_rating_icon_on" ng-style="iconOnColor" ng-click="ratingsUnClicked(4)" ng-show="rating > 3" ng-class="{\'read_only\':(readOnly)}"></span>' +
        '<span class="icon {{iconOff}} ionic_rating_icon_off" ng-style="iconOffColor" ng-click="ratingsClicked(5)" ng-show="rating < 5" ng-class="{\'read_only\':(readOnly)}"></span>' +
        '<span class="icon {{iconOn}} ionic_rating_icon_on" ng-style="iconOnColor" ng-click="ratingsUnClicked(5)" ng-show="rating > 4" ng-class="{\'read_only\':(readOnly)}"></span>' +
        '</div>',
      scope: {
        ratingsObj: '=ratingsobj'
      },
      link: function(scope, element, attrs) {

        //Setting the default values, if they are not passed
        scope.iconOn = scope.ratingsObj.iconOn || 'ion-ios-star';
        scope.iconOff = scope.ratingsObj.iconOff || 'ion-ios-star-outline';
        scope.iconOnColor = scope.ratingsObj.iconOnColor || 'rgb(200, 200, 100)';
        scope.iconOffColor = scope.ratingsObj.iconOffColor || 'rgb(200, 100, 100)';
        scope.rating = scope.ratingsObj.rating || 1;
        scope.minRating = scope.ratingsObj.minRating || 1;
        scope.readOnly = scope.ratingsObj.readOnly || false;

        //Setting the color for the icon, when it is active
        scope.iconOnColor = {
          color: scope.iconOnColor
        };

        //Setting the color for the icon, when it is not active
        scope.iconOffColor = {
          color: scope.iconOffColor
        };

        //Setting the rating
        scope.rating = (scope.rating > scope.minRating) ? scope.rating : scope.minRating;

        //Setting the previously selected rating
        scope.prevRating = 0;

        //Called when he user clicks on the rating
        scope.ratingsClicked = function(val) {
          if (scope.minRating !== 0 && val < scope.minRating) {
            scope.rating = scope.minRating;
          } else {
            scope.rating = val;
          }
          scope.prevRating = val;
          scope.ratingsObj.callback(scope.rating);
        };

        //Called when he user un clicks on the rating
        scope.ratingsUnClicked = function(val) {
          if (scope.minRating !== 0 && val < scope.minRating) {
            scope.rating = scope.minRating;
          } else {
            scope.rating = val;
          }
          if (scope.prevRating == val) {
            if (scope.minRating !== 0) {
              scope.rating = scope.minRating;
            } else {
              scope.rating = 0;
            }
          }
          scope.prevRating = val;
          scope.ratingsObj.callback(scope.rating);
        };
      }
    }
  }