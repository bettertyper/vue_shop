<!--  -->
<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type=primary @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 商品分类列表区域 -->
      <tree-table class="treeTable" :data="catelist" :columns="columns" :selection-type="false" :expand-type="false" show-index index-text="#" border :show-row-hover="false">     <!--selection-type属性为false时去除每行前的复选框。expand-type属性为false时去除展开列。show-index属性为true时显示序号-->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: lightgreen;"></i>
          <i class="el-icon-error" v-else></i>
        </template>
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <template slot="opt">
          <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <!-- 添加商品分类的对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed">
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <el-cascader expand-trigger="hover" v-model="selectedKeys" :options="parentCateList" :props="cascaderProps" @change="parentCateChanged" clearable change-on-select></el-cascader>     <!--change-on-select属性为true时允许选中任意一级-->
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: 'Cate',
    data(){
      return {
        //查询条件
        queryInfo: {
          type: 3,
          pagenum: 1,
          pagesize: 5
        },
        //商品分类的数据列表
        catelist: [],
        //总数据条数
        total: 0,
        //tree-table组件的指定列数组
        columns: [
          {
            label: '分类名称',
            prop: 'cat_name'
          },
          {
            label: '是否有效',
            type: 'template',
            template: 'isok'
          },
          {
            label: '排序',
            type: 'template',
            template: 'order'
          },
          {
            label: '操作',
            type: 'template',
            template: 'opt'
          }
        ],
        //控制添加分类对话框的显示/隐藏
        addCateDialogVisible: false,
        //添加分类的表单数据对象
        addCateForm: {
          cat_name: '',
          cat_pid: 0,       //接口规定：pid是要添加分类的父级分类id，所有一级分类的pid都为0
          cat_level: 0      //接口规定：0表示一级分类，1表示二级分类，2表示三级分类
        },
        //添加分类的表单验证规则对象
        addCateFormRules: {
          cat_name: [
            { required: true, message: '请输入分类名称', trigger: 'blur' }
          ]
        },
        //父级商品分类的数据列表
        parentCateList: [],
        //级联选择器组件的配置对象
        cascaderProps: {
          value: 'cat_id',
          label: 'cat_name',
          children: 'children'
        },
        //级联选择器中选中的父级分类的id数组
        selectedKeys: []
      };
    },
    created(){
      this.getCateList();
    },
    methods: {
      //获取商品分类数据
      async getCateList(){
        const {data: res} = await this.$http.get('categories', {params: this.queryInfo});
        if(res.meta.status !== 200) return this.$message.error('获取商品分类失败');
        // console.log(res.data)
        this.catelist = res.data.result;
        this.total = res.data.total;
      },
      //根据新的每页商品分类数据条数请求商品分类数据
      handleSizeChange(newSize){
        this.queryInfo.pagesize = newSize;
        this.getCateList();
      },
      //根据新的第几页请求商品分类数据
      handleCurrentChange(newPage){
        this.queryInfo.pagenum = newPage;
        this.getCateList();
      },
      //点击添加分类按钮，展示添加分类对话框
      showAddCateDialog(){
        this.getParentCateList();
        this.addCateDialogVisible = true;
      },
      //获取父级商品分类的数据
      async getParentCateList(){
        const {data: res} = await this.$http.get('categories', {params: {type: 2}});      //接口规定：例如：type=3，则一级分类的children属性为二级分类数组，二级分类的children属性为三级分类数组；如果type=2，则一级分类的children属性为二级分类数组，二级分类没有children属性
        if(res.meta.status !== 200) return this.$message.error('获取父级商品分类失败');
        // console.log(res.data);
        this.parentCateList = res.data;
      },
      //级联选择器的选中项发生变化时，修改addCateForm中的pid和level
      parentCateChanged(){
        // console.log(this.selectedKeys)
        if(this.selectedKeys.length > 0){         //如果selectedKeys不为空，说明选择了父级分类
          this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1];
          this.addCateForm.cat_level = this.selectedKeys.length;
        }else{                                    //如果selectedKeys为空，可能根本没选父级分类，也可能是先选了后又清空了(else中的操作就是为先选了后又清空而考虑的，不重置的话pid和level会按清空之前的选择而被赋值)
          this.addCateForm.cat_pid = 0;
          this.addCateForm.cat_level = 0;
        }
      },
      //点击添加分类对话框的确定按钮，添加分类
      addCate(){
        // console.log(this.addCateForm)
        this.$refs.addCateFormRef.validate(async valid => {
          if(!valid) return;
          const {data: res} = await this.$http.post('categories', this.addCateForm);
          if(res.meta.status !== 201) return this.$message.error('添加分类失败');
          this.$message.success('添加分类成功');
          this.getCateList();
          this.addCateDialogVisible = false;
        });
      },
      //添加分类对话框关闭时，重置表单，重置selectedKeys，重置pid和level
      addCateDialogClosed(){
        this.$refs.addCateFormRef.resetFields();
        this.selectedKeys = [];
        this.addCateForm.cat_pid = 0;
        this.addCateForm.cat_level = 0;
      }
    }
  }
</script>

<style lang="less" scoped>
  .treeTable{
    margin-top: 15px;
  }
  .el-cascader{
    width: 100%;
  }
</style>