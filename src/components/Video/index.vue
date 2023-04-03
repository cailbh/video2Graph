<!-- eslint-disable no-unused-vars -->
<!-- eslint-disable no-unused-vars -->

<template>
  <div class="video" ref="videoDiv">

    <!-- <div class="panelHead"></div> -->
    <div class="perVideo">
      <VideoPlay v-show="true" :timeDot="timeDot" @videoTime="getVideoTime" :videoUrl="videoUrl" :videoCover="videoCover"
        :width="videoWidth" :height="videoHeight" :autoplay="true" :controls="true" :loop="false" :muted="false"
        preload="auto" :showPlay="true" :playWidth="96" zoom="cotain" />
      <!-- <video class="perVideo" ref="video"   :src="url"></video> -->
    </div>
    <div id="rootTopicLine" ref="rootTopicLine">
      <div id="progressBar" ref="progressBar" @click="processBarCli"></div>
    </div>
    <div id="videoScript" ref="videoScript">
      <!-- <div id="progressBar" ref="progressBar" @click="processBarCli"></div> -->
    </div>
  </div>
</template>
  
<script>

import * as d3 from 'd3'
import { onMounted, ref } from 'vue';
import filenames from "@/utils/fileName";
import domtoimage from 'dom-to-image';
import VideoPlay from '@/components/VideoPlay';
import tools from "@/utils/tools.js";
import scriptsData from '@/assets/json/case1scriptsData.json'

//场景元素div
export default {
  props: ["timeDur"],
  components: {
    VideoPlay
  },
  data() {
    return {
      scriptsData:scriptsData,
      scriptsText:[],
      ketText:[],
      videoWidth: 100,
      videoHeight: 100,
      rootTopicLineWidth:100,
      rootTopicLineHeight:100,
      data: '',
      relData: '',
      timeDot: 0,
      videoDuration: 482,
      publicPath: process.env.BASE_URL,
      vertexShader: '',
      // url:"../videos/[2.1.1]--机器数及特点视频.mp4",
      url: "../videos/case1.mp4",
      videoUrl: require('@/assets/videos/case1.mp4'),
      // 视频封面支持https或require本地地址
      videoCover: require('@/assets/img/tt.jpg'),

      windowWidth: document.documentElement.clientWidth, //实时屏幕宽度
      windowHeight: document.documentElement.clientHeight, //实时屏幕高度
      colorMap: {},
      margin: { top: 5, right: 5, bottom: 5, left: 5 },
      // mcolor: [
      //   "rgb(255,60,60)",
      //   "rgb(155,20,100)",
      //   "rgb(255,83,255)",
      //   "rgb(200,100,50)",
      //   "rgb(235,135,162)",
      //   "rgb(200,200,102)",
      //   "rgb(255,178,101)",
      //   "rgb(63,151,134)",
      //   "rgb(83,155,255)",
      //   "rgb(50,200,120)",
      //   "rgb(2,50,200)",
      //   "rgb(0,122,244)",
      //   "rgb(150,122,244)",
      //   "rgb(168,168,255)",
      //   "rgb(200,200,200)",
      // ],
      mcolor: [
        "rgb(91, 107, 255)",
        "rgb(6, 214, 160)",
        "rgb(255, 120, 90)",
        "rgb(125, 98, 211)",
        "rgb(255, 113, 212)",
        "rgb(112, 214, 255)",
        "rgb(255, 159, 28)",
        "rgb(255, 77, 109)",
      ],
      mLightcolor: [
        "#ff9c9c",
        "#cc88b0",
        "#ffa8ff",
        "#e3b097",
        "#f4c3d0",
        "#f4f4d0",
        "#ffd8b1",
        "#9ecac2",
        "#a8ccff",
        "#97e3ba",
        "#6f8be0",
        "rgb(0,122,244)",
        "#b6a2f7",
        "rgb(168,168,255)",
        "rgb(200,200,200)",
      ],
      DivisionDataList: [],
      rootDivisionDataList: [],
      entDivisionDataList: [],
    };
  },
  watch: {
    timeDur(val) {
      this.timeDot = tools.time2seconds(val[0]);
    },
    scriptsText(val){
      this.drawScript();
    }
  },
  methods: {
    getVideoTime(val) {
      const _this = this;
      let margin = _this.margin;
      let width = this.$refs.progressBar.offsetWidth;
      let timeLinear = d3.scaleLinear([0, _this.videoDuration], [0, width]);
      let mid = timeLinear(val)/width*100;
      _this.addScript(val);
      d3.select("#progressBar")
      .attr("style","background: linear-gradient(90deg, rgb(200, 200, 200) "+mid+"%,rgb(244, 244, 244) "+mid+"%) !important")
      this.$emit("videoTime", val);
    },
    processBarCli(e){
      console.log(e);
      const _this = this;
      let x = e.layerX; 
      let width = this.$refs.progressBar.offsetWidth;
      let timeLinear = d3.scaleLinear([0, width], [0, _this.videoDuration]);
      this.timeDot = timeLinear(x);
    },
    addScript(timeDot){
      const _this = this;
      let scriptsData = _this.scriptsData;
      for(let t in scriptsData){
        let timeDur = scriptsData[t]['time'];
        let sTime = tools.time2seconds(timeDur[0]);
        let eTime = tools.time2seconds(timeDur[1]);
        if((timeDot>sTime)&&(timeDot<eTime)){
          _this.scriptsText = scriptsData[t]['text']
        }

      }
    },
    drawScript(){
      const _this = this;
      let txts = _this.scriptsText;
      let margin = _this.margin; 
      let ketText = _this.ketText;
      let width = this.$refs.videoScript.offsetWidth - margin.left - margin.right;
      let height = this.$refs.videoScript.offsetHeight - margin.top - margin.bottom;
      d3.select("#videoScript").select("svg").remove();
      var svg = d3.select("#videoScript").append("svg")
        .attr("id", "videoScriptSvg")
        .attr("width", width)
        .attr("height", height);
      let tx = 30;
      let ty = 50;
      let lay = 0;
      for(let i =0;i<txts.length;i++){
        let name = txts[i];
        let w = name.length *10;
        let h = 20;
        let rx=5;
        let ry=5;
        // let color = colorMap[ids[i]];
        // _this.drawRect(g, tx, ty, w, h, rx, ry, color, 0.2, color)
        let textColor = "black";
        let stopList = ["of","the","and","be","two","x","y","z"];
        if((ketText.indexOf(name)!=-1)&&(stopList.indexOf(name)==-1)){
          textColor = "red";
        }
        let svgArea = _this.drawTxt(svg, tx, ty, name, textColor, 24,`txts${i}`);
        console.log(svgArea)
        tx +=svgArea.width+5;
        if(tx>(width-200)){
          let tranx = (width-tx)/2;
          for(let j = i;j>=lay;j--){
            d3.select(`#txts${j}`).attr("transform",`translate(${tranx},0)`)
          }
          lay = i;
          tx=30;
          ty+=30;
        }
        if(i==txts.length-1){
          let tranx = (width-tx)/2;
          for(let j = i;j>=lay;j--){
            d3.select(`#txts${j}`).attr("transform",`translate(${tranx},0)`)
          }
        }
      }
    },
    drawrootTopicLine() {
      const _this = this;
      const margin = _this.margin;
      const mcolor = _this.mcolor;

      let width = this.$refs.rootTopicLine.offsetWidth - margin.left - margin.right;
      let height = this.$refs.rootTopicLine.offsetHeight - margin.top - margin.bottom;
      _this.rootTopicLineWidth = width;
      _this.rootTopicLineHeight = height;
      console.log(width,height)
      d3.select("#rootTopicLine").select("svg").remove();
      var svg = d3.select("#rootTopicLine").append("svg")
        .attr("id", "rootTopicLineSvg")
        .attr("width", width)
        .attr("height", height);

      let groups = svg.append("g").attr("id", "groups").attr("width", width).attr("height", height);
      let tootTopicEntG = groups.append("g").attr("id", "tootTopicEntG").attr("width", width).attr("height", height);
      let rootOriLineG = groups.append("g").attr("id", "rootOriLineG").attr("width", width).attr("height", height);

      rootOriLineG.append("line")
        .attr("x1", 0)
        .attr("y1", height / 2)
        .attr("x2", width)
        .attr("y2", height / 2)
        .attr("stroke", "rgb(200,200,200)")
        .attr("stroke-width", "5px");

      let cxLinear = d3.scaleLinear([0, _this.videoDuration], [margin.left, width])

      let data = tools.deepClone(_this.data);
      let DivisionDataList = [];
      let colorIndex = 0;
      for (let i = 0; i < data.length; i++) {
        if (data[i]['layout'] == '0') {
          if (DivisionDataList.length != 0) {
            DivisionDataList[DivisionDataList.length - 1]['nextId'] = data[i]['id'];
            data[i]['preId'] = DivisionDataList[DivisionDataList.length - 1]['id'];
          }
          else { data[i]['preId'] = "-1"; }
          DivisionDataList.push(data[i]);
          let time = tools.time2seconds(data[i]['time'][0]);
          let endTime = tools.time2seconds(data[i]['time'][0]) + data[i]['totalDuration'];
          let cx = cxLinear(time);
          let endx = cxLinear(endTime);
          let color = mcolor[colorIndex];
          if(data[i]['name']!='Test'){
            color = mcolor[colorIndex];
            colorIndex++;
          }
          else{
            color ="rgb(250, 199, 88)";
          }
          // _this.colorMap[data[i]['id']] = colorIndex % color.length;
          _this.drawRect(rootOriLineG, cx - 5, height / 2 - 5, 10, 10, height / 2, "division_" + data[i]["id"], "rootdivisionLine", "rgb(250,250,250)", 0, '', 1)
          _this.drawRect(tootTopicEntG, cx, margin.top, endx - cx, height - margin.top - margin.bottom, height / 2, "rootEnt_" + data[i]['id'], "rootEnt",color , 2, "rgb(150,150,150)", 0.8)
        }
      }
      DivisionDataList[DivisionDataList.length - 1]['nextId'] = "-1";
      _this.rootDivisionDataList = DivisionDataList;

      // rootOriLineG.append("ellipse")
      // .attr("cx",50)
      // .attr("cy",height/2)
      // .attr("rx",50)
      // .attr("ry",height/2)
      // .attr("fill",color[3])
      // .attr("stroke", color[3])

      // .attr("stroke-width", "5px");
      // console.log(data)
      // this.$bus.$emit("getData",data)
    },
    drawRect(svg, x, y, w, h, rx, idName, className, fill, strokeWidth, stroke, opacity) {
      const _this = this;
      svg.append("rect")
        .attr("x", x)
        .attr("y", y)
        .attr("id", idName)
        .attr("class", className)
        .attr("opacity", opacity)
        .attr("width", w)
        .attr("height", h)
        .attr("fill", fill)
        .attr("rx", rx)
        .attr("stroke", stroke)//"rgb(150,150,150)")
        .attr("stroke-width", strokeWidth)
        .on("mousedown", function (d) {
          _this.selectRectId = idName.split("_")[1] //d3.select(this).attr("id");
          if (d3.select(this).attr("class") == "rootdivisionLine") {
            _this.selectRectClass = "rootEnt";
            _this.moveLineWidth = _this.rootTopicLineWidth;
            _this.DivisionDataList = _this.rootDivisionDataList;
            document.getElementById('rootTopicLineSvg').addEventListener("mousemove", _this.moveRect); // 监听点击事件
          }
          else if (d3.select(this).attr("class") == "entdivisionLine") {
            _this.selectRectClass = "editEnt";
            _this.moveLineWidth = _this.entLineWidth;
            _this.DivisionDataList = _this.entDivisionDataList;
            document.getElementById('editEnt').addEventListener("mousemove", _this.moveRect); // 监听点击事件
          }
        })
        .on("mouseup", function (d) {
          document.getElementById('rootTopicLineSvg').removeEventListener("mousemove", _this.moveRect); // 
          document.getElementById('editEnt').removeEventListener("mousemove", _this.moveRect); // 
          // _this.$bus.$emit("graphData", _this.data);

          // _this.$bus.$emit("treeData", _this.treeData);
        })
    },
    moveRect(e) {
      const _this = this;
      let selectRect = _this.DivisionDataList.find(function (d) { return d['id'] == _this.selectRectId; })//右边的rect
      let preId = selectRect['preId'];//左边的rect
      let nextId = selectRect['nextId'];//右边的右边rect
      let rectClass = _this.selectRectClass;
      let prex = 0;
      if (preId != '-1') {
        prex = d3.select("#" + rectClass + "_" + preId).attr("x")
        d3.select("#" + rectClass + "_" + preId)
          .attr("width", function (d) {
            return e.offsetX - prex;
          })
      }
      let nextX = 100;
      if (nextId == '-1') {
        nextX = _this.moveLineWidth;
      }
      else {
        nextX = d3.select("#" + rectClass + "_" + nextId).attr("x");
      }
      d3.select("#" + rectClass + "_" + _this.selectRectId)
        .attr("width", function (d) {
          return nextX - e.offsetX;
        })
        .attr("x", e.offsetX)
      d3.select("#division_" + _this.selectRectId)
        .attr("x", e.offsetX - 5)

      if ((e.offsetX > (_this.rootTopicLineWidth)) || (e.offsetX < (0)) || (e.offsetY > (_this.rootTopicLineHeight)) || (e.offsetY < (0))) {
        document.getElementById('rootTopicLineSvg').removeEventListener("mousemove", _this.moveRect); // 
      }
    },
    drawTxt(svg, tx, ty, txts, fill, size,idName) {
      svg.append("text")
        .attr("y", ty)
        .attr("x", tx)
        .attr("id",idName)
        .attr("fill", fill)
        .attr("font-size", size)
        .text(txts)
        
        let textArea = document.getElementById(idName).getBBox();
      return textArea;
        // .style("text-anchor", anchor)//"middle")
        // .attr("transform", `rotate(${roat} ${tx} ${ty})`);
    },
  },
  created() {
    var _this = this;
    this.$bus.$on('graphData', (val) => {
      _this.data = val;
      let ketText = [];
      for(let i=0;i<_this.data.length;i++){
        let names = _this.data[i]['name'].split(" ");
        for(let n in names){
          ketText.push(names[n]);
        }
      }
      _this.ketText = ketText;
      console.log("12321321321312312",_this.ketText)
      _this.drawrootTopicLine();
    });

    this.$bus.$on('relData', (val) => {
      _this.relData = val;
    });
    this.$nextTick(() => {
      _this.videoWidth = this.$refs.videoDiv.offsetWidth
      _this.videoHeight = this.$refs.videoDiv.offsetHeight
      console.log(this.$refs.videoDiv.offsetWidth)
    })
    // let sceneLiving = create.Scene();
    // let sceneTeaching = create.Scene();

  },
  mounted() {
    var _this = this
  }
} 
</script>

<style>
@import './index.css';
</style>
