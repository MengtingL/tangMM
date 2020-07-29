// pages/historyWeightMa/historyWeightMa.js
import * as echarts from '../../../components/ec-canvas/echarts';
const app = getApp();
const {
    request
} = require("../../../utils/request")
const {
    getDay,
    checkTime
} = require("../../../utils/util")
const moment = require('../../../utils/moment.min.js');
// let date = getDates(1, new Date());
let newDate = moment(getDay(0)).format('YYYY年MM月DD日')
var StarDATE = moment(getDay(-7)).format('YYYY年MM月DD日');
var StarDATE2 = moment(getDay(-7)).format('YYYY年MM月DD日');
var EndDATE = newDate
var EndDATE2 = newDate
const gas = []
const days = []
for (let i = 0; i <= 40; i++) {
    gas.push(i + '周')
}

// for (let i = 0; i <= 6; i++) {
//     days.push(i + '天')
// }

Page({

    /**
     * 页面的初始数据
     */
    data: {
        dateStart: getDay(-7),
        dateEnd: getDay(0),
        CurrentShowDate: true,
        // CurrentShowWeek: false,
        TimeObj: {
            StartDt: newDate,
            EndDt: '2029年01月01日',
            StarDATE,
            EndDATE,
        },
        //图标日期
        TimeObjByDate: {
            StartDt: newDate,
            EndDt: '2029年01月01日',
            StarDATE: StarDATE2,
            EndDATE: EndDATE2,
        },
        ec: {
        },
        TabsIndex: 0,
        predays: [gas],
        multiIndex: [0, 0],
        gas,
        days,
        GA: 53,
        bmi: '',
        target: '',
        RecordList: [],
        legendList: null
    },
    bindCurrentShowWeek() {
        this.setData({
            CurrentShowDate: true,
        })
        this.getWeightListByWeek()
    },
    bindCurrentShowDate() {
        this.setData({
            CurrentShowDate: false,
        })
        this.getWeightListByDate()
    },
    bindStartTimeChange(e) {
        var NewData = this.data.TimeObj;
        let val = e.detail.value
        let dateStart = e.detail.date
        NewData.StarDATE = val;
        let timeCheck = checkTime(dateStart, this.data.dateEnd)
        if (timeCheck) {
            this.setData({
                dateStart,
                TimeObj: NewData,
                CurrentShowDate: false,
            })
            this.getWeightListByDate()
        }

    },
    bindEndTimeChange(e) {
        var NewData = this.data.TimeObj;
        let val = e.detail.value
        let dateEnd = e.detail.date
        NewData.EndDATE = val;
        let timeCheck = checkTime(this.data.dateStart, dateEnd)
        if (timeCheck) {
            this.setData({
                dateEnd,
                TimeObj: NewData,
                CurrentShowDate: false,
            })
            this.getWeightListByDate()
        }

    },
    getWeightListByDate() {
        let self = this
        request({
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "getWeightListByDate",
                "data": [{
                    "dateStart": self.data.dateStart,
                    "dateEnd": self.data.dateEnd
                }]
            }
        }).then(res => {
            console.log(res, "按日期查询");
            if (res.data.code === '0') {
                var ResData = res.data.data[0]
                for (let key in ResData.items) {
                    ResData.items[key].date = moment(ResData.items[key].date).format('YYYY年MM月DD日')

                }
                self.setData({
                    RecordList: ResData.items,
                    bmi: ResData.bmi,
                    target: ResData.target,
                })


            } else {
                wx.showToast({
                    title: res.data.message,
                    icon: 'none',
                    duration: 2000
                })
            }
        })
    },
    getWeightListByWeek() {
        let self = this
        request({
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "getWeightListByWeek",
                "data": [{
                    "gestationalWeek": self.data.GA
                }]
            }
        }).then(res => {
            console.log(res, "孕周");
            if (res.data.code === '0') {
                var ResData = res.data.data[0]
                for (let key in ResData.items) {
                    ResData.items[key].date = moment(ResData.items[key].date).format('YYYY年MM月DD日')

                }
                self.setData({
                    RecordList: ResData.items,
                    bmi: ResData.bmi,
                    target: ResData.target,
                })


            } else {
                wx.showToast({
                    title: res.data.message,
                    icon: 'none',
                    duration: 2000
                })
            }
        })
    },
    bindExDateChangeA: function (e) {
        this.setData({
            EXDATE: e.detail.value
        })
    },
    bindGAChange(e) {
        const val = e.detail.value
        this.setData({
            GA: this.data.gas[val[0]].replace('周', ''),
        })
        this.getWeightListByWeek()
    },
    TabsChange(e) {
        let index = e.currentTarget.dataset.index
        if(index == 1) {
            this.getWeightChart()
        }
        this.setData({
            TabsIndex: index
        })
    },
    getWeightChart() {
        let self = this
        request({
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "getWeightChart",
                "data": []
            }
        }).then(res => {
            if (res.data.code === '0') {
                let color = JSON.parse(res.data.data[0].color);
                let option = JSON.parse(res.data.data[0].option);
                let yAxisLabelValues;
                if (res.data.data[0].yAxisLabelValues !== undefined) {
                    yAxisLabelValues = JSON.parse(res.data.data[0].yAxisLabelValues);
                }
                for (var i = 0; i < color.length; i++) {
                    if (color[i].length > 1) {
                        option.series[i].itemStyle.color = (o) => { return color[o.seriesIndex][o.dataIndex]; };
                    }
                }
                if (yAxisLabelValues !== undefined && yAxisLabelValues.length > 0) {
                    option.yAxis.axisLabel = {
                        formatter: function (v, i) {
                            return yAxisLabelValues[i];
                        }
                    }
                }
                this.setData({
                    legendList: res.data.data[0].legend
                })
                option.tooltip = {
                    show: true,
                    trigger: 'item'
                }
                this.init_echarts(option)
            } else {
                wx.showToast({
                    title: res.data.message,
                    icon: 'none',
                    duration: 2000
                })
            }
        })
    },
    init_echarts: function (options) {
        this.echartsComponent.init((canvas, width, height) => {
            // 初始化图表
            const Chart = echarts.init(canvas, null, {
                width: width,
                height: height
            });
            Chart.setOption(options);
            // 注意这里一定要返回 chart 实例，否则会影响事件处理等    
            return Chart;
        });
    },
    onLoad: function (options) {
        let {
            GA
        } = options
        this.setData({
            GA
        })
        this.echartsComponent = this.selectComponent('#mychart-dom-scatter')
        this.getWeightListByWeek()
    }
})