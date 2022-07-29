<template>
  <div>
    <el-button type="info" @click="logout">退出</el-button>
  </div>
</template>

<script>
export default {
  name: 'HomeVue',
  methods: {
    logout () {
      // 清空 token
      window.sessionStorage.clear()
      // 重定向
      this.$router.push('/login')
    }
  }
}
</script>

<style lang="less" scoped>

</style>
