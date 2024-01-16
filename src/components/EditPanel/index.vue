<!-- eslint-disable no-unused-vars -->
<!-- eslint-disable no-unused-vars -->

<template>
  <div class="editPanel">
    <div class="panelHead">SupportPanel</div>
    <div id="editPanelDiv" class="panelBody" ref="editPanelDiv">
      <div id="topicLine" ref="topicLine"></div>
      <!-- <div id="rootTree" ref="rootTree">
        <div id="toolsButs">
          <el-collapse accordion>
            <el-collapse-item>
              <template slot="title">
                <img class="iconUpload" :src="toolsButsUrl">
              </template>
              <div id="addNodeSonDiv" class="toolsBut" @click="addNodeSonClk">
                <img class="iconUpload" :src="addNodeSonUrl">
              </div>
              <div id="addNodePerDiv" class="toolsBut" @click="addNodePerClk">
                <img class="iconUpload" :src="addNodePerUrl">
              </div>
              <div id="addLinkBasicDiv" class="toolsBut" @click="addLinkBasicClk">
                <img class="iconUpload" :src="addLinkBasicUrl">
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div> -->
      <div id="editData" ref="editData">
        <el-table class="editTable" :data="tableData" style="width: 100%">
          <el-table-column prop="key" label="" width="260">
          </el-table-column>
          <el-table-column prop="value" label="" width="260">
            <template slot-scope="scope">
              <div v-if="scope.row.key == 'Type'">
                <el-radio-group v-model="typeRadio" size="small" @change="selectType">
                  <el-radio-button label="concept"></el-radio-button>
                  <el-radio-button label="test"></el-radio-button>
                  <el-radio-button label="example"></el-radio-button>
                </el-radio-group>
              </div>
              <div v-if="scope.row.key == 'Course style'">
                <div class="block">
                  <el-slider v-model="lectureStyleValue" range>
                  </el-slider>
                </div>
              </div>
              <div v-if="scope.row.key == 'Importance score'">
                <div class="block">
                  <el-slider id="importanceScoreValue" v-model="importanceScoreValue">
                  </el-slider>
                </div>
              </div>
              <div v-if="scope.row.key == 'Name'">
                <!-- <el-input size="small" :placeholder="scope.row.value" v-model="nameinput" clearable>
                </el-input> -->
                <div id="editName">{{nameinput}}</div>
              </div>
              <div :class="scope.row.key + ' tableCell'" :height="scope.row.value === '' ? '10' : '0'"
                disable-transitions>
                <!-- {{ scope.row.value }} -->
              </div>
            </template>
          </el-table-column>
        </el-table>
        <!-- <div id="cancelDiv" @click="cancelClk">
          <img class="iconUpload" :src="cancelUrl">
        </div> -->
        <div id="confirmDiv" @click="confirmClk">
          <img class="iconUpload" :src="confirmUrl">
        </div>
      </div>
    </div>
  </div>
</template>
  
<script>
import * as d3 from 'd3'
import { onMounted, ref } from 'vue';
import domtoimage from 'dom-to-image';
import TestJson from "@/assets/json/case1_fin.json";
import TestRelJson from "@/assets/json/case1_fin_rel.json";
import tools from "@/utils/tools.js";

export default {
  props: [],
  data() {
    return {
      typeRadio: "concept",
      data: TestJson,  //test in the online demo
      relData: TestRelJson,  //test in the online demo
      treeData: null,
      toolsState: '',
      confirmUrl: require("@/assets/img/confirm.svg"),
      cancelUrl: require("@/assets/img/cancel.svg"),
      toolsButsUrl: require("@/assets/img/toolsButs.png"),
      addNodeSonUrl: require("@/assets/img/addNode1.png"),
      addNodePerUrl: require("@/assets/img/addNode2.png"),
      addLinkBasicUrl: require("@/assets/img/addLink.png"),
      // nameinput: "Random Variables",
      nameinput: "Fundamental Graphs",
      // nameinput: "Trees",
      lectureStyleValue: [0, 80],
      importanceScoreValue: 80,
      tableData: [{
        key: 'Name',
        value: '',
      },{
        key: 'Type',
        value: '',
      }, {
        key: 'Course style',
        value: '',
      }, {
        key: 'Importance score',
        value: '',
      }],
      curEntId: "",
      insertEntId: "",
      insertSourceEntId: "-1",
      insertTargetEntId: "-1",
      sonList: [],
      minDImportance: 0,
      maxDImportance: 0,
      minDRelevance: 0,
      maxDRelevance: 0,
      maxDDuration: 0,
      importanceLinear:'',
      maxTotalDuration: 0,
      importanceMinColor: "rgb(203, 230, 209)",
      importanceMaxColor: "rgb(22, 144, 207)",
      totalDuration: 1000,
      importanceColor_linear: null,
      importanceCompute_color: null,
      relevanceScale_linear: null,
      totalDurationScale_linear: null,
      DivisionDataList: [],
      rootDivisionDataList: [],
      entDivisionDataList: [],
      colorMap: {},
      rootColorMap:{},
      videoDuration: 668,
      selectRectId: "",
      selectRectClass: "",
      topicLineWidth: 1000,
      topicLineHeight: 1000,
      moveLineWidth: 1000,
      entLineWidth: 1000,
      totalSonDuration: 0,
      treeGTransformK:1,
      treeGTransformX:10,
      treeGTransformY:100,
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
    };
  },
  watch: {
    typeRadio(val) {
    },
    lectureStyleValue(val){
      let mid = (val[0]+val[1])/2;
      d3.select("#editData .el-slider__runway")
      .attr("style","background: linear-gradient(90deg, #ff9c9c "+mid+"%,#6f8be0 "+mid+"%) !important")
    },
    type(val) {
    },
    // selectEnt(val){
    //   console.log(val);
    // },
    curEntId(curEntId) {
      const _this = this;
      let data = _this.data;
      
      let curEnt = data.find(function (d) { return d['id'] == curEntId; });
      if (curEnt['type'] == '1') {
        _this.typeRadio = "test";
      }
      else if(curEnt['type'] == '0') {
        _this.typeRadio = "concept";
      }
      else {
        _this.typeRadio = "example";
      }
      _this.nameinput = curEnt['name'];
      let duration = 0//tools.time2seconds(curEnt['time'][1]) - tools.time2seconds(curEnt['time'][0]);
      
      let typeData = curEnt["attribute"]["expressions"];
      let typeDur = 0;
      let styleValue = [];
      for (let i in typeData) {
        let typeDurition = typeData[i];
        let totalTypeSeconds = 0;
        for (let d in typeDurition) {
          totalTypeSeconds += (tools.time2seconds(typeDurition[d][1]) - tools.time2seconds(typeDurition[d][0]))
        }
        duration+=totalTypeSeconds
      }
      let typeDurScale_linear = d3.scaleLinear([0, duration], [0, 100]);
      for (let i in typeData) {
        // let color = typeColor[i];
        let typeDurition = typeData[i];
        let totalTypeSeconds = 0;
        for (let d in typeDurition) {
          totalTypeSeconds += (tools.time2seconds(typeDurition[d][1]) - tools.time2seconds(typeDurition[d][0]))
        }
        typeDur += totalTypeSeconds;
        styleValue.push(typeDurScale_linear(typeDur))
      }
      // console.log
      let importanceColor_linear = d3.scaleLinear().domain([ _this.minDImportance, _this.maxDImportance]).range([0, 1]);
      _this.importanceScoreValue = importanceColor_linear(curEnt['attribute']['importance'])*100
      _this.lectureStyleValue = styleValue;
      // _this.importanceScoreValue = 0;
      _this.drawEntity(curEnt);
      _this.drawSonLine(curEnt);
    }
  },
  methods: {
    selectType(v) {
      // console.log(v)
    },
    cancelClk() {
      const _this = this;
      let data = _this.data;
      let curEntId = _this.curEntId;
      let curEnt = data.find(function (d) { return d['id'] == curEntId; });
      _this.drawEntity(curEnt);
      _this.drawSonLine(curEnt);
      _this.drawrootTree();

    },
    confirmClk() {
      const _this = this;
      let data = _this.data;
      let curEntId = _this.curEntId;
      let curEnt = data.find(function (d) { return d['id'] == curEntId; });
      if (_this.typeRadio == "hidden State") {
        curEnt['type'] = '1'
      }
      else {
        curEnt['type'] = '0';
      }
      curEnt['name'] = _this.nameinput;

      let styleValue = _this.lectureStyleValue;
      let startSeconds = tools.time2seconds(curEnt['time'][0]);
      let endSeconds = tools.time2seconds(curEnt['time'][1]);
      let totalSeconds = endSeconds - startSeconds;
      let typeDurReScale_linear = d3.scaleLinear([0, 100], [startSeconds, endSeconds]);
      let typeData = { "1": [], "2": [], "3": [] };//;
      let t1 = tools.seconds2time(typeDurReScale_linear(styleValue[0]));
      let t2 = tools.seconds2time(typeDurReScale_linear(styleValue[1]));
      typeData['1'].push([curEnt['time'][0], t1]);
      typeData['2'].push([t1, t2]);
      typeData['3'].push([t2, curEnt['time'][1]]);
      curEnt["attribute"]["expressions"] = typeData;

      let entRects = d3.selectAll(".editEnt").nodes();
      console.log(entRects)
      let totalSonDuration = _this.totalSonDuration;
      let wid = _this.entLineWidth;
      let cxReLinear = d3.scaleLinear([0, wid], [0, totalSonDuration]);
      let preTime = '';
      let typeTotalData = { "1": [], "2": [], "3": [] };//;
      for (let n = 0; n < entRects.length; n++) {
        let curRect = entRects[n];
        let rectId = curRect.id.split("_")[1];
        let rectData = data.find(function (d) { return d['id'] == rectId; });
        let perDur = tools.time2seconds(rectData['time'][1]) - tools.time2seconds(rectData['time'][0]);
        if (n == 0) {
          preTime = rectData['time'][0];
        }
        let preSecond = tools.time2seconds(preTime);
        let x = curRect.x.baseVal.value;
        let w = curRect.width.baseVal.value;
        let durSecond = cxReLinear(w);
        let endTime = tools.seconds2time(preSecond + durSecond);
        rectData['time'] = [preTime, endTime];
        rectData['totalDuration'] += durSecond - perDur;
        preTime = endTime;
        for (let t in typeTotalData) {
          typeTotalData[t] = [...typeTotalData[t], ...rectData['attribute']['expressions'][t]]
        }
      }
      console.log(typeTotalData)
      _this.data = data;
      // console.log(entRects,entRects[0])

      _this.drawEntity(curEnt);
      _this.drawSonLine(curEnt);
      _this.drawrootTree();
      _this.$bus.$emit("graphData", data);
    },
    click_node() {
      const _this = this;
      let nodeId = _this.curEntId;
      let addDataId = _this.insertEntId;//parseInt(nodeId)+1+'';
      let oriData = _this.data;
      let state = _this.toolsState;
      let returnData = [];
      let returnRelData = {};
      let relData = _this.relData;

      if (state == 'addNodeSon') {
        for (let i = 0; i < oriData.length; i++) {
          let cData = oriData[i];
          let cDataId = cData['id']
          
          let sons = cData['son'];
          let sonsNew = [];
          for(let s=0;s<sons.length;s++){
            let ss = sons[s]
              if(parseInt(ss)>=parseInt(addDataId)) ss = parseInt(ss)+1
              sonsNew.push(ss+'')
          }
          cData['son'] = sonsNew;

          if (parseInt(cDataId) == parseInt(addDataId)) {
            let perData = tools.deepClone(cData);
            let addData = tools.deepClone(perData);
            addData['id'] = addDataId;
            perData['id'] = (parseInt(addDataId) + 1)+'';
            console.log(addData,perData)
            let startT = cData['time'][0];
            let endT = cData['time'][1];
            let midT = tools.seconds2time((tools.time2seconds(endT) + tools.time2seconds(startT)) / 2);
            addData['time'] = [startT, midT];
            perData['time'] = [midT, endT];
            addData['son'] = [];
            addData['totalDuration'] = (tools.time2seconds(midT) - tools.time2seconds(startT));
            perData['totalDuration'] -= addData['totalDuration'];
            let typeTimes = perData['attribute']['expressions'];
            let typePreData = { "1": [], "2": [], "3": [] };
            let typeAddData = { "1": [], "2": [], "3": [] };
            for (let t in typeTimes) {
              for (let a = 0; a < typeTimes[t].length; a++) {
                let st = typeTimes[t][a][0];
                let et = typeTimes[t][a][1];
                if (tools.time2seconds(et) <= tools.time2seconds(midT)) { typeAddData[t].push([st, et]) }
                else if (tools.time2seconds(st) >= tools.time2seconds(midT)) { typePreData[t].push([st, et]) }
                else if ((tools.time2seconds(st) < tools.time2seconds(midT)) && (tools.time2seconds(et) > tools.time2seconds(midT))) {
                  typeAddData[t].push([st, midT]);
                  typePreData[t].push([midT, et]);
                }
              }
            }
            perData['attribute']['expressions'] = typePreData;
            addData['attribute']['expressions'] = typeAddData;
            returnData.push(addData);
            returnData.push(perData);
          }
          else if (parseInt(cData['id']) < parseInt(addDataId)) {
            returnData.push(tools.deepClone(cData));
          }
          else if (parseInt(cData['id']) > parseInt(addDataId)){
            let perData = tools.deepClone(cData);
            perData['id'] = (parseInt(cDataId) + 1) + '';
            returnData.push(perData);
          }

        }
      
      let bsNew = [];
      let basicRel = relData['basicRel'];
      for (let r = 0; r < basicRel.length; r++) {
        let sourceId = basicRel[r][0];
        let targetId = basicRel[r][1];
        if(parseInt(sourceId)>=parseInt(addDataId)) sourceId = parseInt(sourceId)+1;
        if(parseInt(targetId)>=parseInt(addDataId)) targetId = parseInt(targetId)+1;
        bsNew.push([sourceId+'',targetId+''])
      }
      let ssNew = []
      let similarityRel = relData['similarityRel'];
      for (let r = 0; r < similarityRel.length; r++) {
        let sourceId = similarityRel[r][0];
        let targetId = similarityRel[r][1];
        if(parseInt(sourceId)>=parseInt(addDataId)) sourceId = parseInt(sourceId)+1;
        if(parseInt(targetId)>=parseInt(addDataId)) targetId = parseInt(targetId)+1;
        ssNew.push([sourceId+'',targetId+''])
      }
      returnRelData = {'basicRel':bsNew,'similarityRel':ssNew};
      let nData = returnData.find(function(d){return d['id'] == nodeId});
      let aData = returnData.find(function(d){return d['id'] == addDataId});
      if(nodeId!='-1'){
        nData['son'].push(addDataId);
        aData['layout'] = parseInt(nData['layout']+1);
        aData['father'] = [nodeId];
      }
      else{
        aData['layout'] = '0';
      }
      _this.data = (returnData);
      _this.relData = returnRelData;
      _this.getTreeData();
      _this.updata();
      }
      if (state == 'addLinkBasic') {
        let addSourceDataId = _this.insertSourceEntId;
        let addTargetDataId = _this.insertTargetEntId;
        if((addSourceDataId != '-1')&&(addTargetDataId != '-1')){
          returnRelData =  tools.deepClone(relData);
          returnRelData['basicRel'].push([addSourceDataId,addTargetDataId]);
          _this.insertSourceEntId = '-1';
          _this.insertTargetEntId = '-1';
          _this.relData = returnRelData;
          _this.getTreeData();
          _this.updata();
        }
      }
    },
    addNodeSonClk() {
      this.toolsState = 'addNodeSon';
    },
    addNodePerClk() {
      this.toolsState = 'addNodePer';
    },
    addLinkBasicClk() {
      this.toolsState = 'addLinkBasic';
    },
    drawtopicLine() {
      const _this = this;
      const margin = _this.margin;
      const color = _this.mcolor;

      let width = this.$refs.topicLine.offsetWidth - margin.left - margin.right;
      let height = this.$refs.topicLine.offsetHeight - margin.top - margin.bottom;
      _this.topicLineWidth = width;
      _this.topicLineHeight = height;
      d3.select("#topicLine").select("svg").remove();
      var svg = d3.select("#topicLine").append("svg")
        .attr("id", "topicLineSvg")
        .attr("width", width)
        .attr("height", height);

      let groups = svg.append("g").attr("id", "groups").attr("width", width).attr("height", height);
      let rootEntG = groups.append("g").attr("id", "rootEntG").attr("width", width).attr("height", height);
      let oriLineG = groups.append("g").attr("id", "oriLineG").attr("width", width).attr("height", height);

      oriLineG.append("line")
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
          _this.colorMap[data[i]['id']] = colorIndex % color.length;
          _this.drawRect(oriLineG, cx - 5, height / 2 - 5, 10, 10, height / 2, "division_" + data[i]["id"], "rootdivisionLine", "rgb(250,250,250)", 0, '', 1)
          _this.drawRect(rootEntG, cx, margin.top, endx - cx, height - margin.top - margin.bottom, height / 2, "rootEnt_" + data[i]['id'], "rootEnt", color[_this.colorMap[data[i]['id']]], 5, "rgb(150,150,150)", 0.1)
          colorIndex++;
        }
      }
      DivisionDataList[DivisionDataList.length - 1]['nextId'] = "-1";
      _this.rootDivisionDataList = DivisionDataList;

      // oriLineG.append("ellipse")
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
            _this.moveLineWidth = _this.topicLineWidth;
            _this.DivisionDataList = _this.rootDivisionDataList;
            // document.getElementById('topicLineSvg').addEventListener("mousemove", _this.moveRect); // 监听点击事件
          }
          else if (d3.select(this).attr("class") == "entdivisionLine") {
            _this.selectRectClass = "editEnt";
            _this.moveLineWidth = _this.entLineWidth;
            _this.DivisionDataList = _this.entDivisionDataList;
            document.getElementById('editEnt').addEventListener("mousemove", _this.moveRect); // 监听点击事件
          }
        })
        .on("mouseup", function (d) {
          // document.getElementById('topicLineSvg').removeEventListener("mousemove", _this.moveRect); // 
          document.getElementById('editEnt').removeEventListener("mousemove", _this.moveRect); // 
          // _this.$bus.$emit("graphData", _this.data);

          _this.$bus.$emit("treeData", _this.treeData);
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

      if ((e.offsetX > (_this.topicLineWidth)) || (e.offsetX < (0)) || (e.offsetY > (_this.topicLineHeight)) || (e.offsetY < (0))) {
        // document.getElementById('topicLineSvg').removeEventListener("mousemove", _this.moveRect); // 
      }
    },
    getTreeData(){
      const _this = this;
      let oriData = tools.deepClone(this.data);
      var data = {
        "name": "root",
        "children": []
      };

      for (let i = oriData.length - 1; i >= 0; i--) {
        let sons = oriData[i]['son'];
        oriData[i]['children'] = [];
        if (sons.length > 0) {
          for (let s = 0; s < sons.length; s++) {
            oriData[i]['children'].push(oriData.find(function (d) { return d['id'] == sons[s] }))
          }
        }
      }
      let c = 0 ;
      for (let i = 0; i < oriData.length; i++) {

        let layout = oriData[i]['layout'];
        if (layout == '0') {
          data['children'].push(oriData[i]);
          if(oriData[i]['name']!="Test"){
            _this.rootColorMap[oriData[i]['id']] = _this.mcolor[c];
            c++;
          }
          else{
            _this.rootColorMap[oriData[i]['id']] ="rgb(250, 199, 88)";
          }
        }
      }

      this.treeData = data;
      console.log(_this.rootColorMap)
      this.$bus.$emit("treeData", [data,_this.rootColorMap]);
    },
    drawrootTree() {
      const _this = this;
      const margin = _this.margin;
      let width = this.$refs.rootTree.offsetWidth - margin.left - margin.right;
      let height = this.$refs.rootTree.offsetHeight - margin.top - margin.bottom;

      let color = _this.mcolor;
      let colorMap = _this.colorMap;
      // var tree = d3.tree()
      //   .size([width, height - 200]);
      d3.select("#rootTree").select("svg").remove();
      var svg = d3.select("#rootTree").append("svg")
        .attr("width", width)
        .attr("height", height)

      let transY = height;
      let treeGTransformX = _this.treeGTransformX;
      let treeGTransformY = _this.treeGTransformY;
      let treeGTransformK = _this.treeGTransformK;
      let groups = svg.append("g")
        .attr("id", "editrootTreeg")
        .attr("width", width)
        .attr("height", height)
        .attr("transform",  "translate("+treeGTransformX+',' +treeGTransformY + ") scale("+treeGTransformK+")");

        let stx = 0;
        let sty = 0;
        let stk =1;
      var graphZoom = d3.zoom()
        .scaleExtent([0, 10])
        .on("start", (e) => {
          sty = e.transform.y;
          stx = e.transform.x;
          stk = e.transform.k;
        })
        .on('zoom', (e) => {
          treeGTransformX = _this.treeGTransformX + e.transform.x - stx;
          treeGTransformY = _this.treeGTransformY + e.transform.y - sty;
          treeGTransformK = _this.treeGTransformK + e.transform.k - stk;
          groups.attr('transform', 'translate(' + (treeGTransformX) + ',' + (treeGTransformY) + ') scale(' + (treeGTransformK) + ')')
        })
        .on('end', (e) => {
          _this.treeGTransformX = treeGTransformX;
          _this.treeGTransformY = treeGTransformY;
          _this.treeGTransformK = treeGTransformK;
          groups.attr('transform', 'translate(' + (treeGTransformX) + ',' + (treeGTransformY) + ') scale(' + (treeGTransformK) + ')')
        });
      svg.call(graphZoom)

      const gLink = groups.append("g")
        .attr("fill", "none")
        .attr("stroke", "#555")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("stroke-opacity", 0.4)
        .attr("stroke-width", 1.5);

      const gNode = groups.append("g")
        .attr("cursor", "pointer")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("pointer-events", "all")

      let data = _this.treeData;
      let diagonal = d3.linkHorizontal().x(d => d.y).y(d => d.x);
      let tree = d3.tree().nodeSize([50, 150]);//.size([(height - margin.left - margin.right) * 2, (width - margin.left - margin.right)-10])
      const root = d3.hierarchy(data);
      const nodes = root.descendants().reverse();
      const links = root.links();
      tree(root);
      console.log(nodes)
      const node = gNode.selectAll("g")
        .data(nodes, d => d.id);

      const nodeEnter = node.data(nodes).enter().append("g")
        .attr("transform", (d) => {
          return `translate(${d.y},${d.x})`
        })
        .on("click", (event, d) => {
          d.children = d.children ? null : d._children;
          // update(d);
        })

      nodeEnter.append("circle")
        .attr("r", 10)
        .attr("id", function (d) {
          console.log(d)
          if(d.data.name == 'root')
            return "treeNode_-1";
          return "treeNode_" + d.data.id;
        })
        .attr("fill", function (d) {
          if (d.data.name == 'root') {
            return 'grey'
          }
          else {
            let parent = d.parent;
            let rootd = null;
            while (parent.data.name != 'root') {
              rootd = parent;
              if (parent.parent.data.name == 'root') {
                return color[colorMap[parent.data.id]]
              }
              parent = parent.parent;
            }
            return color[colorMap[d.data.id]]
          }

        })
        .attr("stroke", "rgb(100,100,100)")
        // .attr("fill", d => d._children ? "#555" : "#999")
        .attr("stroke-width", 1)
        .on("mouseover", function () {
          d3.select(this).attr("r", 15);

        })
        .on("mouseleave", function () {
          d3.select(this).attr("r", 10)
        })
        .on("mousedown", function () {
          let nodeIdN = d3.select(this).attr("id");
          let nodeId = nodeIdN.split("_")[1];
          _this.curEntId = nodeId;
          if(nodeId == '-1'){
            _this.insertEntId = parseInt(nodeId) + 1 + '';
          _this.click_node();
            return
          }
          let curData = _this.data.find(function (d) { return d['id'] == nodeId; });
          if (_this.toolsState == 'addNodeSon') {
            _this.insertEntId = parseInt(nodeId) + 1 + '';
          }
          else if (_this.toolsState == 'addLinkBasic') {
            if(_this.insertSourceEntId =="-1")
              _this.insertSourceEntId = parseInt(nodeId) + '';
            else{
              _this.insertTargetEntId = parseInt(nodeId) + '';
            }
          }
          if ( (curData['son'].length > 0)) {
            _this.insertEntId = parseInt(curData['son'][0]) + 1 +'';
          };
          _this.click_node();
        })

      // nodeEnter.append("text")
      //   .attr("dy", "0.31em")
      //   .attr("x", d => d._children ? -6 : 6)
      //   .attr("text-anchor", d => d._children ? "end" : "start")
      //   .text(d => d.data.name)
      //   .clone(true).lower()
      //   .attr("stroke-linejoin", "round")
      //   .attr("stroke-width", 3)
      //   .attr("stroke", "white");

      const link = gLink.selectAll("path")
        .data(links, d => d.target.id);

      const linkEnter = link.enter().append("path")
        .attr("d", d => {
          const o = { x: d.source.x, y: d.source.y };
          const p = { x: d.target.x, y: d.target.y }
          return diagonal({ source: o, target: p });
        })
        .attr("stroke", "rgb(100,100,100)")
        .attr("stroke-width", 5)
      _this.drawRootTreeRel(gLink, nodes);
    },
    drawRootTreeRel(svg, nodeData) {

      const _this = this;
      let relData = _this.relData;
      let oData = _this.drawEntityLocation;
      console.log(nodeData)
      let margin = _this.margin;
      let height = svg.attr('height');
      // let basicRel = relData['similarityRel'];
      let basicRel = relData['basicRel'];
      for (let r = 0; r < basicRel.length; r++) {

        let sourceId = basicRel[r][0];
        let targetId = basicRel[r][1];
        let idN = "basicRel" + sourceId + "_" + targetId;
        let classN = "basicRel source" + sourceId + " target" + targetId;
        let sourceNode = nodeData.find(function (d) { return d['data']['id'] == sourceId });
        let targetNode = nodeData.find(function (d) { return d['data']['id'] == targetId });
        if (sourceNode['x'] > targetNode['x']) {
          let tp = sourceNode;
          sourceNode = targetNode;
          targetNode = tp;
        }
        const path = d3.path();

        let startX = sourceNode['y'];
        let endX = targetNode['y'];
        let startY = sourceNode['x'];
        let endY = targetNode['x'];
        let midX = (startX + endX) / 2;
        let midY = (startY + endY) / 2;
        let cnx = (startX > endX) ? (startX + 10 + 0.25 * (endY - startY)) : (endX + 10 + 0.25 * (endY - startY));
        path.moveTo(startX, startY);
        path.bezierCurveTo(cnx, midY, cnx, midY, endX, endY);
        _this.drawTimeLine(svg, path, "rgb(200,200,200)", 5, "9,9", idN, classN);


      };
      let similarityRel = relData['similarityRel'];
      // let basicRel = relData['basicRel'];
      for (let r = 0; r < similarityRel.length; r++) {

        let sourceId = similarityRel[r][0];
        let targetId = similarityRel[r][1];

        let idN = "similarityRel" + sourceId + "_" + targetId;

        let classN = "similarityRel source" + sourceId + " target" + targetId;
        let sourceNode = nodeData.find(function (d) { return d['data']['id'] == sourceId });
        let targetNode = nodeData.find(function (d) { return d['data']['id'] == targetId });
        if (sourceNode['x'] > targetNode['x']) {
          let tp = sourceNode;
          sourceNode = targetNode;
          targetNode = tp;
        }
        const path = d3.path();

        let startX = sourceNode['y'];
        let endX = targetNode['y'];
        let startY = sourceNode['x'];
        let endY = targetNode['x'];
        let midX = (startX + endX) / 2;
        let midY = (startY + endY) / 2;
        let cnx = (startX > endX) ? (startX + 100 + 0.5 * (endY - startY)) : (endX + 100 + 0.5 * (endY - startY));

        path.moveTo(startX, startY);
        path.lineTo(cnx, startY);
        path.lineTo(cnx, endY);
        path.lineTo(endX, endY);
        _this.drawTimeLine(svg, path, "rgb(200,200,200)", 5, "0", idN, classN);


      };
    },
    draweditData() {
      const _this = this;
      const margin = _this.margin;
      let width = this.$refs.editData.offsetWidth - margin.left - margin.right - 60;
      let height = this.$refs.editData.offsetHeight - margin.top - margin.bottom;
      d3.select("#editData").select("svg").remove();
      var svg = d3.select("#editData").append("svg")
        .attr("id", "editEnt")
        .attr("width", width)
        .attr("height", height);

      let entG = svg.append("g").attr("id", "entG").attr("width", width).attr("height", height);
      let sonG = svg.append("g").attr("id", "sonG").attr("width", width).attr("height", height).attr("transform", "translate(1,320)");
      // _this.entG = entG;
      // _this.sonG = sonG;
      _this.drawEntity(_this.data[0]);
      _this.drawSonLine(_this.data[1]);
    },
    drawSonLine(data) {
      const _this = this;
      let psvg = d3.select("#sonG");
      let w = psvg.attr("width") - 1;
      let h = 35;
      psvg.remove();
      let svg = d3.select("#editEnt").append("g").attr("id", "sonG").attr("width", w + 1).attr("height", h + 2).attr("transform", "translate(1,280)");
      let color_linear = _this.importanceColor_linear;
      let compute_color = _this.importanceCompute_color;
      let oData = _this.data;
      _this.entLineWidth = w;
      // if (sonList.length > 0) {
      svg.selectAll().remove();
      svg.append("line")
        .attr("x1", 0)
        .attr("y1", h / 2)
        .attr("x2", w)
        .attr("y2", h / 2)
        .attr("stroke", "rgb(200,200,200)")
        .attr("stroke-width", "5px");

      let totalSonDuration = 0;
      let dataIndex = oData.map(item => item.id).indexOf(data['id']);
      let startIndex = ((dataIndex - 2) > 0) ? (dataIndex - 2) : (0);
      let endIndex = ((dataIndex + 1) < oData.length) ? (dataIndex + 2) : (oData.length - 1);

      let dataLi = tools.deepClone(oData).splice(startIndex, endIndex - startIndex + 1);
      // let data = sonList;
      for (let i = 0; i < dataLi.length; i++) {
        let curEnt = oData.find(function (d) { return d['id'] == dataLi[i]['id'] });
        let time = tools.time2seconds(curEnt['time'][0]);
        let endTime = tools.time2seconds(curEnt['time'][1]);
        totalSonDuration += endTime - time;
      }
      _this.totalSonDuration = totalSonDuration;
      let cxLinear = d3.scaleLinear([0, totalSonDuration], [0, w]);
      let DivisionDataList = [];
      // let colorIndex = 0;
      let prex = 0;
      for (let i = 0; i < dataLi.length; i++) {
        let curEnt = oData.find(function (d) { return d['id'] == dataLi[i]['id'] });
        let temp = tools.deepClone(curEnt);
        if (DivisionDataList.length != 0) {
          DivisionDataList[DivisionDataList.length - 1]['nextId'] = temp['id'];
          temp['preId'] = DivisionDataList[DivisionDataList.length - 1]['id'];
        }
        else { temp['preId'] = "-1"; }
        DivisionDataList.push(temp);
        let time = tools.time2seconds(curEnt['time'][0]);
        let endTime = tools.time2seconds(curEnt['time'][1]);
        let curEntDur = endTime - time;
        let cx = prex;
        let endx = prex + cxLinear(curEntDur);
        let importanceValue = curEnt['attribute']['importance'];
        let entColor = compute_color(color_linear(importanceValue));
        if (i != 0) {
          _this.drawRect(svg, cx - 2, 0, 5, h, h / 2, "division_" + curEnt['id'], "entdivisionLine", "rgb(0,250,250)", 50, '', 0);
        }
        if (dataLi[i]['id'] == data['id']) _this.drawRect(svg, cx, 0, endx - cx-2, h, 1, "editEnt_" + curEnt['id'], "editEnt", entColor, 1, "rgba(255,255,255,1)", 1)//color[_this.colorMap[son['id']]], 5, 0.1)
        else _this.drawRect(svg, cx, 0, endx - cx-2, h, 1, "editEnt_" + curEnt['id'], "editEnt", entColor, 1, "rgba(255,255,255,1)", 3)//color[_this.colorMap[son['id']]], 5, 0.1)
        prex = endx;
      }
      DivisionDataList[DivisionDataList.length - 1]['nextId'] = "-1";
      _this.entDivisionDataList = DivisionDataList;
    },
    drawEntityOri(data) {
      const _this = this;
      let psvg = d3.select("#entG");
      let w = psvg.attr("width");
      let h = psvg.attr("height");
      psvg.remove();
      let svg = d3.select("#editEnt").append("g").attr("id", "entG").attr("width", w).attr("height", h);
      let color_linear = _this.importanceColor_linear;
      let compute_color = _this.importanceCompute_color;
      let totalDurationValue = data['totalDuration'];
      let rScale = _this.totalDurationScale_linear;
      let r = rScale(totalDurationValue);
      let oData = _this.data;
      let x = svg.attr("width") / 2;
      let y = 120;
      let importanceValue = data['attribute']['importance'];
      let relevanceValue = data['attribute']['relevance'];
      svg.selectAll().remove();

      if (data['type'] == '1') {
        let area = tools.calcTriangle(x, y, r);
        _this.drawTriangle(svg, "rgb(250, 199, 88)", area, "rgb(250, 199, 88)");
      }
      else {

        let cy = y;
        let totalDuration = _this.totalDuration;
        let timeLineScale_linear = d3.scaleLinear([0, totalDuration], [x - r * Math.sqrt(3) / 2, x + r * Math.sqrt(3) / 2])
        let timeLineHighScale_linear = d3.scaleLinear([0, _this.maxDDuration], [0, r * (1 + Math.sqrt(3) / 2)])
        let circleColor = compute_color(color_linear(importanceValue));
        _this.drawCircle(svg, x, cy, r, circleColor, data, 1, "entCircle", "entCircle_" + data['id']);

        r = r * Math.sqrt(3) / 2;
        y += r / 2;
        let path = d3.path();


        path.moveTo(x - r, y);
        let lineLi = [data['time']];
        let linePoint = [{ 'id': data['id'], 'time': data['time'], 'x': 0, 'y': 0 }];
        for (let srel in data["similarityRel"]) {
          let cdata = oData.find(function (d) { return d['id'] == data["similarityRel"][srel] })
          lineLi.push(cdata['time'])
          linePoint.push({ 'id': cdata['id'], 'time': cdata['time'], 'x': 0, 'y': 0 })
        }
        const sortmt = (a, b) => {
          return tools.time2seconds(a[0]) - tools.time2seconds(b[0]);
        }
        const sortlp = (a, b) => {
          return tools.time2seconds(a['time'][0]) - tools.time2seconds(b['time'][0]);
        }
        lineLi = lineLi.sort(sortmt);
        linePoint = linePoint.sort(sortlp);
        let lineData = [[x - r, y]];
        for (let t = 0; t < lineLi.length; t++) {
          let startT = lineLi[t][0];
          let endT = lineLi[t][1];
          let startS = tools.time2seconds(startT);
          let endS = tools.time2seconds(endT);
          let duration = endS - startS;

          let startx = timeLineScale_linear((startS - duration * 10));
          let endx = timeLineScale_linear((endS + duration * 10));

          let startyf = y + timeLineHighScale_linear((duration)) / 8;
          let startyf1 = y + timeLineHighScale_linear((duration)) / 8;
          let endyf = y + timeLineHighScale_linear((duration)) / 8;
          let endyf1 = y + timeLineHighScale_linear((duration)) / 8;
          let yz = y - timeLineHighScale_linear((duration));
          let midx = timeLineScale_linear((endS + startS) / 2);
          linePoint[t]['x'] = midx;
          linePoint[t]['y'] = y - timeLineHighScale_linear(duration) / 1.7;
          let y1 = y;
          if (startx < (lineData[lineData.length - 1][0])) {
            if (t > 0) {
              lineData.splice(lineData.length - 3, 3);
              startx = (lineData[lineData.length - 1][0] + midx) / 2;
              y1 = lineData[lineData.length - 1][1] + timeLineHighScale_linear((duration)) / 2;
              startyf = lineData[lineData.length - 1][1] + timeLineHighScale_linear((duration)) / 2;
              startyf1 = lineData[lineData.length - 1][1] + timeLineHighScale_linear((duration)) / 2;
            }
          }
          let startx1 = startx + (timeLineScale_linear((startS + duration)) - timeLineScale_linear((startS)));
          let endx1 = endx - (timeLineScale_linear((startS + duration)) - timeLineScale_linear((startS)));
          let startx2 = startx1 + (timeLineScale_linear((startS + duration)) - timeLineScale_linear((startS)));
          let endx2 = endx1 - (timeLineScale_linear((startS + duration)) - timeLineScale_linear((startS)));
          if (endx > (r + x)) endx = r + x;
          if (startx1 < (lineData[lineData.length - 1][0])) startx1 = lineData[lineData.length - 1][0];
          if (endx1 > (r + x)) endx1 = r + x;
          if (startx2 < (lineData[lineData.length - 1][0])) startx2 = lineData[lineData.length - 1][0];
          if (endx2 > (r + x)) endx2 = r + x;
          lineData.push([startx, y1], [startx1, startyf1], [startx2, startyf], [midx, yz], [endx2, endyf], [endx1, endyf1], [endx, y])
        }
        lineData.push([x + r, y])
        let curve_generator = d3.line()
          .x((d) => d[0])
          .y((d) => {
            let h = Math.sqrt(Math.pow(r, 2) - Math.pow((d[0] - (x - r)), 2));
            if ((y - d[1]) > (h + r * Math.sqrt(3) / 2))
              return y - (h + r * Math.sqrt(3) / 2) + 2;
            return d[1];
          })
          .curve(d3.curveBasis)
        _this.drawTimeLine(svg, curve_generator(lineData), "white", 2, '0', 'sonLine ', 'sonLine ');


        for (let p = 0; p < linePoint.length; p++) {
          _this.drawCircle(svg, linePoint[p]['x'], linePoint[p]['y'], 5, "red", linePoint[p], 0, "linePoint", "linePoint_" + linePoint[p]['id']);
        }

        // "1": "rgb(145, 204, 117)",
        //   "2": "rgb(84, 112, 198)",
        //   "3": "rgb(238, 102, 102)",
        let typeColor = {
          "1": "#ff9c9c",
          "2": "#f4f4d0",
          "3": "#6f8be0",
        };
        let duration = tools.time2seconds(data['time'][0]) - tools.time2seconds(data['time'][1]);
        let typeData = data['attribute']['expressions'];
        let sonList = data['son'];
        let typeArcScale_linear = d3.scaleLinear([0, duration], [0, Math.PI * 2]);

        var typeStartR = 0//Math.PI/4;

        var typeStepR = Math.PI / 1;

        if (sonList.length > 0) {
          for (let i in typeData) {
            let color = typeColor[i];
            let typeDurition = typeData[i];
            let totalTypeSeconds = 0;
            for (let d in typeDurition) {
              totalTypeSeconds += (tools.time2seconds(typeDurition[d][1]) - tools.time2seconds(typeDurition[d][0]))
            }
            let typeStepR = typeArcScale_linear(totalTypeSeconds)//Math.PI/2;

            let endAnglet = typeStartR + 1 * typeStepR
            var dataset = { startAngle: typeStartR, endAngle: endAnglet }; //创建一个弧生成器
            typeStartR = endAnglet;
            var arcPath = d3.arc()
              .innerRadius(r + 10)
              .outerRadius(r + 25);
            var pathArc = arcPath(dataset);
            _this.drawArc(svg, x, y - r / 2, pathArc, color, color, 'type f' + data['id'] + " t" + i);
          }
          let sonTotal = 0;
          let sonNum = 0
          for (let s in sonList) {
            let sonData = oData.find(function (d) { return d['id'] == sonList[s] });
            let sonDur = sonData['totalDuration'];
            sonTotal += sonDur;
            sonNum += 1;
          }
          let skipArc = Math.PI / (sonNum + 2);
          let timeSonLinear = d3.scaleLinear([0, sonTotal], [0, Math.PI * 2 - skipArc * sonNum]);
          let timeSonHeighLinear = d3.scaleLinear([0, sonTotal], [40, 40]);

          let timeSonColor_linear = d3.scaleLinear().domain([0, sonTotal]).range([0, 1]);
          let timeSonCompute_color = d3.interpolate("white", circleColor);
          var sonStartR = 0;//-Math.PI/2;
          for (let s in sonList) {
            let sonData = oData.find(function (d) { return d['id'] == sonList[s] });
            let sonDur = sonData['totalDuration'];

            let sonStepR = timeSonLinear(sonDur)//Math.PI/2;

            let endAnglet = sonStartR + sonStepR;
            var dataset = { startAngle: sonStartR, endAngle: endAnglet }; //创建一个弧生成器
            sonStartR = endAnglet;
            let color = 'blue';
            var arcPath = d3.arc()
              .innerRadius(r + 28)
              .outerRadius(r + timeSonHeighLinear(sonDur));
            var arcMidPath = d3.arc()
              .innerRadius(0)
              .outerRadius(r + 32);
            var pathArc = arcPath(dataset);

            endAnglet = sonStartR + skipArc;
            var midDataset = { startAngle: sonStartR, endAngle: endAnglet }; //创建一个弧生成器

            let jiantouPath = d3.path();
            jiantouPath.arc(x, y - r / 2, r + 32, sonStartR - Math.PI / 2, endAnglet - Math.PI / 2);

            sonStartR += skipArc;
            var pathMidArc = arcMidPath(midDataset);
            let timeSonColor = compute_color(color_linear(sonData['attribute']['importance']));
            _this.drawArc(svg, x, y - r / 2, pathArc, timeSonColor, timeSonColor, 'son f' + data['id'] + " s" + sonList[s], '0');
            if (s != sonList.length - 1) {
              _this.drawTimeLine(svg, jiantouPath, "rgb(200,200,200)", 3, '9,5', 'midArc ', 'midArc ');
            }
          }

        }


      }
      let txts = _this.nameinput.split(" ")
      _this.drawTxt(svg, x - r - 32, y + r + 50, r * 2 + 64, txts, "grey");
    },
    drawEntity(data) {
      // d3.select("#editEnt").remove()
    },
    // drawEntity(data) {
    //   const _this = this;
    //   let psvg = d3.select("#entG");
    //   let w = psvg.attr("width");
    //   let h = psvg.attr("height");
    //   psvg.remove();
    //   let svg = d3.select("#editEnt").append("g").attr("id", "entG").attr("width", w).attr("height", h);
    //   let color_linear = _this.importanceColor_linear;
    //   let compute_color = _this.importanceCompute_color;
    //   let totalDurationValue = data['totalDuration'];
    //   let rScale = _this.totalDurationScale_linear;
    //   let r = rScale(totalDurationValue);
    //   let oData = _this.data;
    //   let x = svg.attr("width") / 2;
    //   let y = 120;
    //   let importanceValue = data['attribute']['importance'];
    //   let relevanceValue = data['attribute']['relevance'];
    //   svg.selectAll().remove();

    //   if (data['type'] == '1') {
    //     let area = tools.calcTriangle(x, y, r);
    //     _this.drawTriangle(svg, "rgb(250, 199, 88)", area, "rgb(250, 199, 88)");
    //   }
    //   else {

    //     let cy = y;
    //     let totalDuration = _this.totalDuration;
    //     let timeLineScale_linear = d3.scaleLinear([0, totalDuration], [x - r * Math.sqrt(3) / 2, x + r * Math.sqrt(3) / 2])
    //     let timeLineHighScale_linear = d3.scaleLinear([0, _this.maxDDuration], [0, r * (1 + Math.sqrt(3) / 2)])
    //     let circleColor = compute_color(color_linear(importanceValue));
    //     _this.drawCircle(svg, x, cy, r, circleColor, data, 1, "entCircle", "entCircle_" + data['id']);

    //     r = r * Math.sqrt(3) / 2;
    //     y += r / 2;
    //     let path = d3.path();


    //     path.moveTo(x - r, y);
    //     let lineLi = [data];
    //     let linePoint = [{ 'id': data['id'], 'time': data['time'], 'x': 0, 'y': 0 }];
    //     let jgidL = [data['id']];
    //     let similarityRelsli = [data["similarityRel"]];
    //     while(similarityRelsli.length>0){
    //       let similarityRels = similarityRelsli[0];
    //       similarityRelsli.splice(0,1);
    //       let jg = 0;
    //       for (let srel in similarityRels) {
    //         let cdata = oData.find(function (d) { return d['id'] == similarityRels[srel] });
    //         if(jgidL.indexOf(cdata['id'])==-1){
    //           similarityRelsli.push(cdata["similarityRel"])
    //           jg=1;
    //           lineLi.push(cdata)
    //           jgidL.push(cdata['id'])
    //           linePoint.push({ 'id': cdata['id'], 'time': cdata['time'], 'x': 0, 'y': 0 })
    //         }
    //       }
    //       // if(jg==0){
    //         // break;
    //       // }
    //     }
        
    //     const sortmt = (a, b) => {
    //       return tools.time2seconds(a[0]) - tools.time2seconds(b[0]);
    //     }
    //     const sortlp = (a, b) => {
    //       return tools.time2seconds(a['time'][0]) - tools.time2seconds(b['time'][0]);
    //     }
    //     console.log(lineLi);
    //     lineLi = lineLi.sort(sortlp);
    //     linePoint = linePoint.sort(sortlp);
    //     let lineData = [[x - r * Math.sqrt(3)/2-4 , y]];
    //     for (let t = 0; t < lineLi.length; t++) {
    //       let startT = lineLi[t]['time'][0];
    //       let duration =lineLi[t]['totalDuration']
    //       // let endT = lineLi[t]['time'][1];
    //       let startS = tools.time2seconds(startT);
    //       let endS = startS +duration;
    //       // let startx = timeLineScale_linear((startS - duration * 10));
    //       // let endx = timeLineScale_linear((endS + duration * 10));
    //       let limst = (x - r * Math.sqrt(3) / 2);
    //       let limed = (x + r * Math.sqrt(3) / 2);
    //       let startx = (limst<timeLineScale_linear((startS)))?(timeLineScale_linear((startS))):(limst);
    //       let endx = (limed>timeLineScale_linear((endS)))?(timeLineScale_linear((endS))):(limed);
    //       // let midx = timeLineScale_linear((endS + startS) / 2);
    //       let midx = (startx+endx) / 2;
    //       let ys = y;
    //       let yz = y - timeLineHighScale_linear((duration));
    //       linePoint[t]['x'] = midx;
    //       linePoint[t]['y'] = y - timeLineHighScale_linear(duration) / 1.7;
    //       // if (startx < (lineData[lineData.length - 1][0])) {
    //         if (t > 0) {
    //           lineData.splice(lineData.length - 1, 1);
    //           midx+=t*5;
    //           startx = midx-((midx-(lineData[lineData.length - 1][0] + midx) / 2))/2;
    //           endx+=t*5;
    //           ys = y+(y-lineData[lineData.length - 1][1])/3
    //         }
    //         console.log(ys)
    //       // }
    //       lineData.push([startx, ys],[midx, yz],[endx, y])}
    //     lineData.push([x + r, y])
    //     let curve_generator = d3.line()
    //       .x((d) => d[0])
    //       .y((d) => {
    //         let h = Math.sqrt(Math.pow(r, 2) - Math.pow((d[0] - (x - r)), 2));
    //         if ((y - d[1]) > (h + r * Math.sqrt(3) / 2))
    //           return y - (h + r * Math.sqrt(3) / 2) + 2;
    //         return d[1];
    //       })
    //       .curve(d3.curveBundle )
    //       // .curve(d3.curveCatmullRom  )
    //       // .curve(d3.curveBasis)
    //     _this.drawTimeLine(svg, curve_generator(lineData), "white", 2, '0', 'sonLine ', 'sonLine ');


    //     for (let p = 0; p < linePoint.length; p++) {
    //       _this.drawCircle(svg, linePoint[p]['x'], linePoint[p]['y'], 5, "red", linePoint[p], 0, "linePoint", "linePoint_" + linePoint[p]['id']);
    //     }

    //     // "1": "rgb(145, 204, 117)",
    //     //   "2": "rgb(84, 112, 198)",
    //     //   "3": "rgb(238, 102, 102)",
    //     let typeColor = {
    //       "1": "#ff9c9c",
    //       "2": "#f4f4d0",
    //       "3": "#6f8be0",
    //     };
    //     let duration = tools.time2seconds(data['time'][0]) - tools.time2seconds(data['time'][1]);
    //     let typeData = data['attribute']['expressions'];
    //     let sonList = data['son'];
    //     let sons = [sonList];
    //     while (sons.length > 0) {
    //       let curSonList = sons[0];
    //       sons.splice(0, 1);
    //       if (curSonList.length > 0) {
    //         for (let s in curSonList) {
    //           let sonData = oData.find(function (d) { return d['id'] == curSonList[s] });
    //           let sonTypeData = sonData['attribute']['expressions'];

    //           for (let t in sonTypeData) {
    //             let typeDurition = sonTypeData[t];
    //             for (let d in typeDurition) {
    //                typeData[t].push(typeDurition[d])
    //             }
    //           }
    //           sons.push(sonData['son']);
    //         }
    //       }
    //     }
    //     var typeStartR = 0//Math.PI/4;

    //     var typeStepR = Math.PI / 1;

    //     if (sonList.length > 0) {
    //       let typeTotalDur = 0;
    //       for (let t in typeData) {
    //         let typeDurition = typeData[t];
    //         for (let d in typeDurition) {
    //           typeTotalDur += (tools.time2seconds(typeDurition[d][1]) - tools.time2seconds(typeDurition[d][0]))
    //         }
    //       }
    //       let typeArcScale_linear = d3.scaleLinear([0, typeTotalDur], [0, Math.PI * 2]);
    //       for (let i in typeData) {
    //         let color = typeColor[i];
    //         let typeDurition = typeData[i];
    //         let totalTypeSeconds = 0;
    //         for (let d in typeDurition) {
    //           totalTypeSeconds += (tools.time2seconds(typeDurition[d][1]) - tools.time2seconds(typeDurition[d][0]))
    //         }
    //         if(totalTypeSeconds>0)
    //         {let typeStepR = typeArcScale_linear(totalTypeSeconds)//Math.PI/2;

    //         let endAnglet = typeStartR + 1 * typeStepR
    //         var dataset = { startAngle: typeStartR, endAngle: endAnglet }; //创建一个弧生成器
    //         typeStartR = endAnglet;
    //         var arcPath = d3.arc()
    //           .innerRadius(r + 10)
    //           .outerRadius(r + 25);
    //         var pathArc = arcPath(dataset);
    //         _this.drawArc(svg, x, y - r / 2, pathArc, color, color, 'type f' + data['id'] + " t" + i);}
    //       }

    //       let sonTotal = 0;
    //       let sonNum = 0
    //       for (let s in sonList) {
    //         let sonData = oData.find(function (d) { return d['id'] == sonList[s] });
    //         let sonDur = sonData['totalDuration'];
    //         sonTotal += sonDur;
    //         sonNum += 1;
    //       }
    //       let skipArc = Math.PI / (sonNum + 2);
    //       let timeSonLinear = d3.scaleLinear([0, sonTotal], [0, Math.PI * 2 - skipArc * sonNum]);
    //       let timeSonHeighLinear = d3.scaleLinear([0, sonTotal], [40, 40]);

    //       let timeSonColor_linear = d3.scaleLinear().domain([0, sonTotal]).range([0, 1]);
    //       let timeSonCompute_color = d3.interpolate("white", circleColor);
    //       var sonStartR = 0;//-Math.PI/2;
    //       for (let s in sonList) {
    //         let sonData = oData.find(function (d) { return d['id'] == sonList[s] });
    //         let sonDur = sonData['totalDuration'];

    //         let sonStepR = timeSonLinear(sonDur)//Math.PI/2;

    //         let endAnglet = sonStartR + sonStepR;
    //         var dataset = { startAngle: sonStartR, endAngle: endAnglet }; //创建一个弧生成器
    //         sonStartR = endAnglet;
    //         let color = 'blue';
    //         var arcPath = d3.arc()
    //           .innerRadius(r + 28)
    //           .outerRadius(r + timeSonHeighLinear(sonDur));
    //         var arcMidPath = d3.arc()
    //           .innerRadius(0)
    //           .outerRadius(r + 32);
    //         var pathArc = arcPath(dataset);

    //         endAnglet = sonStartR + skipArc;
    //         var midDataset = { startAngle: sonStartR, endAngle: endAnglet }; //创建一个弧生成器

    //         let jiantouPath = d3.path();
    //         jiantouPath.arc(x, y - r / 2, r + 32, sonStartR - Math.PI / 2, endAnglet - Math.PI / 2);

    //         sonStartR += skipArc;
    //         var pathMidArc = arcMidPath(midDataset);
    //         let timeSonColor = compute_color(color_linear(sonData['attribute']['importance']));
    //         _this.drawArc(svg, x, y - r / 2, pathArc, timeSonColor, timeSonColor, 'son f' + data['id'] + " s" + sonList[s], '0');
    //         if (s != sonList.length - 1) {
    //           _this.drawTimeLine(svg, jiantouPath, "rgb(200,200,200)", 3, '9,5', 'midArc ', 'midArc ');
    //         }
    //       }

    //     }


    //   }
    //   let txts = data['name'].split(" ")
    //   let tx = x - r - 30;
    //   let ty = y + r +60;
    //   let tw = r*2;
    //   tx = x;
    //   if(data['son'].length==0){
    //     tx = x//-r-10;
    //     ty = y+r*2;
    //   }
    //   if(data['id']=="3"){
    //     tx = x-10;
    //     ty = y+r*2;
    //   }
    //   if(data['id']=="4"){
    //     tx = x+10;
    //     ty = y+r*2;
    //   }
    //   // if(data['type']=='1'){
    //   //   tx = x-r/2;
    //   //   ty = y+r*2;
    //   // }

    //   _this.drawTxt(svg, tx, ty,tw , txts, "grey",22, `text_${data['id']}`);
    //   // let txts = _this.nameinput.split(" ")
    //   // _this.drawTxt(svg, x - r - 32, y + r + 50, r * 2 + 64, txts, "grey");
    // },
    drawTxt(svg, x, y, width, txts, fill, fontsize = 12, idN) {
      let tx = x;
      let ty = y;
      let preWidth = 0;
      let preIdN = 0;
      let pretext = ''
      for (let t = 0; t < txts.length; t++) {
        pretext +=" "+ txts[t];
        let txt = svg.append("text")
          .attr("y", ty)
          .attr("x", tx)
          .attr("id", `${idN}_${t}`)
          .attr("fill", fill)
          .attr("font-size", fontsize)
          .style("text-anchor", "middle")
          .text(pretext)
        let textWidth = document.getElementById(`${idN}_${t}`).getBBox().width;
        if((textWidth>width)||(t==txts.length -1)){
          pretext = '';
          tx = x;
          ty += 25;
        }
        else{
          txt.remove()
        }
        preWidth += textWidth;
      }
    },
    drawTxtOri1(svg, x, y, width, txts, fill,fontsize=12) {
      let tx = x;
      let ty = y;
      for (let t = 0; t < txts.length; t++) {

      let txt =   svg.append("text")
          .attr("y", ty)
          .attr("x", tx)
          .attr("fill", fill)
          .attr("font-size",fontsize)
          .style("text-anchor", "middle")
          .text(txts[t])
        tx += txts[t].length * 14;
        if (tx - x > width) {
          tx = x;
          ty += 25;
        }
      }
    },
    drawTxtOri(svg, x, y, width, txts, fill) {
      let tx = x;
      let ty = y;
      for (let t = 0; t < txts.length; t++) {

        svg.append("text")
          .attr("y", ty)
          .attr("x", tx)
          .attr("fill", fill)
          .text(txts[t])
        tx += txts[t].length * 10;
        if (tx - x > width) {
          tx = x;
          ty += 25;
        }
      }
    },
    drawTriangle(svg, color, points, stroke, opacity = 1) {
      svg.append("polygon")
        .attr("points", points)
        .attr("fill", color)
        .attr("stroke-linejoin", "round")
        .attr("opacity", opacity)
        .attr("stroke", stroke)
        .attr("stroke-width", "15px");
    },
    drawCircle(svg, x, y, r, fill, data, opacity, className = 'entCircle', idName) {
      const _this = this;
      const oData = _this.data
      svg.append("circle")
        .attr("id", idName)
        .attr("class", className)
        .attr("opacity", opacity)
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", r)
        .attr("fill", fill)
        .on("mouseover", function (d) {
          d3.select(this).attr("r", r * 1.1)
          let classN = d3.select(this).attr("class");
          if (classN == 'linePoint') {
            d3.select(this).attr("opacity", 1).attr("r", 5)
          }
          else {
            d3.selectAll(".f" + data['id'])
              .attr("transform", function (d) {
                let transformd = d3.select(this).attr("transform")
                return transformd.split(" ")[0] + " scale(1.1)"
              })

            d3.selectAll(".basicRel")
              .attr("class", function (d) {
                let classN = d3.select(this).attr("class");
                let classNList = classN.split(" ");
                let jg = 0;
                for (let i = 0; i < classNList.length - 1; i++) {
                  console.log('source' + data['id'], classNList[i])
                  if ('source' + data['id'] == classNList[i]) { jg = 1; }
                  if ('target' + data['id'] == classNList[i]) { jg = 1; }
                }
                if (jg == 1) {
                  classN += " activeS";
                }
                return classN;
              })
          }
        })
        .on("mouseleave", function (d) {
          d3.select(this).attr("r", r)
          let classN = d3.select(this).attr("class");
          if (classN == 'linePoint') {
            d3.select(this).attr("opacity", 0).attr("r", 5)
          }
          else {
            d3.selectAll(".f" + data['id'])
              .attr("transform", function (d) {
                let transformd = d3.select(this).attr("transform")
                return transformd.split(" ")[0] + " scale(1)"
              })
            d3.selectAll("path")
              .attr("class", function (d) {
                let thisSelect = d3.select(this)
                let classN = thisSelect.attr("class");
                let classNList = classN.split(" ")
                if (classNList[classNList.length - 1] == "activeS") {
                  classN = "";
                  for (let i = 0; i < classNList.length - 1; i++) {
                    classN += classNList[i] + " ";
                  }
                }
                return classN
              })
          }
        })
        .on("mousedown", function (d) {
          d3.select(this).attr("r", r);
          d3.selectAll(".f" + data['id'])
            .attr("transform", function (d) {
              let transformd = d3.select(this).attr("transform")
              return transformd.split(" ")[0] + " scale(1)"
            })
          let thisId = this.id.split("_")[1];
          let thisData = oData.find(function (a) { return a['id'] == thisId })
          let thisTime = thisData['time'];
          _this.click_Ent(thisTime);
          // console.log(thisTime,thisId,thisData)
        })
      // .on("")
    },
    drawTimeLine(svg, path, stroke, width, stroke_dasharray = "0", idName, className) {
      svg.append('path')
        .attr('d', path.toString())
        .attr('stroke', stroke)
        .attr('class', className)
        .attr('id', idName)
        .attr("stroke-dasharray", stroke_dasharray)
        .attr('stroke-width', width)
        .attr('fill', 'none')
        .on('mouseover', function (d) {
          let thisSelect = d3.select(this)
          let classN = thisSelect.attr("class");
          let idN = thisSelect.attr("id");
          if (classN.split(" ")[0] == "basicRel") {
            d3.select(this).attr("class", classN + " activeS");
          }
        })
        .on('mouseleave', function (d) {
          let thisSelect = d3.select(this)
          let classN = thisSelect.attr("class");
          let classNList = classN.split(" ")
          if (classNList[classNList.length - 1] == "activeS") {
            classN = "";
            for (let i = 0; i < classNList.length - 1; i++) {
              classN += classNList[i] + " ";
            }
            d3.select(this).attr("class", classN);
          }
        })
    },
    drawArc(svg, x, y, arcPath, stroke, fill, className, stroke_dasharray = "0", width = 3) {
      svg.append("path")
        .attr("d", arcPath)
        .attr("class", className)
        .attr("transform", "translate(" + x + "," + y + ")")
        .attr("stroke", stroke)
        .attr('stroke-width', width)
        .attr("stroke-dasharray", stroke_dasharray)
        .attr("stroke-linejoin", "round")
        .attr("fill", fill)
    },
    updata() {
      
    const _this = this;
      let data = _this.data;
      let maxDImportance = Math.max.apply(Math, data.map(function (d) { return d['attribute']['importance']; }))
      let minDImportance = Math.min.apply(Math, data.map(function (d) { return d['attribute']['importance']; }))
      let maxDRelevance = Math.max.apply(Math, data.map(function (d) { return d['attribute']['relevance']; }))
      let minDRelevance = Math.min.apply(Math, data.map(function (d) { return d['attribute']['relevance']; }))
      let maxDDuration = Math.max.apply(Math, data.map(function (d) { return tools.time2seconds(d['time'][1]) - tools.time2seconds(d['time'][0]); }))
      let maxTotalDuration = Math.max.apply(Math, data.map(function (d) { return d['totalDuration']; }))

      _this.minDImportance = minDImportance;
      _this.maxDImportance = maxDImportance;
      _this.minDRelevance = minDRelevance;
      _this.maxDRelevance = maxDRelevance;
      _this.maxDDuration = maxDDuration;
      _this.maxTotalDuration = maxTotalDuration;

      let currentMaxColor = _this.importanceMaxColor;
      let currentMinColor = _this.importanceMinColor;
      _this.importanceColor_linear = d3.scaleLinear().domain([minDImportance, maxDImportance]).range([0, 1]);
      _this.importanceCompute_color = d3.interpolate(currentMinColor, currentMaxColor);
      _this.relevanceScale_linear = d3.scaleLinear([minDRelevance, maxDRelevance], [20, 50])
      _this.totalDurationScale_linear = d3.scaleLinear().domain([0, maxTotalDuration]).range([20, 60]);




      _this.$bus.$emit("graphData", _this.data);
      _this.$bus.$emit("relData", _this.relData);
      // _this.drawtopicLine();
      // _this.drawrootTree();
      _this.draweditData();
    },
    click_Ent(time) {
      this.$emit("timeDur", time);
    },
  },
  created() {
    const _this = this;
    this.$nextTick(() => {
      _this.getTreeData();
      _this.updata();

    this.$bus.$on('selectE', (val) => {
     console.log(111,val);
     _this.curEntId = val;
    });
    });
  },
  mounted() {
    const _this = this
    _this.tableData.find(function (d) { return d['key'] == 'name' })['value'] = 'Computer Network';
    console.log(23213)
    
    this.$bus.$on('importanceLinear', (val) => {
      console.log(val)
      _this.importanceLinear = val;
    });

    
    // disabled in the online demo
    // this.$bus.$on('entData', (val) => {
    //   _this.data = val;
    // });
    // this.$bus.$on('relData', (val) => {
    //   _this.relData = val;
    // });
  },
  // beforeDestroy() {
  //   clearInterval(this.moveTimer);
  // },
} 
</script>

<style>
@import './index.css';
</style>
