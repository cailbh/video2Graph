<!-- eslint-disable no-unused-vars -->
<!-- eslint-disable no-unused-vars -->

<template>
  <div class="graph" ref="graphDiv">
    <!-- <div class="panelHead">ConceptMap</div> -->
    <div id="graphTimeAxisPanel" class="">
    </div>
    <div id="graphPanel" class="panelBody">
    </div>
    <!-- <div id="moveLeft" ref="moveGraphLeft"></div>
                    <div id="moveRight" ref="moveGraphRight"></div> -->
    <div id="assistGraphPanel" class="panel">
      <div class="panelHead"></div>
    </div>

    <div id="zoomInDiv" @click="zoomInLayoutClk">
      <img class="icons" :src="zoomInUrl">
    </div>
    <div id="zoomOutDiv" @click="zoomOutLayoutClk">
      <img class="icons" :src="zoomOutUrl">
    </div>
    <div id="editToolDiv" @click="editToolClk">
      <img class="icons" :src="editToolUrl">
    </div>
  </div>
</template>
  
<script>
import * as d3 from 'd3'
import { onMounted, ref } from 'vue';
import filenames from "@/utils/fileName";
import domtoimage from 'dom-to-image';
import TestJson from "@/assets/json/case2_fin.json";
import TestRelJson from "@/assets/json/case2_fin_rel.json";
import tools from "@/utils/tools.js";

export default {
  props: ["videoTime"],
  data() {
    return {
      data: TestJson,
      gData: "TestJson",
      relData: TestRelJson,
      assistGTransformX: 10,
      assistGTransformY: 100,
      drawEntityLocation: [],
      showEntityList: [],
      overEntityId:'',
      showEntityRelIdList: [],
      showEntityRelIdOverState: '',
      rootEntityList: [],
      rootSvg: null,
      TimeAxisSvg: null,
      groupsSvg: null,
      arcG: null,
      curEntId: '',
      minDImportance: 0,
      maxDImportance: 0,
      minDRelevance: 0,
      maxDRelevance: 0,
      maxDDuration: 0,
      timeAxisX: 0,
      timeAxisW: 200,
      timeAxisDropFlag: 0,
      timeAxisDownX: 0,
      timeAxisDownW: 60,
      maxTotalDuration: 0,
      videoDuration: 672,
      totalDuration: 1000,
      importanceColor_linear: null,
      importanceCompute_color: null,
      relevanceScale_linear: null,
      totalDurationScale_linear: null,
      sumTotalDuration: 0,
      // importanceMinColor: "rgb(1, 164, 183)",
      // importanceMaxColor: "rgb(106, 52, 127)",
      zoomInUrl: require("@/assets/img/zoomIn.png"),
      zoomOutUrl: require("@/assets/img/zoomOut.png"),
      editToolUrl: require("@/assets/img/edit.png"),
      layoutShow: 2,
      graphGTransformK: 1,
      graphGTransformX: 10,
      graphGTransformY: 100,
      graphGMoveX: 10,
      graphSvgScale: 1,
      moveTimer: null,
      moveFlag: false,
      importanceMinColor: "rgb(203, 230, 209)",
      importanceMaxColor: "rgb(22, 144, 207)",
      stepX: 150,
      stepY: 100,
      circleInterval: 55,
      width: 0,
      height: 0,
      curToolState: 'unEdit',
      margin: { top: 80, right: 20, bottom: 0, left: 20 },
      color: [
        "rgb(255,60,60)",
        "rgb(0, 178, 171)",
        // "rgb(255,83,255)",
        "rgb(235,135,162)",
        "rgb(255,178,101)",
        "rgb(63,151,134)",
        "rgb(83,255,255)",
        "rgb(0,122,244)",
        "rgb(168,168,255)",
        "rgb(200,200,200)",
      ],
      mcolor: [
        "rgb(125, 66, 206)",
        "rgb(248, 134, 124)",
        "rgb(50, 198, 191)",
        "rgb(135, 126, 253)",
        "rgb(198, 121, 123)",
        "rgb(252, 177, 49)",
        "rgb(112, 202, 229)",
      ],
      // mcolor: [
      //   "rgb(91, 107, 255)",
      //   "rgb(0, 178, 171)",
      //   // "rgb(6, 214, 160)",
      //   "rgb(255, 120, 90)",
      //   "rgb(125, 98, 211)",
      //   "rgb(255, 113, 212)",
      //   "rgb(112, 214, 255)",
      //   "rgb(255, 159, 28)",
      //   "rgb(255, 77, 109)",
      // ],
      mDarkcolor: [
        "rgb(95, 39, 179)",
        "rgb(221, 83, 72)",
        "rgb(0, 158, 148)",
        "rgb(93, 88, 202)",
        "rgb(180, 72, 79)",
        "rgb(202, 134, 32)",
        "rgb(46, 174, 202)",
      ],
      mLigntcolor: [
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
    type(val) {
    },
    timeAxisX(val) {
      const _this = this;
      _this.updataTimeAxisDur(_this.TimeAxisSvg, _this.timeAxisX, _this.timeAxisW);
    },
    curEntId(val) {
      const _this = this;
      _this.overEntityId = val;
      _this.$bus.$emit("selectEnt", val);
      let entityLocationData = _this.drawEntityLocation;

      let relData = _this.relData;
      let showJageData = _this.showEntityList;
      let basicRel = relData['basicRel'];
      for (let r = 0; r < basicRel.length; r++) {
        let sorceId = basicRel[r][0];
        let targetId = basicRel[r][1];
        let sorceJage = showJageData.find(function (d) { return d['id'] == sorceId })['show'];
        let targetJage = showJageData.find(function (d) { return d['id'] == targetId })['show'];
        if (sorceJage && targetJage) {
          let trnId = '-1';
          if (sorceId == parseInt(val)) {
            trnId = targetId;
          }
          else if (targetId == parseInt(val)) {
            trnId = sorceId;
          }
          if (trnId != '-1') {
            let curEnt = entityLocationData.find(function (d) { return parseInt(d['id']) == trnId });
            _this.assistGTransformX = parseInt(-curEnt['x']) + parseFloat(curEnt['r']) + 150;
            _this.assistGTransformY = parseInt(-curEnt['y']) + parseFloat(curEnt['r']) + 300;
            _this.updataAssistGraphPanel();
          }
        }

      };
      let similarityRel = relData['similarityRel'];
      for (let r = 0; r < similarityRel.length; r++) {
        let sorceId = similarityRel[r][0];
        let targetId = similarityRel[r][1];
        let sorceJage = showJageData.find(function (d) { return d['id'] == sorceId })['show'];
        let targetJage = showJageData.find(function (d) { return d['id'] == targetId })['show'];
        if (sorceJage && targetJage) {
          let trnId = '-1';
          if (sorceId == parseInt(val)) {
            trnId = targetId;
          }
          else if (targetId == parseInt(val)) {
            trnId = sorceId;
          }
          if (trnId != '-1') {
            let curEnt = entityLocationData.find(function (d) { return parseInt(d['id']) == trnId });
            _this.assistGTransformX = parseInt(-curEnt['x']) + parseFloat(curEnt['r']) + 150;
            _this.assistGTransformY = parseInt(-curEnt['y']) + parseFloat(curEnt['r']) + 300;
            _this.updataAssistGraphPanel();
          }
        }

      };


    },
    overEntityId(val){
      const _this = this;
      
      let relList = [];
      let relRootList = [];
      let relData = _this.relData;
      let oData = _this.drawEntityLocation;
      let basicRel = relData['basicRel'];
      d3.selectAll('.timeAxisEnt').attr("stroke-width",0).attr("opacity",0.4).attr("stroke",function(){
        let cid = d3.select(this).attr("id").split("_")[1];
        let nd = oData.find(function (d) { return d['id'] == cid });
        console.log(2222,nd)
        return nd['colorD']
      });
      for (let re = 0; re < basicRel.length; re++) {

        let sorceId = basicRel[re][0];
        let targetId = basicRel[re][1];
        let cNode = '';
        if (sorceId == val) {
          cNode = oData.find(function (d) { return d['id'] == targetId });
          relList.push(targetId);
          relRootList.push(cNode['rootIndex']);
        }

        if (targetId == val) {
          cNode = oData.find(function (d) { return d['id'] == sorceId });
          relList.push(sorceId);
          relRootList.push(cNode['rootIndex']);
        }
      };
      console.log(1111111111111111111111111111111,relList);
      relList.forEach((self, indx, arr) => {

        d3.select(`#timeAxisEnt_${self}`).attr("stroke",'white').attr("stroke-width",2).attr("opacity",1);
      })
        d3.select(`#timeAxisEnt_${val}`).attr("stroke-width",2).attr("opacity",1);
    },
    showEntityRelIdList(val){
      this.updataRel();
    },
    groupsSvg: {
      deep: true,
      handler() {
        this.updataAssistGraphPanel();
      }
    },
    gData(val) {
    },
    layoutShow(val) {
      const _this = this;
      let showEntityList = tools.deepClone(_this.data);
      for (let e in showEntityList) {
        if (parseInt(showEntityList[e]['layout']) < parseInt(val))
          showEntityList[e]['show'] = true;
        else {
          showEntityList[e]['show'] = false;
        }
      }
      _this.showEntityList = showEntityList;
      _this.updataGraph();
    },
    data(val) {
    },
    videoTime(val) {
      const _this = this;
      let entityLocationData = _this.drawEntityLocation;
      for (let e = 0; e < entityLocationData.length; e++) {
        let curD = entityLocationData[e];
        let timeStart = tools.time2seconds(entityLocationData[e]['time'][0]);
        let timeEnd = tools.time2seconds(entityLocationData[e]['time'][1]);
        if ((val > timeStart) && (val < timeEnd)) {
          let entX = entityLocationData[e]['x'];
          let entY = entityLocationData[e]['y'];
          let entR = entityLocationData[e]['r'];
          let moveLinear = d3.scaleLinear([timeStart, timeEnd], [entX - entR, entX + entR])
          _this.graphGTransformX = -moveLinear((val));
        }
      }
    },
    graphGMoveX(val) {
      const _this = this;
      console.log(val);
      let data = _this.drawEntityLocation;
      let stjg = 0;
      let enjg = 0;
      let snode = '';
      let enode = '';
      let width = 1590
      data.forEach((self, indx, arr) => {
        let entx = self['x'] * _this.graphGTransformK;
        let transformX = entx + val;
        if ((transformX > 0) && (transformX < width)) {
          stjg++;
        }
        else {
          if ((stjg > 0) && enjg == 0) {
            enode = self;
            enjg = 1
          }
        }
        if (stjg == 1) {
          snode = self
        }
      })
      let ew = enode['timeW'];
      if(snode == ''){
        _this.timeAxisX =0
      }
      else
      _this.timeAxisX = snode['timeX'];
      _this.timeAxisW = enode['timeX'] - snode['timeX'] + enode['timeW']
      if(ew==undefined){
        _this.timeAxisW = width - snode['timeX']
      }
    },
    graphGTransformX(val) {
      const _this = this;
      let groups = _this.groupsSvg;
      _this.graphGMoveX = _this.graphGTransformX;
      let graphGTransformX = _this.graphGTransformX;
      let graphGTransformY = _this.graphGTransformY;
      let graphGTransformK = _this.graphGTransformK;
      groups.attr("transform", "translate(" + graphGTransformX + ',' + graphGTransformY + ") scale(" + graphGTransformK + ")");
    }
  },
  methods: {
    editToolClk() {
      const _this = this;
      if (_this.curToolState == 'edit') _this.curToolState = 'unEdit';
      else if (_this.curToolState != 'edit') _this.curToolState = 'edit';
      this.$emit("toolState", this.curToolState);
    },
    updataRel(){
      const _this = this;
      let relData = _this.relData;
      let oData = _this.drawEntityLocation;
      let showJageData = _this.showEntityList;
      let showRel = _this.showEntityRelIdList;
      let basicRel = relData['basicRel'];
      for (let r = 0; r < basicRel.length; r++) {
        let sorceId = basicRel[r][0];
        let targetId = basicRel[r][1];
        let idN = "basicRel" + sorceId + "_" + targetId;
        console.log(sorceId,showRel,showRel.includes(sorceId))
        if((showRel.includes(sorceId))||(showRel.includes(targetId))){
          d3.select(`#${idN}`).attr('opacity',1).attr('stroke','darkslateblue')
        }
        else{
          d3.select(`#${idN}`).attr('opacity',0)
          
        }
      };
    },
    drawRelationshipLine(svg) {
      const _this = this;
      let relData = _this.relData;
      let oData = _this.drawEntityLocation;
      let showJageData = _this.showEntityList;
      let margin = _this.margin;
      let height = svg.attr('height');
      let basicRel = relData['basicRel'];
      for (let r = 0; r < basicRel.length; r++) {

        let sorceId = basicRel[r][0];
        let targetId = basicRel[r][1];
        let idN = "basicRel" + sorceId + "_" + targetId;
        let classN = "basicRel source" + sorceId + " target" + targetId;
        let sorceNode = oData.find(function (d) { return d['id'] == sorceId });
        let targetNode = oData.find(function (d) { return d['id'] == targetId });
        let sorceJage = showJageData.find(function (d) { return d['id'] == sorceId })['show'];
        let targetJage = showJageData.find(function (d) { return d['id'] == targetId })['show'];
        if (sorceJage && targetJage) {
          if (sorceNode['x'] > targetNode['x']) {
            let tp = sorceNode;
            sorceNode = targetNode;
            targetNode = tp;
          }
          const path = d3.path();

          let startX = sorceNode['x'];
          let endX = targetNode['x'];
          let midX = (startX + endX) / 2;
          let flag = ((sorceNode['sonFlag']) || (targetNode['sonFlag']));
          // if((targetNode['id'] == "4")||((sorceNode['id']=="1")&&(targetNode['id']=="6"))||((sorceNode['id']=="2")&&(targetNode['id']=="7"))||((sorceNode['id']=="3")&&(targetNode['id']=="8"))){
          //   flag = true;
          // }
          if (targetNode['id'] == "4") {
            flag = true;
          }
          // if(targetNode['id'] == "30"){
          //   flag = true;
          // }
          let rsourceint = (sorceNode['sonFlag']) ? (20) : (2);
          let rtargetint = (targetNode['sonFlag']) ? (20) : (2);
          let startY = (flag) ? (sorceNode['y'] - sorceNode['r'] - rsourceint) : (sorceNode['y'] + sorceNode['r'] + rsourceint);
          let endY = (flag) ? (targetNode['y'] - targetNode['r'] - rtargetint) : (targetNode['y'] + targetNode['r'] + rtargetint);

          let cnx1 = startX - 50;
          let cnx2 = endX + 50;
          let midY = (startY + endY) / 2;
          // if(((sorceNode['id']=="1")&&(targetNode['id']=="6"))||((sorceNode['id']=="2")&&(targetNode['id']=="7"))||((sorceNode['id']=="3")&&(targetNode['id']=="8"))){
          //   midY-=140
          // }
          let h = (((endX - startX) / 5) > (parseInt(height) + 100)) ? (parseInt(height) + 100) : ((endX - startX) / 5);
          let cny = (flag) ? (midY - h) : (midY + h);

          let cny1 = cny;
          let cny2 = cny;

          if (((sorceNode['layout'] == 2) && (cny < 0)) || ((sorceNode['layout'] == 0) && (cny > 0))) {
            cnx1 -= 250;
            cny1 = cny * 1.3;
          }
          if (((targetNode['layout'] == 2) && (cny < 0)) || ((targetNode['layout'] == 0) && (cny > 0))) {
            cnx2 += 250;
            cny2 = cny * 1.3;
          }
          // let midP = [(startP[0]+endP[0])/2,(startP[1])>(endP[1])?(startP[1]-100):(endP[1]-100)];
          path.moveTo(startX, startY);
          path.bezierCurveTo(midX, cny, midX, cny, endX, endY);
          _this.drawTimeLine(svg, path, "rgb(200,200,200)", 5, "9,9", idN, classN);
        }

      };
      let similarityRel = relData['similarityRel'];
      // let basicRel = relData['basicRel'];
      for (let r = 0; r < similarityRel.length; r++) {

        let sorceId = similarityRel[r][0];
        let targetId = similarityRel[r][1];

        let idN = "similarityRel" + sorceId + "_" + targetId;

        let classN = "similarityRel source" + sorceId + " target" + targetId;
        let sorceNode = oData.find(function (d) { return d['id'] == sorceId });
        let targetNode = oData.find(function (d) { return d['id'] == targetId });
        let sorceJage = showJageData.find(function (d) { return d['id'] == sorceId })['show'];
        let targetJage = showJageData.find(function (d) { return d['id'] == targetId })['show'];
        if (sorceJage && targetJage) {

          if (sorceNode['x'] > targetNode['x']) {
            let tp = sorceNode;
            sorceNode = targetNode;
            targetNode = tp;
          }
          const path = d3.path();

          let startX = sorceNode['x'] + sorceNode['r'] / 2;
          let endX = targetNode['x'] - targetNode['r'] / 2;
          let midX = (startX + endX) / 2;
          let flag = ((sorceNode['sonFlag']) || (targetNode['sonFlag']));
          let rsourceint = (sorceNode['sonFlag']) ? (20) : (2);
          let rtargetint = (targetNode['sonFlag']) ? (20) : (2);
          let startY = (flag) ? (sorceNode['y'] - sorceNode['r'] - rsourceint) : (sorceNode['y'] + sorceNode['r'] + rsourceint);
          let endY = (flag) ? (targetNode['y'] - targetNode['r'] - rtargetint) : (targetNode['y'] + targetNode['r'] + rtargetint);

          let midY = (startY + endY) / 2;

          // let h1Scale_linear = d3.scaleLinear([0, _this.width], [(sorceNode['y']>targetNode['y'])?(sorceNode['y']*2):(targetNode['y']*2),parseInt(height)])
          let h = (((endX - startX) / 14) > (parseInt(height) - 10)) ? (parseInt(height) - 10) : ((endX - startX) / 14);
          let hScale_linear = d3.scaleLinear([0, _this.width / 2], [0, h / 3 * 2])
          let cny = (flag) ? (midY - hScale_linear(endX)) : (midY + hScale_linear(endX));
          if (sorceNode['id'] == '7') { cny -= 20 }
          if (cny < -150) {
            startY = sorceNode['y'] + sorceNode['r'] + rsourceint
            endY = targetNode['y'] + targetNode['r'] + rtargetint
            cny = height - cny - 300;
          }

          path.moveTo(startX, startY);
          path.lineTo(startX, cny);
          path.lineTo(endX, cny);
          path.lineTo(endX, endY);
          _this.drawTimeLine(svg, path, "rgb(200,200,200)", 5, "0", idN, classN);
        }


      };
      _this.updataRel()
    },
    drawMain(svg) {
      let _this = this;
      let data = _this.data;
      let margin = _this.margin;

      let width = _this.width - margin.left - margin.right;
      let height = _this.height - margin.top - margin.bottom;

      let graphGTransformX = _this.graphGTransformX;
      let graphGTransformY = _this.graphGTransformY;
      let graphGTransformK = _this.graphGTransformK;
      let axisGroups = svg.append("g").attr("id", "axisGroups").attr("width", width).attr("height", height)
      // .attr("transform", "translate(" + graphGTransformX + ',' + graphGTransformY + ") scale(" + graphGTransformK + ")");
      let groups = svg.append("g").attr("id", "groups").attr("width", width).attr("height", height)
        .attr("transform", "translate(" + graphGTransformX + ',' + graphGTransformY + ") scale(" + graphGTransformK + ")");
      this.groupsSvg = groups;

      let backG = groups.append("g").attr("id", "backG").attr("width", width).attr("height", height);
      let arcG = groups.append("g").attr("id", "arcG").attr("width", width).attr("height", height);
      let timeLineG = groups.append("g").attr("id", "timeLineG").attr("width", width).attr("height", height);
      let circleG = groups.append("g").attr("id", "circleG").attr("width", width).attr("height", height);

      _this.arcG = arcG;
      let stepX = _this.stepX;
      let stepY = _this.stepY;
      let interval = _this.circleInterval;


      let scalePre = _this.graphSvgScale;
      let stx = 0;
      let sty = 0;
      let stk = 1;
      var graphZoom = d3.zoom()
        .scaleExtent([0, 10])
        .on("start", (e) => {
          sty = e.transform.y;
          stx = e.transform.x;
          stk = e.transform.k;
        })
        .on('zoom', (e) => {
          graphGTransformX = _this.graphGTransformX + e.transform.x - stx;
          graphGTransformY = _this.graphGTransformY + e.transform.y - sty;
          graphGTransformK = _this.graphGTransformK + e.transform.k - stk;
          _this.graphGMoveX = graphGTransformX;

          groups.attr('transform', 'translate(' + (graphGTransformX) + ',' + (graphGTransformY) + ') scale(' + (graphGTransformK) + ')')
        })
        .on('end', (e) => {
          _this.graphGTransformX = graphGTransformX;
          _this.graphGTransformY = graphGTransformY;
          _this.graphGTransformK = graphGTransformK;
          groups.attr('transform', 'translate(' + (graphGTransformX) + ',' + (graphGTransformY) + ') scale(' + (graphGTransformK) + ')')
        });


      svg.call(graphZoom)
      // .call(graphZoom.transform, d3.zoomIdentity.scale(1))
      const path = d3.path()
      path.moveTo(margin.left, margin.top)
      let x = margin.left;
      let prex = margin.left;
      let prey = margin.top;
      let prer = 0;
      let preSonLen = 0;
      let layoutShow = _this.layoutShow;
      let sumTotalDuration = 0;
      let rootIndex = -1;
      for (let i = 0; i < data.length; i++) {
        let lay = parseInt(data[i]['layout']);

        let colors = _this.mcolor;
        let colorsD = _this.mDarkcolor;
        let entityLocationData = tools.deepClone(data[i]);
        if (lay == 0) {
          rootIndex++;
        }
        entityLocationData['rootIndex'] = rootIndex;
        entityLocationData['color'] = colors[rootIndex % colors.length];
        entityLocationData['colorD'] = colorsD[rootIndex % colorsD.length];
        let timeList = data[i]['time'];
        let duration = tools.time2seconds(timeList[1]) - tools.time2seconds(timeList[0]);
        sumTotalDuration += duration;
        let showEntity = _this.showEntityList.find(function (d) { return d['id'] == data[i]['id'] });
        if ((showEntity['show'] == true)) {
          let y = margin.top + lay * stepY
          let relevanceValue = data[i]['attribute']['relevance'];
          let totalDurationValue = data[i]['totalDuration'];
          let rScale = _this.totalDurationScale_linear;


          let r = rScale(totalDurationValue);
          let stepL = r + stepX / 2 + interval / 10;
          let controlP1x = prex + interval / 1;
          let controlP2x = x - interval / 1;
          let curLinex = x - r - interval;

          let relData = _this.relData;
          let oData = _this.drawEntityLocation;
          let basicRel = relData['basicRel'];
          let daId = data[(i)]['id'];
          let jg=0;
          for (let re = 0; re < basicRel.length; re++) {

            let sorceId = basicRel[re][0];
            let targetId = basicRel[re][1];
            let cNode = '';
            if ((sorceId == daId)||(targetId == daId)) {
              jg=1;
            }
          };
          let sonFlag = 1;
          if (((i > 0) && (preSonLen == 0)) && (data[(i)]['son'].length == 0)) {
            sonFlag = 0;
            stepL = r + stepX / 1.2 + interval / 10;
            x += stepL;
            controlP1x = prex + interval / 1;
            controlP2x = x - r - interval / 2 - interval / 1;
            curLinex = r + interval / 10;
          }
          else if (((i > 0) && (preSonLen != 0)) && (data[(i)]['son'].length == 0)) {
            sonFlag = 0;
            stepL = r + stepX + interval + 30;
            x += stepL;
            controlP1x = prex + interval / 1;
            controlP2x = x - r - interval / 1 - interval / 1;
            curLinex = r + interval / 10;
          }
          else {
            stepL = r + stepX + interval + 10;
            x += stepL;
            controlP1x = prex + interval / 1;
            controlP2x = x - r - interval - interval / 1;
            curLinex = r + interval;
          }
          
          if((jg==1)&&(data[i]['type']==0)){
            curLinex+=r*1.5
          }
          _this.drawEntity(circleG, x, y, r, data[i])
          path.bezierCurveTo(controlP1x, prey, controlP2x, y, x - curLinex, y)
          // path.lineTo(controlP1x, prey)
          // path.lineTo(controlP2x, y)
          // path.lineTo(x - curLinex, y)
          path.moveTo(x + curLinex, y);
          prex = x + curLinex;
          prey = y;
          prer = r;
          preSonLen = data[(i)]['son'].length;
          entityLocationData['x'] = x;
          entityLocationData['y'] = y;
          entityLocationData['r'] = r;
        }
        else {
          entityLocationData['x'] = prex;
          entityLocationData['y'] = prey;
          entityLocationData['r'] = prer;
        }
        entityLocationData['sonFlag'] = (entityLocationData['son'].length > 0) ? (1) : (0);
        // entityLocationData['showRel'] = false;
        _this.drawEntityLocation.push(entityLocationData);
      }
      let entityLocationData = _this.drawEntityLocation;
      let colors = _this.mcolor;
      let colorIndex = 0;
      let colorrootIndex = 0;

      _this.sumTotalDuration = sumTotalDuration;
      for (let i = 0; i < entityLocationData.length; i++) {
        let x = entityLocationData[i]['x'];
        let y = entityLocationData[i]['y'];
        let r = entityLocationData[i]['r'];
        if(entityLocationData[i]['type']==0){
        _this.drawEntityTimeAxis(circleG, entityLocationData[i]);}
        if ((entityLocationData[i]['layout'] == '0' && (entityLocationData[i]['name'] != 'Test'))) {
          colorIndex = colorrootIndex;
          colorrootIndex++;

        }
        if ((entityLocationData[i]['son'].length != 0) && (_this.showEntityList.find(function (d) { return d['id'] == entityLocationData[i]['son'][0] })['show'])) {
          let maxxs = entityLocationData[i]['x'] - entityLocationData[i]['r'] - 40;
          let maxys = entityLocationData[i]['y'] - entityLocationData[i]['r'] - 40;
          let minxs = tools.deepClone(maxxs);
          let minys = tools.deepClone(maxys);
          let rectPoints = [[maxxs, maxys]];
          let sons = tools.deepClone(data[i]['son']);
          while ((sons.length > 0)) {
            let s = sons[0];
            sons.splice(0, 1);
            let curson = entityLocationData.find(function (d) { return d['id'] == s; });
            let curgson = curson['son'];
            let curx = curson['x'] + curson['r'] * 2;
            let cury = curson['y'] + curson['r'] * 2;
            if (curx > maxxs) { maxxs = curx; }
            // if(curson['y']<maxys)maxys = curson['y'];
            if (cury < minys) minys = cury;
            if (cury > maxys) maxys = cury;
            for (let gs = 0; gs < curgson.length; gs++) {
              sons.push(curgson[gs]);
            }
          }
          rectPoints = [[minxs, minys], [minxs, maxys], [maxxs, maxys], [maxxs, minys]];
          // _this.drawpolygon(backG, colors[colorIndex], rectPoints, "rgb(255,255,255)",0.3);
          _this.drawRect(backG, minxs, minys, Math.abs(maxxs - minxs), Math.abs(maxys - minys), 20, 20, colors[colorIndex], 0.1, "white", `backRect${i}`)

          colorIndex++;
          colorIndex %= colors.length
        }
        // entityLocationData[i]['color'] = colors[colorIndex - 1];
        // if ((entityLocationData[i]['layout'] == '0') && ((entityLocationData[i]['name'] == 'Test') || (entityLocationData[i]['name'] == 'Example'))) {
        //   entityLocationData[i]['color'] = colors[colorIndex]
        // }
      }
      _this.drawTimeLine(timeLineG, path, "rgb(200,200,200)", 5, '0', 'timeLine ', 'timeLine ');
      _this.drawRelationshipLine(timeLineG);
      _this.drawTimeAxis(_this.TimeAxisSvg);
      _this.drawTypeRiver(_this.TimeAxisSvg);
      _this.updataTimeAxisDur(_this.TimeAxisSvg, _this.timeAxisX, _this.timeAxisW);
    },
    updataTimeAxisDur(svg, x, width) {
      const _this = this;
      let margin = _this.margin;
      let totalWidth = _this.width - margin.left - margin.right;
      let y = 0;
      let h = 160;
      _this.drawRect(svg, 0, y, x, h, 3, 3, 'white', 0.3, '', "timeAxisRect1")
      let curRect = _this.drawRect(svg, x, y-0, width, h-5, 3, 3, 'rgba(0,0,0,0)', 1, 'rgb(145, 180, 189)', 'winRect',2);
      // --------------------------------------
      // curRect.on('mousemove', function (e) {
      //   d3.select(this).attr("cursor", 'pointer');
      //   if (_this.timeAxisDropFlag == 1) {
      //     let mx = e.clientX - _this.timeAxisDownX;
      //     _this.timeAxisX = e.layerX - 450 - _this.timeAxisW / 2;
      //   }
      // })
      // curRect.on('mousedown', function (e) {
      //   _this.timeAxisDownX = e.clientX;
      //   _this.timeAxisDropFlag = 1;
      // })
      // curRect.on('mouseup', function (e) {
      //   _this.timeAxisDownX = e.clientX;
      //   _this.timeAxisDropFlag = 0;
      // })
      // ----------------------------------------

      _this.drawRect(svg, x + width, y, totalWidth - width, h, 3, 3, 'white', 0.3, '', "timeAxisRect2")
    },
    drawTypeRiver(svg) {
      const _this = this;
      let oriData = _this.data;
      let resData = [];
      let triLi = [];
      let exeLi = [];
      var defs = svg.append("defs");

      var filter = defs
        .append("filter")
        .attr("id", "coolShadow")
        .attr("x", "-100%")
        .attr("y", "-100%") //
        .attr("width", "300%")
        .attr("height", "300%"); //

      filter
        .append("feMorphology")
        .attr("in", "SourceGraphic")
        .attr("result", "upperLayer")
        .attr("operator", "dilate")
        .attr("radius", "0.2 0.2");

      filter
        .append("feMorphology")
        .attr("in", "SourceAlpha")
        .attr("result", "enlargedAlpha")
        .attr("operator", "dilate")
        .attr("radius", "0.2 0.2");

      filter
        .append("feGaussianBlur")
        .attr("in", "enlargedAlpha")
        .attr("result", "bluredAlpha")
        .attr("stdDeviation", "3");

      filter
        .append("feOffset")
        .attr("in", "bluredAlpha")
        .attr("result", "lowerLayer")
        .attr("dy", "1"); //

      var feMerge = filter.append("feMerge");
      feMerge.append("feMergeNode").attr("in", "lowerLayer");
      feMerge.append("feMergeNode").attr("in", "upperLayer");
      for (let i = 0; i < oriData.length; i++) {
        let curEnt = oriData[i];
        let tp = {}
        tp['od'] = i;
        if ((curEnt['type'] == "1")) {
          triLi.push(tp);
        }
        if (curEnt['type'] == "2") {
          exeLi.push(tp);
        }
        let typeData = curEnt["attribute"]["expressions"];
        let totalDur = 0;

        for (let t in typeData) {
          // let color = typeColor[i];
          let typeDurition = typeData[t];
          let totalTypeSeconds = 0;
          for (let d in typeDurition) {
            totalTypeSeconds += (tools.time2seconds(typeDurition[d][1]) - tools.time2seconds(typeDurition[d][0]))
          }
          totalDur += totalTypeSeconds;
          tp[t] = totalTypeSeconds;
        }
        for (let t in tp) {
          if (t != 'od') {
            tp[t] /= totalDur;
            if (totalDur == 0) {
              tp[t] = 0;
            }
          }
        }
        resData.push(tp)
      }

      let data = resData;
      console.log(data)
      var stack = d3.stack()
        .keys(['1', '2', '3'])
        .order(d3.stackOrderInsideOut)
        .offset(d3.stackOffsetWiggle);

      let yRangeWidth = 80;
      let w = parseInt(svg.attr("width"))+60
      let xStep = (w) / oriData.length;
      let yScale = d3.scaleLinear().domain([-1, 1]).range([0, 80]);
      var area = d3.area()
        .curve(d3.curveBasis)
        .x(function (d) {
          return d.data.od * xStep +15;
        })
        .y0(function (d) {
          return 120+yRangeWidth - yScale(d[0]);
        })
        .y1(function (d) {
          return 120+yRangeWidth - yScale(d[1]);
        });
      console.log(data)
      let stackData = stack(data)
      console.log(data, stackData)
      let lenThreshold = 0.4;
      let iconLi = {}
      for (let s in stackData) {
        iconLi[s] = []
        for (let i in stackData[s]) {
          let lenArea = stackData[s][i]
          if ((lenArea[1] - lenArea[0]) > 0.4) {
            iconLi[s].push([i, lenArea]);
          }
          for (let li in iconLi[s]) {
            if (i < (iconLi[s][li][0] + 2)) {
              let selectArea = iconLi[s][li][1]
              if (((selectArea[1] - lenArea[1]) - (selectArea[0] - lenArea[0])) < 0.2) {
                iconLi[s].splice(s, 1);
              }
            }
          }
        }
      }
      // let areaG = svg.append("g")
      let typeColor = {
        "1": "#ff9c9c",
        "2": "#f4f4d0",
        "3": "#6f8be0",
      };
      let colorLi = _this.mcolor;
      svg.selectAll("path")
        .data(stackData)
        .join("path")
        .attr("id",function(d){return d.key})
        .attr("class","river")
        .attr("d", function (d) {
          return area(d)
        })
        .attr("fill", function (d, i) {
          return typeColor[d.key]
        })
        .on("mouseover",function(d){
          d3.selectAll(".river").style("filter", "url()")
          d3.select(this).style("filter", "url(#coolShadow)")
        })

      for (let t in triLi) {
        let area = tools.calcTriangle((triLi[t]['od']) * xStep, -30, 14);
        _this.drawTriangle(svg, "rgb(250, 199, 88)", area, "rgb(250, 199, 88)");
        _this.drawTxt(svg, (triLi[t]['od']) * xStep, -23, "T", "white", 0, "middle", 18)
      }
      for (let t in exeLi) {
        let area = tools.calcTriangle((exeLi[t]['od']) * xStep, -30, 14);
        _this.drawTriangle(svg, "rgb(250, 199, 88)", area, "rgb(250, 199, 88)");
        _this.drawTxt(svg, (exeLi[t]['od']) * xStep, -23, "E", "white", 0, "middle", 18)
      }
    },
    drawTimeAxis(svg) {
      const _this = this;
      let sumTotalDuration = _this.sumTotalDuration;
      let data = _this.drawEntityLocation;
      let addData = tools.deepClone(_this.drawEntityLocation);
      let margin = _this.margin;
      let prex = margin.left;
      let prey = margin.top / 2;
      let width = svg.attr("width")// _this.width - margin.left - margin.right;
      let height = _this.height - margin.top - margin.bottom;
      let widthScale = d3.scaleLinear([0, sumTotalDuration], [0, width]);
      data.forEach((self, indx, arr) => {
        let totalDurationValue = self['totalDuration'];
        let timeList = self['time'];
        let id = self['id']
        let duration = tools.time2seconds(timeList[1]) - tools.time2seconds(timeList[0]);
        // console.log(timeList,tools.time2seconds(timeList[0]))
        let evWidth = widthScale(duration)-4;

        let evTWidth = widthScale(totalDurationValue);
        let lay = parseInt(self['layout']);
        let evHight = 80 - 20 * lay;
        let x = prex;
        let y = prey + 20 * lay;
        prex += evWidth+4;
        let cr = 3;
        // if(self['type']==0){
        if(1){
          if (lay == 0) {
            _this.drawRect(svg, x-2, y - 20, evTWidth, 100, 6, 6, self['color'], 0.3, 'white', `timeAxisEntB_${indx}`,1.5, 'timeAxisEntB')
          }
          _this.drawRect(svg, x, y, evWidth, evHight, 3, 3, self['color'], 0.4, self['colorD'], `timeAxisEnt_${id}`,1.5, 'timeAxisEnt')
        }
        else{
          if (lay == 0) {
            _this.drawRect(svg, x-2, y - 20, evTWidth, 100, 6, 6, self['color'], 0.3, 'white', `timeAxisEntB_${id}`,1.5, 'timeAxisEnt')
          }
          let area = [[x+cr,y+evHight-cr],[x-cr+evWidth,y+evHight-cr],[x+evWidth/2,y]];
          _this.drawTriangle(svg, self['color'], area, self['color'],1,cr*2);
        }
        addData[indx]['timeX'] = x;
        addData[indx]['timeW'] = evWidth
      })
      _this.drawEntityLocation = addData;
      console.log(11111111111111, width, sumTotalDuration, data, _this.drawEntityLocation)
    },
    drawTriangle(svg, color, points, stroke, opacity = 1,strokeW=15) {
      svg.append("polygon")
        .attr("points", points)
        .attr("fill", color)
        .attr("stroke-linejoin", "round")
        .attr("opacity", opacity)
        .attr("stroke", stroke)
        .attr("stroke-width", strokeW);
    },
    drawpolygon(svg, color, areas, stroke, opacity = 1) {
      svg.append("polygon")
        .attr("points", areas)
        .attr("fill", color)
        .attr("opacity", opacity)
        .attr("stroke", stroke)
        .attr("stroke-width", "1.5px");
    },
    drawEntityTimeAxis(svg, entData) {

      const _this = this;
      let x = entData['x'];
      let r = entData['r'];
      let y = entData['y'] + r / 2;
      let daId = entData['id']
      let entDataO = _this.drawEntityLocation;
      let sumTotalDuration = _this.sumTotalDuration;
      let widthScale = d3.scaleLinear([0, sumTotalDuration], [0, Math.PI]);
      let timeStepR = 0;
      let timeStartR = -Math.PI / 2;
      let inter = 0;
      let sons = tools.deepClone(entData['son']);
      let relList = [];
      let relRootList = [];
      let psNum = 0.5;
      if ((sons.length > 0)) {
        inter = 16
      }

      let relData = _this.relData;
      let oData = _this.drawEntityLocation;
      let basicRel = relData['basicRel'];
      for (let re = 0; re < basicRel.length; re++) {

        let sorceId = basicRel[re][0];
        let targetId = basicRel[re][1];
        let cNode = '';
        if (sorceId == daId) {
          cNode = oData.find(function (d) { return d['id'] == targetId });
          relList.push(targetId);
          relRootList.push(cNode['rootIndex']);
        }

        if (targetId == daId) {
          cNode = oData.find(function (d) { return d['id'] == sorceId });
          relList.push(sorceId);
          relRootList.push(cNode['rootIndex']);
          console.log(sorceId, targetId, daId, cNode)
        }
      };
      console.log(relList, relRootList)
      // if(entData[]) 
      let wline = 0;
      let sumTotalDurationF = 0;
      entDataO.forEach((self, indx, arr) => {
        let totalDurationValue = self['totalDuration'];
        let timeList = self['time'];
        let layout = self['layout'];
        let rootIndex = self['rootIndex'];
        let duration = tools.time2seconds(timeList[1]) - tools.time2seconds(timeList[0]);
        timeStepR = widthScale(duration);
        if (!relRootList.includes(rootIndex)) {
          wline += timeStepR * psNum;
          sumTotalDurationF += duration;
        }
      })
      let widthScaleA = d3.scaleLinear([0, sumTotalDuration - sumTotalDurationF], [0, Math.PI - wline]);
      // if(rootEntityList.length==0){
      //   widthScaleA = widthScale
      // }
      // let wline = 0;
      entDataO.forEach((self, indx, arr) => {
        let totalDurationValue = self['totalDuration'];
        let timeList = self['time'];
        let layout = self['layout'];
        let rootIndex = self['rootIndex'];
        let cId = self['id'];
        let duration = tools.time2seconds(timeList[1]) - tools.time2seconds(timeList[0]);
        timeStepR = widthScale(duration);
        if (!relRootList.includes(rootIndex)) {
          if (relRootList.length != 0) {
            timeStepR = psNum * widthScale(duration);
          }
        }
        else {
          timeStepR = widthScaleA(duration)
        }
        let endAnglet = timeStartR + timeStepR;
        var dataset = { startAngle: timeStartR, endAngle: endAnglet }; //创建一个弧生成器
        timeStartR = endAnglet;
        let color = 'blue';
        let rh = r*0.7;
        let h = rh;
        let nh = 0;
        if (relRootList.length != 0) {
          h = rh*0.3 + rh*0.6 - 3 * layout;
          nh = rh*0.3;
        }
        if (!relRootList.includes(self['rootIndex'])) {
          h = rh*0.7;
          nh = h*0 + h*0.6;
        }
        else{
          dataset.startAngle+=0.003;
          dataset.endAngle-=0.003; 

        }
        var arcPath = d3.arc()
          .innerRadius(r + inter + nh)
          .outerRadius(r + inter + h);
        var pathArc = arcPath(dataset);
        console.log(self, relList, relList.includes(self['id']))
        let arc;
        if (relRootList.length != 0) {
          if (relRootList.includes(self['rootIndex'])) {
            if (relList.includes(parseInt(self['id']))) {
             arc= _this.drawArc(svg, x, y - r / 2, pathArc, self['color'], self['color'], `timeAxisFor f${entData['id']} ${self['id']}`, '0', 0, 1);
            }
            else {
              arc = _this.drawArc(svg, x, y - r / 2, pathArc, "white", self['color'], `timeAxisFor f${entData['id']} ${self['id']}`, '0', 0.0, 0.4);
            }
          }
          else{
             arc = _this.drawArc(svg, x, y - r / 2, pathArc, self['color'], self['color'], `timeAxisFor f${entData['id']} ${self['id']}`, '0', 0, 0.2);
        
          }
         arc.on("mouseover",function(d){
            let classN = d3.select(this).attr("fill",'red');
            let tId = classN.split(" ")[2];

          })
         }
      })
    },
    drawEntity(svg, x, y, r, data) {
      const _this = this;
      let color_linear = _this.importanceColor_linear;
      let compute_color = _this.importanceCompute_color;
      let rScale = _this.relevanceScale_linear;
      let oData = _this.data;
      let importanceValue = data['attribute']['importance'];
      let relevanceValue = data['attribute']['relevance'];
      // let r = rScale(relevanceValue)
      // { 'id': data[i]['id'], "x": x, "r": r, "layout": lay, "y": y, "sonFlag": sonFlag }


      if (data['type'] == '1') {
        let area = tools.calcTriangle(x, y, r);
        _this.drawTriangle(svg, "rgb(250, 199, 88)", area, "rgb(250, 199, 88)");

        _this.drawTxt(svg, x, y + 8, 20, ["T"], 'white', 28, "T")
      }
      else if (data['type'] == '2') {
        let area = tools.calcTriangle(x, y, r);
        _this.drawTriangle(svg, "rgb(250, 199, 88)", area, "rgb(250, 199, 88)");

        _this.drawTxt(svg, x, y + 8, 20, ["E"], 'white', 28, "E")
      }
      else {

        let cy = y;
        let totalDuration = _this.totalDuration;
        let timeLineScale_linear = d3.scaleLinear([0, totalDuration], [x - r * Math.sqrt(3) / 2, x + r * Math.sqrt(3) / 2])
        let timeLineHighScale_linear = d3.scaleLinear([0, _this.maxTotalDuration - 50], [r / 2, r * (1 + Math.sqrt(3) / 3 * 2)])
        let circleColor = compute_color(color_linear(importanceValue));
        _this.drawCircle(svg, x, cy, r, circleColor, data, 1, "entCircle", "entCircle_" + data['id']);

        r = r * Math.sqrt(3) / 2;
        y += r / 2;
        let path = d3.path();


        path.moveTo(x - r, y);
        let lineLi = [data];
        let linePoint = [{ 'id': data['id'], 'time': data['time'], 'x': 0, 'y': 0 }];
        let jgidL = [data['id']];
        let similarityRelsli = [data["similarityRel"]];
        while (similarityRelsli.length > 0) {
          let similarityRels = similarityRelsli[0];
          similarityRelsli.splice(0, 1);
          let jg = 0;
          for (let srel in similarityRels) {
            let cdata = oData.find(function (d) { return d['id'] == similarityRels[srel] });
            if (jgidL.indexOf(cdata['id']) == -1) {
              similarityRelsli.push(cdata["similarityRel"])
              jg = 1;
              lineLi.push(cdata)
              jgidL.push(cdata['id'])
              linePoint.push({ 'id': cdata['id'], 'time': cdata['time'], 'x': 0, 'y': 0 })
            }
          }
          // if(jg==0){
          // break;
          // }
        }

        const sortmt = (a, b) => {
          return tools.time2seconds(a[0]) - tools.time2seconds(b[0]);
        }
        const sortlp = (a, b) => {
          return tools.time2seconds(a['time'][0]) - tools.time2seconds(b['time'][0]);
        }

        lineLi = lineLi.sort(sortlp);
        linePoint = linePoint.sort(sortlp);
        let lineData = [[x - r * Math.sqrt(3) / 2 - 4, y]];
        for (let t = 0; t < lineLi.length; t++) {
          let startT = lineLi[t]['time'][0];
          let duration = lineLi[t]['totalDuration']
          // let endT = lineLi[t]['time'][1];
          let startS = tools.time2seconds(startT);
          let endS = startS + duration;
          // let startx = timeLineScale_linear((startS - duration * 10));
          // let endx = timeLineScale_linear((endS + duration * 10));
          let limst = (x - r * Math.sqrt(3) / 2);
          let limed = (x + r * Math.sqrt(3) / 2);
          let startx = (limst < timeLineScale_linear((startS))) ? (timeLineScale_linear((startS))) : (limst);
          let endx = (limed > timeLineScale_linear((endS))) ? (timeLineScale_linear((endS))) : (limed);
          // let midx = timeLineScale_linear((endS + startS) / 2);
          let midx = (startx + endx) / 2;
          let ys = y;
          let yz = y - timeLineHighScale_linear((duration));
          linePoint[t]['x'] = midx;
          linePoint[t]['y'] = y - timeLineHighScale_linear(duration) / 1.7;
          // if (startx < (lineData[lineData.length - 1][0])) {
          if (t > 0) {
            lineData.splice(lineData.length - 1, 1);
            midx += t * 5;
            startx = midx - ((midx - (lineData[lineData.length - 1][0] + midx) / 2)) / 2;
            endx += t * 5;
            ys = y + (y - lineData[lineData.length - 1][1]) / 3
          }
          // }
          lineData.push([startx, ys], [midx, yz], [endx, y])
          // let startx = timeLineScale_linear((startS - duration * 10));
          // let endx = timeLineScale_linear((endS + duration * 10));

          // let startyf = y + timeLineHighScale_linear((duration)) / 8;
          // let startyf1 = y + timeLineHighScale_linear((duration)) / 8;
          // let endyf = y + timeLineHighScale_linear((duration)) / 8;
          // let endyf1 = y + timeLineHighScale_linear((duration)) / 8;
          // let yz = y - timeLineHighScale_linear((duration));
          // let midx = timeLineScale_linear((endS + startS) / 2);
          // linePoint[t]['x'] = midx;
          // linePoint[t]['y'] = y - timeLineHighScale_linear(duration) / 1.7;
          // let y1 = y;
          // if (startx < (lineData[lineData.length - 1][0])) {
          //   if (t > 0) {
          //     lineData.splice(lineData.length - 3, 3);
          //     startx = (lineData[lineData.length - 1][0] + midx) / 2;
          //     y1 = lineData[lineData.length - 1][1] + timeLineHighScale_linear((duration)) / 2;
          //     startyf = lineData[lineData.length - 1][1] + timeLineHighScale_linear((duration)) / 2;
          //     startyf1 = lineData[lineData.length - 1][1] + timeLineHighScale_linear((duration)) / 2;
          //   }
          // }
          // let startx1 = startx + (timeLineScale_linear((startS + duration)) - timeLineScale_linear((startS)));
          // let endx1 = endx - (timeLineScale_linear((startS + duration)) - timeLineScale_linear((startS)));
          // let startx2 = startx1 + (timeLineScale_linear((startS + duration)) - timeLineScale_linear((startS)));
          // let endx2 = endx1 - (timeLineScale_linear((startS + duration)) - timeLineScale_linear((startS)));
          // if (endx > (r + x)) endx = r + x;
          // if (startx1 < (lineData[lineData.length - 1][0])) startx1 = lineData[lineData.length - 1][0];
          // if (endx1 > (r + x)) endx1 = r + x;
          // if (startx2 < (lineData[lineData.length - 1][0])) startx2 = lineData[lineData.length - 1][0];
          // if (endx2 > (r + x)) endx2 = r + x;
          // lineData.push([startx, y1], [startx1, startyf1], [startx2, startyf], [midx, yz], [endx2, endyf], [endx1, endyf1], [endx, y])
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
          .curve(d3.curveBundle)
        // .curve(d3.curveCatmullRom  )
        // .curve(d3.curveBasis)
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
        let sons = [sonList];
        while (sons.length > 0) {
          let curSonList = sons[0];
          sons.splice(0, 1);
          if (curSonList.length > 0) {
            for (let s in curSonList) {
              let sonData = oData.find(function (d) { return d['id'] == curSonList[s] });
              let sonTypeData = sonData['attribute']['expressions'];

              for (let t in sonTypeData) {
                let typeDurition = sonTypeData[t];
                for (let d in typeDurition) {
                  typeData[t].push(typeDurition[d])
                }
              }
              sons.push(sonData['son']);
            }
          }
        }
        var typeStartR = 0//Math.PI/4;

        var typeStepR = Math.PI / 1;

        if (sonList.length > 0) {
          let typeTotalDur = 0;
          for (let t in typeData) {
            let typeDurition = typeData[t];
            for (let d in typeDurition) {
              typeTotalDur += (tools.time2seconds(typeDurition[d][1]) - tools.time2seconds(typeDurition[d][0]))
            }
          }
          let typeArcScale_linear = d3.scaleLinear([0, typeTotalDur], [0, Math.PI * 2]);
          for (let i in typeData) {
            let color = typeColor[i];
            let typeDurition = typeData[i];
            let totalTypeSeconds = 0;
            for (let d in typeDurition) {
              totalTypeSeconds += (tools.time2seconds(typeDurition[d][1]) - tools.time2seconds(typeDurition[d][0]))
            }
            if (totalTypeSeconds > 0) {
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
          let timeSonLinear = d3.scaleLinear([0, sonTotal], [0, Math.PI - skipArc * (sonNum - 1)]);
          let timeSonHeighLinear = d3.scaleLinear([0, sonTotal], [40, 40]);

          let timeSonColor_linear = d3.scaleLinear().domain([0, sonTotal]).range([0, 1]);
          let timeSonCompute_color = d3.interpolate("white", circleColor);
          var sonStartR = Math.PI / 2;

          let relList = [];
          let relRootList = [];
          let psNum = 0.1;
          let daId = data['id']
          let relData = _this.relData;
          let odData = _this.data;
          let basicRel = relData['basicRel'];
          for (let re = 0; re < basicRel.length; re++) {

            let sorceId = basicRel[re][0];
            let targetId = basicRel[re][1];
            let cNode = '';
            if (sorceId == daId) {
              cNode = odData.find(function (d) { return parseInt(d['id']) == parseInt(targetId) });
              relList.push(targetId);
            }

            if (targetId == daId) {
              cNode = odData.find(function (d) { return parseInt(d['id']) == parseInt(sorceId) });
              relList.push(sorceId);
            }
          };
          if (relList.length == 0) {
            sonStartR = 0;
            timeSonLinear = d3.scaleLinear([0, sonTotal], [0, Math.PI * 2 - skipArc * (sonNum)]);
          }

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

              // console.log
              _this.drawTimeLine(_this.arcG, jiantouPath, "rgb(200,200,200)", 3, '9,5', 'midArc ', 'midArc ');
              // _this.drawTimeLine(_this.arcG, path, "white", 2,'0', 'sonLine ', 'sonLine ');
              // _this.drawArc(_this.arcG, x, y - r / 2, pathMidArc, "rgb(200,200,200)", "white", 'son f' + data['id'], "9,5", 3);
            }
          }

        };
      }
      let txts = data['name'].split(" ")
      let tx = x - r - 30;
      let ty = y + r + 60;
      let tw = r * 2;
      tx = x;
      if (data['son'].length == 0) {
        tx = x//-r-10;
        ty = y + r * 2;
      }
      if (data['id'] == "3") {
        tx = x - 10;
        ty = y + r * 2;
      }
      if (data['id'] == "4") {
        tx = x + 10;
        ty = y + r * 2;
      }
      // if(data['type']=='1'){
      //   tx = x-r/2;
      //   ty = y+r*2;
      // }

      _this.drawTxt(svg, tx, ty, tw, txts, "grey", 16, `text_${data['id']}`);
    },
    drawArc(svg, x, y, arcPath, stroke, fill, className, stroke_dasharray = "0", width = 3, opacity = 1) {
      let arc = svg.append("path")
        .attr("d", arcPath)
        .attr("class", className)
        .attr("transform", "translate(" + x + "," + y + ")")
        .attr("stroke", stroke)
        .attr('stroke-width', width)
        .attr("stroke-dasharray", stroke_dasharray)
        .attr("stroke-linejoin", "round")
        .attr("fill", fill)
        .attr("opacity", opacity);
        return arc;
    },
    drawCircle(svg, x, y, r, fill, data, opacity, className, idName) {
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
          let idN = d3.select(this).attr("id").split("_")[1]
          let showRel = _this.showEntityRelIdList
          if(!showRel.includes(parseInt(idN))){ 
            showRel.push(parseInt(idN))
            _this.showEntityRelIdOverState = 0;
          }
          else{
            _this.showEntityRelIdOverState = 1;
          }
          _this.showEntityRelIdList = showRel;
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
          
          let idN = d3.select(this).attr("id").split("_")[1]
          let showRel = _this.showEntityRelIdList
          if(_this.showEntityRelIdOverState == 1){ 
            showRel.push(parseInt(idN))
          }
          else{
            showRel.splice(showRel.indexOf(parseInt(idN)),1)
          }
          _this.showEntityRelIdList = showRel;

          if (classN == 'linePoint') {
            d3.select(this).attr("opacity", 0).attr("r", 5)
          }
          else {
            d3.selectAll(".f" + data['id'])
              .attr("transform", function (d) {
                let transformd = d3.select(this).attr("transform")
                return transformd.split(" ")[0] + " scale(1)"
              })
            d3.select("#graphPanel").selectAll("path")
              .attr("class", function (d) {
                let thisSelect = d3.select(this)
                let classN = thisSelect.attr("class");
                let classNList = classN.split(" ")
                if (classNList[classNList.length - 1] == "activeS") {
                  classN = "";
                  for (let i = 0; i < classNList.length - 1; i++) {
                    classN += " " + classNList[i];
                  }
                }
                return classN
              })
          }
        })
        .on("click", function (d) {

          let idN = d3.select(this).attr("id").split("_")[1]
          let showRel = _this.showEntityRelIdList;
          //  - _this.showEntityRelIdOverState;
          if(!showRel.includes(parseInt(idN))){ 
            showRel = [(parseInt(idN))]
            _this.showEntityRelIdOverState = 1;
          }
          else if(showRel.includes(parseInt(idN))){ 
            // showRel.filter(item=>{return item==parseInt(idN)})
            _this.showEntityRelIdOverState = 0;
            showRel.splice(showRel.indexOf(parseInt(idN)),1)
          }
          _this.showEntityRelIdList = showRel;

          d3.select(this).attr("r", r);
          d3.selectAll(".f" + data['id'])
            .attr("transform", function (d) {
              let transformd = d3.select(this).attr("transform")
              return transformd.split(" ")[0] + " scale(1)"
            })
          let thisId = this.id.split("_")[1];
          _this.curEntId = thisId;
          let thisData = oData.find(function (a) { return a['id'] == thisId })
          let thisTime = thisData['time'];
          _this.click_Ent(thisTime);
          // console.log(thisTime,thisId,thisData)
        })
        .on("contextmenu", function (d, i) {
          d.preventDefault();

          let thisId = this.id.split("_")[1];
          let thisShowEntityData = _this.showEntityList.find(function (d) { return d['id'] == thisId });
          let thisSons = thisShowEntityData['son'];
          if (thisSons.length != 0) {
            let sons = tools.deepClone(thisSons);
            let showJage = false;
            let i = 0
            while ((sons.length > 0)) {
              let s = sons[0];
              sons.splice(0, 1);
              let curson = _this.showEntityList.find(function (d) { return d['id'] == s + '' })
              if (i == 0) {
                i++;
                showJage = !curson['show']
              }
              // ['show'] = !_this.showEntityList.find(function (d) { return d['id'] == thisSons[s] })['show']
              curson['show'] = showJage;
              let curgson = curson['son'];
              if (!showJage) {
                for (let gs = 0; gs < curgson.length; gs++) {
                  sons.push(curgson[gs]);
                }
              }
            }
          }
          _this.updataGraph()
        });
      // .on("")
    },
    drawRect(svg, x, y, w, h, rx, ry, fill, opacity, stroke, id = 'rect',strokeW = 1.5,classN = 'rect') {
      d3.select(`#${id}`).remove()
      let rect = svg.append("rect")
        .attr("id", id)
        .attr("class",classN)
        .attr("x", x)
        .attr("y", y)
        .attr("rx", rx)
        .attr("ry", ry)
        .attr("height", h)
        .attr("width", w) //刚才设置的块的宽度
        .attr("fill", fill)
        .attr("opacity", opacity)
        .attr("stroke", stroke)
        .attr("stroke-width", `${strokeW}px`);
      return rect;
    },
    drawTxt(svg, x, y, width, txts, fill, fontsize = 12, idN) {
      let tx = x;
      let ty = y;
      let preWidth = 0;
      let preIdN = 0;
      let pretext = ''
      for (let t = 0; t < txts.length; t++) {
        pretext += " " + txts[t];
        let txt = svg.append("text")
          .attr("y", ty)
          .attr("x", tx)
          .attr("id", `${idN}_${t}`)
          .attr("fill", fill)
          .attr("font-size", fontsize)
          .style("text-anchor", "middle")
          .text(pretext)
        let textWidth = document.getElementById(`${idN}_${t}`).getBBox().width;
        if ((textWidth > width) || (t == txts.length - 1)) {
          pretext = '';
          tx = x;
          ty += 25;
        }
        else {
          txt.remove()
        }
        preWidth += textWidth;
      }
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
    transformGraphSvg(flag) {
      const _this = this;
      let groups = _this.groupsSvg;

      let scalePre = _this.graphSvgScale;

      let margin = _this.margin;
      if (flag == 'left') {
        _this.graphGTransformX += 10;
      }
      if (flag == 'right') {
        _this.graphGTransformX -= 10;
      }
      // groups.attr('transform', 'translate(' + (_this.graphGTransformX) + ',' + (margin.top) + ') scale(' + (scalePre) + ')')
    },
    updataAssistGraphPanel() {
      const _this = this;
      var content = this.groupsSvg.html();
      let height = document.getElementById("assistGraphPanel").clientHeight;
      let width = document.getElementById("assistGraphPanel").clientWidth;
      d3.select('#assistGraphPanel').select('svg').remove();
      let transX = _this.assistGTransformX;
      let transY = _this.assistGTransformY;
      var div = d3.select('#assistGraphPanel')
        .append('svg')
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${transX},${transY})`)
        .html(content);
    },
    moveGraphLeft(e) {
      const _this = this;
      _this.moveFlag == true;
      clearInterval(this.moveTimer)// 清除定时器
      this.moveTimer = setInterval(() => { _this.transformGraphSvg("left") }, 10)//_this.transformGraphSvg('left'), 100);
    },
    moveGraphRight(e) {
      const _this = this;
      // console.log("⚡🐲🫧❄️👁️",e)
      clearInterval(this.moveTimer)// 清除定时器
      _this.moveFlag == true;
      this.moveTimer = setInterval(() => { _this.transformGraphSvg("right") }, 10)//_this.transformGraphSvg('left'), 100);
    },
    leaveGraphMove() {
      // this.moveFlag == false;
      clearInterval(this.moveTimer)// 清除定时器
      // this.graphGTransformX = 0;
    },
    updataGraph() {
      var _this = this;
      let margin = _this.margin
      let width = _this.$refs.graphDiv.offsetWidth - margin.left - margin.right;
      let height = document.getElementById("graphPanel").clientHeight - margin.top - margin.bottom;
      let heightTimeAxis = document.getElementById("graphTimeAxisPanel").clientHeight - margin.top - margin.bottom;
      _this.width = width;
      _this.height = height;
      d3.select("#graphPanel").select("svg").remove()
      var svg = d3.select("#graphPanel").append("svg")
        .attr("width", width)
        .attr("height", height);
      _this.rootSvg = svg;
      d3.select("#graphTimeAxisPanel").select("svg").remove()
      var TimeAxisSvg = d3.select("#graphTimeAxisPanel").append("svg")
        .attr("width", width)
        .attr("height", height);
      _this.TimeAxisSvg = TimeAxisSvg;
      let data = _this.data;

      let maxDImportance = Math.max.apply(Math, data.map(function (d) { return d['attribute']['importance']; }))
      let minDImportance = Math.min.apply(Math, data.map(function (d) { return d['attribute']['importance']; }))
      let maxDRelevance = Math.max.apply(Math, data.map(function (d) { return d['attribute']['relevance']; }))
      let minDRelevance = Math.min.apply(Math, data.map(function (d) { return d['attribute']['relevance']; }))
      let maxDDuration = Math.max.apply(Math, data.map(function (d) { return tools.time2seconds(d['time'][1]) - tools.time2seconds(d['time'][0]); }))
      let maxTotalDuration = Math.max.apply(Math, data.map(function (d) { return d['totalDuration']; }))
      _this.drawEntityLocation = [];
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

      _this.drawMain(svg);
      // });
    },
    zoomInLayoutClk() {
      const _this = this;
      _this.layoutShow += 1;
      if (_this.layoutShow > 3) {
        _this.layoutShow = 3;
      }
      // _this.updataGraph();
    },
    zoomOutLayoutClk() {
      const _this = this;
      _this.layoutShow -= 1;
      if (_this.layoutShow < 0) {
        _this.layoutShow = 0;
      }
      // _this.updataGraph();

    },
    click_Ent(time) {
      this.$emit("timeDur", time);
    },
  },
  created() {
    var _this = this;
    let margin = _this.margin
    this.$nextTick(() => {
      _this.updataGraph();
      _this.updataAssistGraphPanel();
    });
  },
  mounted() {
    const _this = this;
    let width = _this.$refs.graphDiv.offsetWidth;
    let height = _this.height;
    let showEntityList = tools.deepClone(_this.data);
    for (let e in showEntityList) {
      showEntityList[e]['show'] = true;
    }
    _this.showEntityList = showEntityList;
    // let width = _this.width;
    this.$bus.$on('graphData', (val) => {
      _this.data = val;
      let showEntityList = tools.deepClone(_this.data);
      for (let e in showEntityList) {
        showEntityList[e]['show'] = true;
      }
      _this.showEntityList = showEntityList;
      _this.updataGraph();
    });

    // this.$refs.moveGraphLeft.addEventListener("mouseover", _this.moveGraphLeft); // 监听点击事件
    // this.$refs.moveGraphRight.addEventListener("mousemove", _this.moveGraphRight); // 监听点击事件
    // this.$refs.moveGraphLeft.addEventListener("mouseleave", _this.leaveGraphMove); // 监听点击事件
    // this.$refs.moveGraphRight.addEventListener("mouseleave", _this.leaveGraphMove); // 监听点击事件

  },
  beforeDestroy() {
    clearInterval(this.moveTimer);
  },
} 
</script>

<style>
@import './index.css';
</style>
