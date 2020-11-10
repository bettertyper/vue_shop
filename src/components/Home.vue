<!-- 主页 -->
<template>
  <el-container class="home-container">
    <!-- 页面头部区域 -->
    <el-header>
      <div>
        <img src="../assets/logo.png" alt="">
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 页面主体区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <!-- 侧边栏折叠按钮 -->
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!-- 侧边栏菜单 -->
        <el-menu background-color="#333744"
                 text-color="#fff"
                 active-text-color="#409eff" 
                 :unique-opened="true" 
                 :collapse="isCollapse" 
                 :collapse-transition="false" 
                 :router="true" 
                 :default-active="activePath">    <!--unique-opened属性为true时保证展开一项时其它项关闭。collapse属性为true时菜单折叠。collapse-transition属性为false时取消自带的折叠动画。router属性为true时点击每一个el-menu-item可以跳转到以其index值为路径的路由。default-active属性值为某个el-menu-item的index，默认情况下使该el-menu-item保持激活状态-->
          <!-- 一级菜单 -->
          <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">        <!--每一项的index属性值(字符串)不同才能保持独立，而不会所有项同时展开-->
            <template slot="title">
              <i :class="iconsObj[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="saveNavState('/' + subItem.path)">       <!--以/subItem.path为跳转路径，把这个路径作为/home的子路由，则就不会替换App中的router-view，而是替换Home中的router-view--> 
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧内容主体 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
  export default {
    name: 'Home',
    data(){
      return {
        menuList: [],
        iconsObj: {
          '125': 'iconfont icon-user',
          '103': 'iconfont icon-tijikongjian',
          '101': 'iconfont icon-shangpin',
          '102': 'iconfont icon-danju',
          '145': 'iconfont icon-baobiao'
        },
        isCollapse: false,
        activePath: ''
      };
    },
    created(){
      this.getMenuList();
      this.activePath = window.sessionStorage.getItem('activePath');
    },
    methods: {
      //退出登录
      logout(){
        window.sessionStorage.clear();
        this.$router.push('/login');
      },
      //获取所有的菜单列表数据
      async getMenuList(){
        const {data: res} = await this.$http.get('menus');
        if(res.meta.status !== 200) return this.$message.error(res.meta.msg);
        this.menuList = res.data;
      },
      //切换菜单的折叠与展开
      toggleCollapse(){
        this.isCollapse = !this.isCollapse
      },
      //保存链接的激活状态
      saveNavState(activePath){
        window.sessionStorage.setItem('activePath', activePath);
        this.activePath = activePath;
      }
    }
  }
</script>

<style lang="less" scoped>
  .home-container{
    height: 100%;
  }
  .el-header{
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    padding-left: 0;                        /*el-header组件自带左内边距*/
    align-items: center;                    /*默认值为stretch，会导致弹性元素占满一行主轴*/
    color: #fff;
    font-size: 20px;
    >div{
      display: flex;
      align-items: center;
      span{
        margin-left: 15px;
      }
    }
  }
  .el-header img{
    width: 40px;
  }
  .el-aside{
    background-color: #333744;
    .el-menu{
      border-right: none;
    }
  }
  .el-main{
    background-color: #eaedf1;
  }
  .iconfont{
    margin-right: 10px;
  }
  .toggle-button{
    background-color: #4a5064;
    font-size: 10px;
    line-height: 24px;
    color: #fff;
    text-align: center;
    letter-spacing: 0.2em;                /*文字间距*/
    cursor: pointer;
  }
</style>