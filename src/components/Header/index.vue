<template>
  <!-- 头部 -->
  <header class="header">
      <div id="headTxt">
          ConceptThread
      </div>
      <!-- MOOC2Graph -->
      <div class="navs">
      <el-menu :default-active="activeIndex" class="el-menu-demo navs" mode="horizontal" @select="handleSelect">
      <el-menu-item index="1">About</el-menu-item>
      <el-menu-item index="2">Contact</el-menu-item>
      <el-menu-item index="3">?Help</el-menu-item>
      </el-menu></div>
      <!-- <b-nav class="navs" tabs fill>
        <b-nav-item>About |</b-nav-item>
        <b-nav-item>Contact |</b-nav-item>
        <b-nav-item>?Help</b-nav-item>
        <b-nav-item disabled>Disabled</b-nav-item>
      </b-nav> -->
  </header>
</template>

<script>  
export default {
  data() {
    return {
      date:null,
      cityName:'',
      weather: {
              type:'',
              wendu:"18",
              ganmao: '',
              pm10: '--市／--℃',
              pm25: '--',
              quality: '0',
              shidu: '',
              ymd:""
          },
    }
  },
  methods: {
    getDate(){},
    // 获取天气
    getTheWeather() {
      const _this = this;
      this.$axios
        .get("/we/101210101")
        .then((response) => { 
          let data = response.data.data;
           _this.weather={
              type:data.forecast[0]['type'],
              wendu:data.wendu,
              ganmao:data.ganmao,
              pm10: data.pm10,
              pm25: data.pm25,
              quality: data.quality,
              shidu: data.shidu,
              ymd: data.forecast[0]['ymd'],
           }
        })
        .catch(function (error) {
          console.log(error);
        });
    },
  },
  mounted() {
    
    // let _this = this; 
    // this.timer = setInterval(() => {
    //   let date= new Date();   
    //   let hours =  ''+date.getHours();        //时
    //   let minutes = ''+date.getMinutes();    //分
    //   let seconds = ''+date.getSeconds();    //秒
    //   let time =  hours.padStart(2, '0') + ":" + minutes.padStart(2, '0') + ":" + seconds.padStart(2, '0') + "" ;
    //   _this.date = time
    //   // _this.getTheWeather()
    // }, 1000)
  },
  beforeDestroy() {
    if (this.timer) {
      // clearInterval(this.timer); // 在Vue实例销毁前，清除我们的定时器
    }
  }
};
</script>
<style>
  @import './index.css';
</style>