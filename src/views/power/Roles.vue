<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
  <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
  <el-breadcrumb-item>权限管理</el-breadcrumb-item>
  <el-breadcrumb-item>角色列表</el-breadcrumb-item>
</el-breadcrumb>

    <!-- 卡片视图 -->
  <el-card>
    <el-row>
      <el-col>
        <el-button type="prrimary">添加角色</el-button>
      </el-col>
    </el-row>

  <!-- 角色列表区域 -->
  <el-table :data="rolesList" border stripe>
  <!-- 展开列 -->
  <el-table-column type="expand">
    <template slot-scope="scope">
     <!-- 展开列 -->
     <el-row :class="['bdbottom', i1 === 0 ? 'bdtop' : '','vcenter']" v-for="(item1, i1) in scope.row.children" :key="item1.id">
      <!-- 渲染一级权限 -->
      <el-col :span="5">
        <el-tag closable @close="removeRightById(scope.row, item1.id)">{{item1.authName}}</el-tag>
        <i class="el-icon-caret-right"></i>
      </el-col>
      <!-- 渲染二级和三级权限 -->
      <el-col :span="18">
          <!-- 通过 for 循环 嵌套渲染耳机权限 -->
          <el-row :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']" v-for="(item2, i2) in item1.children" :key="item2.id">
            <el-col :span="5">
              <el-tag type="success" closable @close="removeRightById(scope.row, item2.id)">
                {{item2.authName}}
              </el-tag>
              <i class="el-icon-caret-right"></i>
            </el-col>
            <el-col :span="17">
              <el-tag v-for="(item3) in item2.children" :key="item3.id" closable type="warning" @close="removeRightById(scope.row, item3.id)">
              {{item3.authName}}
              </el-tag>
            </el-col>
          </el-row>
      </el-col>
     </el-row>
    </template>
  </el-table-column>
  <!-- 索引列 -->
    <el-table-column type="index"></el-table-column>
    <el-table-column label="角色名称" prop="roleName"></el-table-column>
    <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
    <el-table-column label="操作" width="300px">
      <template slot-scope="scope">
        <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
        <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
        <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
      </template>
    </el-table-column>
  </el-table>
  </el-card>

      <!-- 分配权限的对话框 -->
      <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%" @close="setRightDialogClosed">
        <!-- 树形控件 -->
        <el-tree :data="rightsList" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys" ref="treeRef"></el-tree>
        <span slot="footer" class="dialog-footer">
          <el-button @click="setRightDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="allotRights">确定</el-button>
        </span>
      </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'RolesV',
  data () {
    return {
      // 所有角色列表数据
      rolesList: [],
      // 控制分配权限对话框的显示与隐藏
      setRightDialogVisible: false,
      // 所有权限的数据
      rightsList: [],
      // 树形控件的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中的节点Id值数组
      defKeys: [],
      // 当前即将分配权限的额角色id
      roleId: ''
    }
  },
  created () {
    this.getRolesList()
  },
  methods: {
    // 获取所有角色的列表
    async getRolesList () {
      const { data: res } = await this.$axios.get('roles')

      if (res.meta.status !== 200) return this.$message.error('获取角色列表失败')

      this.rolesList = res.data
      console.log(this.rolesList)
    },
    // 根据Id删除对应的权限
    async removeRightById (role, rightId) {
      // 弹框提示用户是否要删除
      const confirmResult = await this.$confirm('此操作将永久删除该文件，是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      if (confirmResult !== 'confirm') return this.$message.info('取消了删除')

      const { data: res } = await this.$axios.delete(`roles/${role.id}/rights/${rightId}`)

      if (res.meta.status !== 200) return this.$message.error('删除权限失败')

      // this.getRolesList()
      role.children = res.data
      this.$message.success('删除权限成功')
    },
    // 展示分配权限的对话框
    async showSetRightDialog (role) {
      this.roleId = role.id
      // 获取所有权限列表
      const { data: res } = await this.$axios.get('rights/tree')

      if (res.meta.status !== 200) return this.$message.error('获取权限列表失败')

      // 把获取到的权限数据保存到 data 中
      this.rightsList = res.data

      // 递归获取三级节点Id
      this.getLeafKeys(role, this.defKeys)
      console.log(this.defKeys)
      this.setRightDialogVisible = true
    },
    // 通过递归的形式,获取角色下所有三级权限的id,并保存到 defKeys数组中
    getLeafKeys (node, arr) {
      // 如果当前 node 节点不包含 children 属性，则是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }

      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    // 监听分配权限对话框的关闭事件
    setRightDialogClosed () {
      this.defKeys = []
      this.setRightDialogVisible = false
    },
    // 点击为角色分配权限
    async allotRights () {
      const keys = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()]

      console.log(keys)

      const idStr = keys.join(',')

      const { data: res } = await this.$axios.post(`roles/${this.roleId}/rights`, { rids: idStr })

      if (res.meta.status !== 200) return this.$message.error('分配权限失败')

      this.$message.success('分配权限成功')
      this.getRolesList()
      this.setRightDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
 .el-col {
  margin: 7px;
 }
 .bdtop {
  border-top: 1px solid #eee;
 }
 .bdbottom {
  border-bottom: 1px solid #eee;
 }

 .vcenter {
  display: flex;
  align-items: center;
 }
</style>
