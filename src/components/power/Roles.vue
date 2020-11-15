<!--  -->
<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="roleList" border stripe>
        <el-table-column type="expand">                 <!--展开列-->
          <template slot-scope="scope">
            <!-- 渲染一级权限 -->
            <el-row :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']" v-for="(item1, i1) in scope.row.children" :key="item1.id">
              <!-- 一级权限展示 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <!-- 渲染二级权限 -->
                <el-row :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']" v-for="(item2, i2) in item1.children" :key="item2.id">
                  <!-- 二级权限展示 -->
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRightById(scope.row, item2.id)">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <!-- 渲染并展示三级权限 -->
                    <el-tag type="warning" v-for="(item3, i3) in item2.children" :key="item3.id" closable @close="removeRightById(scope.row, item3.id)">{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>                   
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分配权限的对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed">
      <el-tree :data="rightsList" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys" ref="treeRef"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: 'Roles',
    data(){
      return {
        //角色列表
        roleList: [],
        //控制分配权限对话框的显示与隐藏
        setRightDialogVisible: false,
        //所有权限的列表
        rightsList: [],
        //树形控件的属性绑定对象
        treeProps: {
          children: 'children',
          label: 'authName'
        },
        //默认选中的节点id值数组
        defKeys: [],
        //准备分配权限的角色id
        roleId: ''
      };
    },
    created(){
      this.getRolesList();
    },
    methods: {
      //获取角色列表
      async getRolesList(){
        const {data: res} = await this.$http.get('roles');
        if(res.meta.status !== 200) return this.$message.error('获取角色列表失败');
        this.roleList = res.data;
        // console.log(this.roleList)
      },
      //根据权限id删除对应的权限
      async removeRightById(role, rightId){
        const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err);
        if(confirmResult !== 'confirm') return this.$message.info('已取消删除');
        const {data: res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`);
        if(res.meta.status !== 200) return this.$message.error('删除权限失败');
        this.$message.success('删除权限成功');
        role.children = res.data;               //接口提供了返回的data属性就是更新后的权限，可以不this.getRolesList()，而且this.getRolesList()会使整个角色列表区域重新渲染，导致展开列合上
      },
      //展示分配权限的对话框
      async showSetRightDialog(role){
        this.roleId = role.id;                        //保存用户id供allotRights中使用
        const {data: res} = await this.$http.get('rights/tree');
        if(res.meta.status !== 200) return this.$message.error('获取权限数据失败');
        this.rightsList = res.data;
        // console.log(this.rightsList)
        this.getLeafKeys(role, this.defKeys);         //后台数据中：每级权限都是通过children属性连接，而角色和一级权限之间也是通过children属性连接，所以可以直接把角色传进去递归，且必须传角色，而不能传role.children[0]这样的某个一级权限，否则只有该一级权限执行了递归
        this.setRightDialogVisible = true;
      },
      //递归获取角色下所有三级权限的id，并保存到defKeys数组中
      getLeafKeys(node, arr){
        if(!node.children) return arr.push(node.id);
        node.children.forEach(item => this.getLeafKeys(item, arr));
      },
      //分配权限对话框关闭时，清空defKeys(否则defKeys中还保留这上个角色的权限id)
      setRightDialogClosed(){
        this.defKeys = [];
      },
      //点击分配权限对话框的确定按钮，为角色分配权限
      async allotRights(){
        const keys = [
          ...this.$refs.treeRef.getCheckedKeys(),           //el-tree组件的getCheckedKeys方法，返回由所有已选中节点的node-key组成的数组
          ...this.$refs.treeRef.getHalfCheckedKeys()        //el-tree组件的getHalfCheckedKeys方法，返回由所有已半选中节点的node-key组成的数组
        ];
        // console.log(keys)
        const idStr = keys.join(',');
        const {data: res} = await this.$http.post(`roles/${this.roleId}/rights`, {rids: idStr});
        if(res.meta.status !== 200) return this.$message.error('分配权限失败');
        this.$message.success('分配权限成功');
        this.getRolesList();
        this.setRightDialogVisible = false;
      }
    }
  }
</script>

<style lang="less" scoped>
  .el-tag{
    margin: 7px;
  }
  .bdtop{
    border-top: 1px solid #eee;
  }
  .bdbottom{
    border-bottom: 1px solid #eee;
  }
  .vcenter{
    display: flex;
    align-items: center;
  }
</style>