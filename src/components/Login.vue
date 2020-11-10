<!-- 登录界面 -->
<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="">
      </div>
      <!-- 登录表单区域 -->
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules" label-width="0px" class="login_form">
        <el-form-item prop="username">                            <!-- 看清楚，这父传子传的是字符串username，不是变量username -->
          <el-input v-model="loginForm.username" prefix-icon="iconfont icon-user"></el-input>        
        </el-form-item>
        <el-form-item prop="password">
          <el-input type="password" v-model="loginForm.password" prefix-icon="iconfont icon-3702mima"></el-input>
        </el-form-item>
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>           <!-- element-ui的button组件发生点击事件时向父组件发射了名字叫"click"的自定义事件，所以这里的click不是原生事件 -->
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Login',
    data(){
      return {
        loginForm: {                  //这里直接把属性名定义为接口要求的参数名，发送请求时直接把这个对象当做参数对象传递
          username: 'admin',
          password: '123456'
        },
        loginFormRules: {
          username: [
            { required: true, message: '请输入登录名称', trigger: 'blur' },
            { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
          ],
          password: [
            { required: true, message: '请输入登录密码', trigger: 'blur' },
            { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
          ]
        }
      };
    },
    methods: {
      //点击重置按钮，重置登录表单
      resetLoginForm(){
        this.$refs.loginFormRef.resetFields();
      },
      //点击登录按钮，进行登录
      login(){
        this.$refs.loginFormRef.validate(async valid => {                        //对表单进行预校验(如果所有输入框的内容符合各自的验证规则，则向callback中传入true；否则传入false)
          if(!valid) return;
          const {data: res} = await this.$http.post('login', this.loginForm);    //baseURL里最后有个/，所以这里可以不加/。使用await对promise处理，得到的值就是then/catch回调的参数；如果是then可以省略，如果是catch则不能省略。解构时可以重命名：data: res
          if(res.meta.status !== 200) return this.$message.error('登录失败');    //使用return可以省略else
          this.$message.success('登录成功');
          window.sessionStorage.setItem('token', res.data.token);                 //将token保存到sessionStorage中
          this.$router.push('/home');
        });
      }
    }
  }
</script>

<style lang="less" scoped>
  .login_container{
    height: 100%;
    background-color: #2b4b6b;
  }
  .login_box{
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 3px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    .avatar_box{
      height: 130px;
      width: 130px;
      border: 1px solid #eee;
      border-radius: 50%;
      padding: 10px;
      box-shadow: 0 0 10px #ddd;
      position: absolute;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: #fff;
      img{
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #eee;
      }
    }
  }
  .login_form{
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
  }
  .btns{
    display: flex;
    justify-content: flex-end;
  }
</style>