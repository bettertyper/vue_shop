<!--  -->
<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 头部警告区域 -->
      <el-alert show-icon title="注意：只允许为第三级分类设置相关参数" type="warning" :closable="false"></el-alert>
      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader
            expand-trigger="hover"
            v-model="selectedCateKeys"
            :options="catelist"
            :props="cateProps"
            @change="handleChange"></el-cascader>
        </el-col>
      </el-row>
      <!-- tab页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">            
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i, scope.row)">{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"></el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加属性</el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i, scope.row)">{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"></el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button size="mini" type="primary" icon="el-icon-edit"  @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数的对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed">
      <!-- 添加参数的表单 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改参数的对话框 -->
    <el-dialog
      :title="'修改' + titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed">
      <!-- 修改参数的表单 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: 'Params',
    data(){
      return {
        //商品分类列表
        catelist: [],
        //级联选择框的配置对象
        cateProps: {
          value: 'cat_id',
          label: 'cat_name',
          children: 'children'
        },
        //级联选择框双向绑定的数组
        selectedCateKeys: [],
        //tabs双向绑定的被激活的页签名
        activeName: 'many',
        //动态参数的数据列表
        manyTableData: [],
        //静态属性的数据列表
        onlyTableData: [],
        //控制添加对话框的显示与隐藏
        addDialogVisible: false,
        //添加参数的表单数据对象
        addForm: {
          attr_name: ''
        },
        //添加参数表单的验证规则对象
        addFormRules: {
          attr_name: [
            {required: true, message: '请输入参数名称', trigger: 'blur'}
          ]
        },
        //控制修改对话框的显示与隐藏
        editDialogVisible: false,
        //修改表单的数据对象
        editForm: {},
        //修改表单的验证规则对象
        editFormRules: {
           attr_name: [
            {required: true, message: '请输入参数名称', trigger: 'blur'}
          ]
        }
      };
    },
    created(){
      this.getCateList();
    },
    methods: {
      //获取所有的商品分类列表
      async getCateList(){
        const {data: res} = await this.$http.get('categories');
        if(res.meta.status !== 200) return this.$message.error('获取商品列表失败');
        this.catelist = res.data;
      },
      //级联选择器的选中项发生变化时，获取对应分类的参数，要求只能选中三级分类
      handleChange(){
        this.getParamsData();
      },
      //点击某个tab页签，获取分类的动态/静态参数
      handleTabClick(){
        this.getParamsData();
      },
      //获取对应分类的动态/静态参数列表
      async getParamsData(){
        if(this.selectedCateKeys.length !== 3){
          this.selectedCateKeys = [];
          this.manyTableData = [];        //如果上次是一个三级分类，现在切换为非三级分类，那么不清空参数列表则表格中还是上一个三级分类的数据
          this.onlyTableData = [];        //同上
          return;
        }
        const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {params: {sel: this.activeName}});
        if(res.meta.status !== 200) return this.$message.error('获取参数列表失败');
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : [];           //attr_vals是字符串(每一项以,分隔)，把它变成数组。空字符串使用split方法得到的是['']，而不是[]
          item.inputVisible = false;                                                  //控制每个参数的展开列中的文本框的显示与隐藏
          item.inputValue = '';                                                       //每个参数的展开列中的文本框双向绑定的数据
        });
        // console.log(res.data)
        if(this.activeName === 'many'){
          this.manyTableData = res.data;
        }else{
          this.onlyTableData = res.data;
        }
      },
      //添加对话框关闭时，重置表单
      addDialogClosed(){
        this.$refs.addFormRef.resetFields();
      },
      //点击添加对话框的确定按钮，添加参数
      addParams(){
        this.$refs.addFormRef.validate(async valid => {
          if(!valid) return;
          const {data: res} = await this.$http.post(`categories/${this.cateId}/attributes`, {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          });
          if(res.meta.status !== 201) return this.$message.error('添加参数失败');
          this.$message.success('添加参数成功');
          this.addDialogVisible = false;
          this.getParamsData();
        });
      },
      //点击编辑按钮，根据参数id获取参数信息，显示修改对话框
      async showEditDialog(attr_id){
        const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes/${attr_id}`, {
          params: {attr_sel: this.activeName}
        });
        if(res.meta.status !== 200) return this.$message.error('获取参数信息失败');
        this.editForm = res.data;
        this.editDialogVisible = true;
      },
      //修改对话框关闭时，重置表单
      editDialogClosed(){
        this.$refs.editFormRef.resetFields();
      },
      //点击修改对话框的确定按钮，修改参数
      editParams(){
        this.$refs.editFormRef.validate(async valid => {
          if(!valid) return;
          const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          });
          if(res.meta.status !== 200) return this.$message.error('修改参数失败');
          this.$message.success('修改参数成功');
          this.getParamsData();
          this.editDialogVisible = false;
        });
      },
      //点击删除按钮，根据参数id删除该参数
      async removeParams(attr_id){
        const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err);
        if(confirmResult !== 'confirm') return this.$message.info('已取消删除');
        const {data: res} = await this.$http.delete(`categories/${this.cateId}/attributes/${attr_id}`);
        if(res.meta.status !== 200) return this.$message.error('删除参数失败');
        this.$message.success('删除参数成功');
        this.getParamsData();
      },
      //展开列中的文本框失去焦点/按下回车后，展示按钮，添加新的可选项
      handleInputConfirm(row){
        if(row.inputValue.trim().length === 0){
          row.inputValue = '';
          row.inputVisible = false;
          return;
        }
        row.attr_vals.push(row.inputValue.trim());      //前端修改
        row.inputValue = '';
        row.inputVisible = false;
        this.saveAttrVals(row);                         //将修改提交到后端
      },
      //点击展开列中的按钮，展示文本框，并让文本框获取焦点
      showInput(row){
        row.inputVisible = true;
        this.$nextTick(_ => {                               //inputVisible变成true后，文本框并不会立即渲染到页面中，这时还获取不到input元素，所以用$nextTick：当页面上的元素被重新渲染之后，才会执行回调函数中的代码
          this.$refs.saveTagInput.$refs.input.focus();      //el-input组件中的input文本框的ref属性值为input，得到input元素后，调用focus方法可以使元素获取焦点
        });
      },
      //可选项的tag关闭时，删除该可选项
      handleClose(i, row){
        row.attr_vals.splice(i, 1);                     //前端修改
        this.saveAttrVals(row);                         //将修改提交到后端
      },
      //将参数可选项的修改操作保存到后端
      async saveAttrVals(row){
        const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(',')
        });
        if(res.meta.status !== 200) return this.$message.error('修改可选项失败');
        this.$message.success('修改可选项成功');
      }
    },
    computed: {
      //按钮是否不可用
      isBtnDisabled(){
        if(this.selectedCateKeys.length !== 3) return true;
        return false;
      },
      //当前选中的三级分类的id
      cateId(){
        if(this.selectedCateKeys.length === 3) return this.selectedCateKeys[2];
        return null;
      },
      //动态计算标题的文本
      titleText(){
        if(this.activeName === 'many') return '动态参数';
        return '静态属性';
      }
    }
  }
</script>

<style lang="less" scoped>
  .cat_opt{
    margin: 15px 0;
  }
  .el-tag{
    margin: 5px;
  }
  .input-new-tag{
    width: 120px;
  }
</style>