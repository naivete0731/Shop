<template>
  <div>
   <!-- 面包屑导航 -->
   <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 为ECharts准备一个具备大小（宽高）的Dom -->
      <div id="main" style="width: 950px; height: 400px"></div>
    </el-card>
  </div>
</template>

<script>
// 导入 echarts
import * as echarts from 'echarts'
import _ from 'lodash'

export default {
  name: 'ReportVue',
  data () {
    return {
      // 需要合并的数据
      options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    }
  },
  created () {

  },
  // 此时，页面上的元素，已经被渲染完毕了
  mounted () {
    this.echartsInit()
  },
  methods: {
    async echartsInit () {
      // 3.基于准备好的dom，初始化echarts实例
      const myChart = echarts.init(document.getElementById('main'))

      const { data: res } = await this.$axios.get('reports/type/1')
      if (res.meta.status !== 200) return this.$message.error('获取折线图数据失败')
      // 4. 准备数据和配置项
      // 指定图表的配置项和数据
      // const option = {
      //   title: {
      //     text: 'ECharts 入门示例'
      //   },
      //   tooltip: {},
      //   legend: {
      //     data: ['销量']
      //   },
      //   xAxis: {
      //     data: ['衬衫', '羊毛衫', '雪纺衫', '裤子', '高跟鞋', '袜子']
      //   },
      //   yAxis: {},
      //   series: [
      //     {
      //       name: '销量',
      //       type: 'bar',
      //       data: [5, 20, 36, 10, 10, 20]
      //     }
      //   ]
      // }
      const result = _.merge(res.data, this.options)
      // 5. 展示数据
      // myChart.setOption(option)
      myChart.setOption(result)
    }
  }
}
</script>

<style lang="less" scoped>

</style>
