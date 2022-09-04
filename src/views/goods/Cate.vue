<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
  <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
  <el-breadcrumb-item><a href="/">商品管理</a></el-breadcrumb-item>
  <el-breadcrumb-item>商品分类</el-breadcrumb-item>
</el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <tree-table class="tree-table"
      :data="catelist"
      :columns="columns"
      :selection-type="false"
      :expand-type="false"
      show-index
      index-text="#"
      lazy
      border>
      <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success"
          v-if="scope.row.cat_deleted === false" style="color: lightgreen;"></i>
          <i class="el-icon-error" v-else style="color: red;"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini"
          v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" size="mini"
          v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning" size="mini"
          v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="showCateDialog(scope.row.cat_id)">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeCateById(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
         <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[3, 5, 10, 20]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
    </el-card>

    <!-- 添加分类的对话框 -->
    <el-dialog title="添加分类"
    :visible.sync="addCateDialogVisible" width="50%"
    @close="addCateDialogClosed"
   >
   <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px" >
  <el-form-item label="分类名称：" prop="cat_name">
    <el-input v-model="addCateForm.cat_name"></el-input>
  </el-form-item>
  <el-form-item label="父级分类：">
    <!-- optioons 用来指定数据源 -->
    <!-- props 用来指定配置对象 -->
    <el-cascader
    v-model="selectedKeys"
    :options="parentCateList"
    :props="cascaderProps"
    @change="parentCateChanged"
    clearable
    popper-class="cascaders"
    ></el-cascader>
    </el-form-item>
  </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addCate">确定</el-button>
      </span>
    </el-dialog>

    <!-- 修改分类的对话框 -->
    <el-dialog title="修改分类"
    :visible.sync="editCateFormDialogVisible" width="50%"
    >
      <el-form :model="editCateForm" :rules="addCateFormRules" ref="editCateFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader
          v-model="editCateKeys"
          :options="editparentCateList"
          :props="cascaderProps"
          @change="parentCateChanged"></el-cascader>
        </el-form-item>
      </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editCateFormDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="editCate">确定</el-button>
        </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'CateV',
  data () {
    return {
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类的数据，默认为空
      catelist: [],
      // 总数据条数
      total: 0,
      // 为table指定列的定义
      columns: [{
        label: '分类名称',
        prop: 'cat_name'
      }, {
        label: '是否有效',
        // 表示，将当前列定义为模板列
        type: 'template',
        // 表示当前这一列使用模板名称
        template: 'isok'
      }, {
        label: '排序',
        // 表示，将当前列定义为模板列
        type: 'template',
        // 表示当前这一列使用模板名称
        template: 'order'
      }, {
        label: '操作',
        // 表示，将当前列定义为模板列
        type: 'template',
        // 表示当前这一列使用模板名称
        template: 'opt'
      }],
      // 添加分类对话框显示与隐藏
      addCateDialogVisible: false,
      // 添加分类的表单数据对象
      addCateForm: {
        // 将要添加的分类的名称
        cat_name: '',
        // 父级分类的id
        cat_pid: 0,
        // 分类的等级，默认要添加一级分类
        cat_level: 0
      },
      // 添加分类表单的验证规则
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 1, max: 10, message: '分类名称长度在10个字符串之间', trigger: 'blur' }
        ]
      },
      // 父级分类的列表
      parentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        checkStrictly: true,
        expandTrigger: 'hover'
      },
      // 选中的父级分类的id数组
      selectedKeys: [],
      // 修改分类对话框显示与隐藏
      editCateFormDialogVisible: false,
      // 修改分类表单数据对象
      editCateForm: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      // 修改 父级分类的列表
      editCateKeys: [],
      // 修改 选中的父级分类id数组
      editparentCateList: []
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 获取商品分类数据
    async getCateList () {
      const { data: res } = await this.$axios.get('categories', { params: this.queryInfo })

      if (res.meta.status !== 200) return this.$message.error('获取商品分类失败')

      // 把数据列表，赋值给 cateList
      this.catelist = res.data.result
      console.log(this.catelist)
      // 为总数据条数赋值
      this.total = res.data.total
    },
    // 监听 pagesize 改变
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听 pagenum 改变
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    // 点击按钮，展示添加分类的对话框
    showAddCateDialog () {
      // 先获取父级分类数据列表
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    // 获取父级分类的数据列表
    async getParentCateList () {
      const { data: res } = await this.$axios.get('categories', {
        params: {
          type: 2
        }
      })

      if (res.meta.status !== 200) return this.$message.error('获取父级分类失败')
      this.parentCateList = res.data
      this.editparentCateList = res.data
    },
    // 选择项发生变化触发
    parentCateChanged () {
      console.log(this.selectedKeys)
      console.log(this.selectedKeys[this.selectedKeys.length - 1])
      // 如果 selectedKeys 数组中的 length 大于0，证明选中的父级分类
      // 反之，就说明没有选中任何父级分类
      if (this.selectedKeys.length > 0) {
        // 父级分类的Id
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        this.editCateForm.cat_pid = this.editCateKeys[this.editCateKeys.length - 1]
        // 当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length
        this.editCateForm.cat_level = this.editCateKeys.length
      } else {
        // 父级分类的Id
        this.addCateForm.cat_pid = 0
        this.editCateForm.cat_pid = 0
        // 当前分类的等级赋值
        this.addCateForm.cat_level = 0
        this.editCateForm.cat_level = 0
      }
    },
    // 点击按钮 添加新的分类
    addCate () {
      console.log(this.addCateForm)
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return this.$message.error('验证不通过')
        const { data: res } = await this.$axios.post('categories', this.addCateForm)

        if (res.meta.status !== 201) return this.$message.error('添加分类失败')

        this.$message.success('添加分类成功')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    // 添加对话框的关闭事件 重置表单数据
    addCateDialogClosed () {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },
    // 点击按钮 删除分类
    async removeCateById (id) {
      // 弹框询问是否删除分类
      await this.$confirm('此操作将永久删除该分类,是否继续?', '删除分类', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$axios.delete('categories/' + id)
        if (res.meta.status !== 200) return this.$message.error('删除分类失败')
        this.$message.success('删除成功')
        this.getCateList()
      }).catch((err) => {
        console.log(err)
      })
    },
    // 点击按钮 编辑分类
    async showCateDialog (id) {
      const { data: res } = await this.$axios.get('categories/' + id)
      if (res.meta.status !== 200) return this.$message.error('获取分类失败')
      this.editCateForm = res.data
      console.log(res.data.cat_name)
      this.getParentCateList()
      this.editCateFormDialogVisible = true
    },
    // 点击按钮 修改分类
    async editCate () {
      this.$refs.editCateFormRef.validate(async valid => {
        if (!valid) return this.$message.error('验证不通过')
        const { data: res } = await this.$axios.put('categories/' + this.editCateForm.cat_id, this.editCateForm)
        console.log(this.editCateForm.cat_id)
        if (res.meta.status !== 200) return this.$message.error('修改分类失败')
        this.$message.success('修改成功')
        this.getCateList()
        this.editCateFormDialogVisible = false
      })
    }
  }
}
</script>

<style lang="less" scoped>
.tree-table {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
.cascaders {
  .el-radio__inner {
    border: 0px;
     height: 100%;
    width: 150px;
    opacity: 0;
    position: absolute;
    z-index: 10;
  }
  .el-radio__input.is-checked .el-radio__inner {
    background: none !important;
  }
  .el-radio {
    height: 100%;
    width: 150px;
    opacity: 0;
    position: absolute;
    z-index: 10;
  }
}

</style>
