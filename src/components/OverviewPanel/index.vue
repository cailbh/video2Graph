<!-- eslint-disable no-unused-vars -->
<!-- eslint-disable no-unused-vars -->

<template>
  <div class="overviewPanel">
    <div class="panelHead">Overview</div>
    <div id="overviewPanelDiv" class="panelBody" ref="overviewPanelDiv">

      <div class="chartTooltip">
        <p>
          <br /><strong class="name"></strong>
        </p>
      </div>

    </div>
  </div>
</template>
  
<script>
import * as d3 from 'd3'
import { onMounted, ref } from 'vue';
import filenames from "@/utils/fileName";
import domtoimage from 'dom-to-image';
import TestJson from "@/assets/json/case1_fin.json";
import TestRelJson from "@/assets/json/case1_fin_rel.json";
import tools from "@/utils/tools.js";
import { color } from 'd3';

export default {
  props: ["videoTime"],
  data() {
    return {
      data: TestJson,
      relData: TestRelJson,
      fatherMap: {},
      treeData: [],
      nameTextIds: [],
      textG: '',
      colorMap: {},
      rootColorMap: {},
      overEntityId: "",
      margin: { top: 15, right: 5, bottom: 5, left: 5 },
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
    type(val) {
    },
    treeData(val) {
      this.drawoverView();
    },
    overEntityId(val) {
      const _this = this;

      if (val != '') {
        let textId = tools.deepClone(val);
        if (_this.nameTextIds.indexOf(textId) == -1) {
          while (textId != 'root') {
            _this.nameTextIds.push(textId);
            textId = _this.fatherMap[textId];
          }
        }
      }
      else {
        _this.nameTextIds = []
      }

    },
    nameTextIds(ids) {
      const _this = this;
      let data = _this.data;
      let tx = 50;
      let ty = 600;
      let colorMap = this.colorMap;
      _this.textPathG.select("g").remove();
      let g = _this.textPathG.append("g");
      d3.selectAll(`.curOverArc`).style("filter", "url()")
      for (let i = ids.length - 1; i >= 0; i--) {
      d3.selectAll(`.na_${ids[i]}`).style("filter", "url(#coolShadow)")
        let curd = data.find(function (d) { return d['id'] == ids[i]; });
        let name = curd['name'].split("_")[0];
        let nameS = name.split(" ")
        if(nameS.length>4){
          name = nameS.splice(0,4).join(" ")+" ..."

        }
        let w = name.length * 10;
        let h = 4;
        let rx = 5;
        let ry = 5;
        let color = colorMap[ids[i]];
        _this.drawRect(g, tx, ty + 5, w, h, rx, ry, color, 0.5, color)
        _this.drawTxt(g, tx, ty, name, "rgb(60,60,60)", 0, "start", 18);
        tx += name.length * 12;
        if (tx > 900) {
          tx = 10;
          ty += 30;
        }
      }
    },
    data(val) {
    }
  },
  methods: {
    click_Ent(time) {
      this.$emit("timeDur", time);
    },
    drawoverView() {
      const _this = this;
      const margin = _this.margin;
      let data = _this.treeData;
      let width = this.$refs.overviewPanelDiv.offsetWidth - margin.left - margin.right;
      let height = this.$refs.overviewPanelDiv.offsetHeight - margin.top - margin.bottom;

      // var tree = d3.tree()
      //   .size([width, height - 200]);
      d3.select("#overviewPanelDiv").select("svg").remove();
      var svg = d3.select("#overviewPanelDiv").append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("transform", "translate(5,-10)");
      let sunTreeG = svg.append('g')
        .attr("width", width)
        .attr("height", height);
      let riverG = svg.append('g')
        .attr("width", width + 20)
        .attr("height", height)
        .attr("transform", "translate(35,600)");
      let textG = svg.append('g')
        .attr("width", width)
        .attr("height", height);
      let textPathG = svg.append('g')
        .attr("width", width)
        .attr("height", height);
      let toolTipG = svg.append('g')
        .attr("width", width)
        .attr("height", height);

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

      _this.textG = textG;
      _this.textPathG = textPathG;

      let centerX = margin.left + (width / 2);
      let centerY = margin.top + (height / 2) - 50;
      const gCircle = svg.append("g");
      // .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      let curD = tools.deepClone(data);
      // console.log(data,curD)
      // curD['layout'] = '-1';

      let layout = -1;
      let totalDur = 0
      for (let c in data['children']) {
        if (data['children'][c]['name'] != 'Test') {
          totalDur += data['children'][c]['totalDuration'];
        }
      }
      _this.drawSunTree(sunTreeG, centerX, centerY, curD, layout, totalDur, 0, Math.PI * 2, 0, "", "root");
      // _this.drawTypeRiver(riverG);
    },
    drawTypeRiver(svg) {
      const _this = this;
      let oriData = _this.data;
      let resData = [];
      let triLi = [];
      let exeLi = [];

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
      let xStep = (svg.attr("width") - 80) / oriData.length;
      let yScale = d3.scaleLinear().domain([-1, 1]).range([0, 80]);
      var area = d3.area()
        .curve(d3.curveBasis)
        .x(function (d) {
          return d.data.od * xStep;
        })
        .y0(function (d) {
          return yRangeWidth - yScale(d[0]);
        })
        .y1(function (d) {
          return yRangeWidth - yScale(d[1]);
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
        .attr("id", function (d) { return d.key })
        .attr("class", "river")
        .attr("d", function (d) {
          return area(d)
        })
        .attr("fill", function (d, i) {
          return typeColor[d.key]
        })
        .on("mouseover", function (d) {
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
    drawTriangle(svg, color, points, stroke, opacity = 1) {
      svg.append("polygon")
        .attr("points", points)
        .attr("fill", color)
        .attr("stroke-linejoin", "round")
        .attr("opacity", opacity)
        .attr("stroke", stroke)
        .attr("stroke-width", "5px");
    },
    drawSunTree(svg, x, y, data, layout, totalDur, startAngle, endAngle, startHeight, curcolor, father) {
      const _this = this;
      var curStartR = tools.deepClone(startAngle);//Math.PI/4;
      let colorList = this.mcolor;
      let stepLayHight = 100;
      if (layout == '-1') {
        stepLayHight = 400;
      }
      if (layout == '0') {
        stepLayHight = 80;
      }
      if (layout == '1') {
        stepLayHight = 30;
      }
      if (layout == '2') {
        stepLayHight = 30;
      }
      let endHeight = startHeight + stepLayHight;
      // console.log(endHeight,layout,stepLayHight)
      let Color_linear = d3.scaleLinear().domain([0, totalDur]).range([0, 1]);
      let Compute_color = d3.interpolate("white", curcolor);
      let perDur = 0;
      let curArcScale_linear = d3.scaleLinear([0, totalDur], [startAngle, endAngle]);
      let curHeightScale_linear = d3.scaleLinear([0, Math.sqrt(totalDur)], [startHeight * 1.2, endHeight]);
      for (let c in data['children']) {
        _this.fatherMap[data['children'][c]['id']] = father;
        if ((data['children'][c]['name'] != 'Test') || (data['children'][c]['layout'] != '0')) {
          let curTotalDur = data['children'][c]['totalDuration'];
          let endAnglet = curArcScale_linear(perDur + curTotalDur);
          perDur += curTotalDur
          var dataset = { startAngle: curStartR + 0.05, endAngle: endAnglet - 0.05 };
          let h = ((curHeightScale_linear((Math.sqrt(curTotalDur)))))
          var arcPath = d3.arc()
            .innerRadius(startHeight + 20)
            .outerRadius(h)
          var pathArc = arcPath(dataset);
          let color = "";
          if (layout == -1) {
            color = _this.rootColorMap[data['children'][c]['id']];//colorList[c];
          }
          else { color = Compute_color(Color_linear(curTotalDur)) }
          _this.colorMap[data['children'][c]['id']] = color;
          _this.drawArc(svg, x, y, pathArc, color, color, `curOverArc fa_${father} na_${data['children'][c]['id']}`, '0', 10);
          _this.drawSunTree(svg, x, y, data['children'][c], layout + 1, curTotalDur, dataset.startAngle, dataset.endAngle, curHeightScale_linear(Math.sqrt(curTotalDur)), color, data['children'][c]['id']);

          if ((parseInt(layout) < 1)) {
            let name = data['children'][c]['name'];

            let names = name.split(" ")
            let nameLen = names.length;
            let anchor = "end"
            let stepR = (endAnglet - curStartR) / (nameLen + 1);
            let colorV = tools.getRgbValue(color)
            let textColor = 'white';
            let textStartR = curStartR;
            let v = 0;
            for (let i in colorV) {
              v += parseInt(colorV[i]);
            }
            if (v > 620) {
              textColor = 'grey';
            }
            if ((parseInt(layout) == -1) && ((endAnglet - curStartR) > (Math.PI / 5))) {
              if ((endAnglet - curStartR) > (Math.PI / 4)) {
                stepR = Math.PI / 20;
                textStartR = (endAnglet + curStartR) / 2 - (nameLen) / 2 * stepR;
              }
              for (let n = 0; n < nameLen; n++) {
                let nn = n;
                let arcScale = d3.scaleLinear().domain([0, Math.PI * 2]).range([0, 360]);
                if (arcScale(curStartR) > 180) {
                  nn = nameLen - n - 1;
                }
                let midR = textStartR + stepR * (nn + 1);

                let roat = arcScale(midR);
                roat -= 90;
                if (roat > 90) {
                  roat += 180;
                  anchor = "start"
                }
                // h = (h + startHeight) / 2 + 10;
                let tx = x + h * Math.sin(midR);
                let ty = y - h * Math.cos(midR);
                _this.drawTxt(_this.textG, tx, ty, names[n], textColor, roat, anchor)

              }
            }

            else if ((parseInt(layout) == 0) && ((endAnglet - curStartR) > (Math.PI / 15)) && (nameLen < 4) && (name.length < 10)) {
              let steph = (h - startHeight - 20) / nameLen;
              anchor = "middle"
              for (let n = 0; n < nameLen; n++) {
                let nn = n;
                let arcScale = d3.scaleLinear().domain([0, Math.PI * 2]).range([0, 360]);
                // if(arcScale(curStartR)>180){
                //   nn = nameLen - n-1;
                // }
                let midR = (endAnglet + curStartR) / 2;

                let roat = arcScale(midR);
                // roat -= 90;
                // if(roat>90){
                //   roat+=180;
                //   anchor = "start"
                // }
                h = h - 10 - 1 * n;//(h + startHeight) / 2 + 10;
                let tx = x + h * Math.sin(midR);
                let ty = y - h * Math.cos(midR);
                _this.drawTxt(_this.textG, tx, ty, names[n], textColor, roat, anchor)

              }
            }
            else if (parseInt(layout) == 1) {
              let midR = (endAnglet + curStartR) / 2;

              let arcScale = d3.scaleLinear().domain([0, Math.PI * 2]).range([0, 360]);
              let roat = arcScale(midR)
              if (layout == '-1') {
                roat += 90;
              }
              h = (h + startHeight) / 2 + 10;
              let tx = x + h * Math.sin(midR);
              let ty = y - h * Math.cos(midR);
              // if (layout != '-1') {
              //   for(let w = 0;w<names.length;w++){
              //     h-=(w+1)*1;
              //     tx = x + h * Math.sin(midR);
              //     ty = y - h * Math.cos(midR);
              //     _this.drawTxt(_this.textG, tx,ty , names[w], textColor, roat,"middle")

              //     }
              // }
              // else{
              _this.drawTxt(_this.textG, tx, ty, data['children'][c]['name'], textColor, roat, "middle")
              // }
            }
          }

          curStartR = endAnglet;
        }
      }
    },
    drawRect(svg, x, y, w, h, rx, ry, fill, opacity, stroke) {
      svg.append("rect")
        .attr("x", x)
        .attr("y", y)
        .attr("rx", rx)
        .attr("ry", ry)
        .attr("height", h)
        .attr("width", w)
        .attr("fill", fill)
        .attr("opacity", opacity)
        .attr("stroke", stroke)
        .attr("stroke-width", "1.5px");
    },
    drawTxt(svg, tx, ty, txts, fill, roat, anchor, fontsize = 14) {
      svg.append("text")
        .attr("y", ty)
        .attr("x", tx)
        .attr("fill", fill)
        .attr("font-size", fontsize)
        .text(txts)
        .style("text-anchor", anchor)//"middle")
        .attr("transform", `rotate(${roat} ${tx} ${ty})`);
    },
    drawArc(svg, x, y, arcPath, stroke, fill, className, stroke_dasharray = "0", width = 3) {
      const _this = this;
      svg.append("path")
        .attr("d", arcPath)
        .attr("class", className)
        .attr("transform", "translate(" + x + "," + y + ")")
        .attr("stroke", stroke)
        .attr('stroke-width', width)
        .attr("opacity", 1)
        .attr("stroke-dasharray", stroke_dasharray)
        .attr("stroke-linejoin", "round")
        .attr("fill", fill)
        .on("mousemove", function (d) {
          let transformd = d3.select(this).attr("transform")
          let id = d3.select(this).attr("class").split(" ")[d3.select(this).attr("class").split(" ").length - 1];
          id = id.split("_")[1]
          let curEnt = _this.data.find(function (d) { return d['id'] == id })


          d3.select(this)
            .attr("transform", function (d) {
              return transformd.split(" ")[0] + " scale(1.04)"
            })
          // var transform = d3.event;
          var yPosition = d.clientY + 20;
          var xPosition = d.clientX + 20;
          var chartTooltip = d3
            .select(".chartTooltip")
            .style("left", xPosition + "px")
            .style("top", yPosition + "px");
          // 更新浮层内容
          chartTooltip.select(".name").text(curEnt['name']);
          // 移除浮层hidden样式，展示浮层
          chartTooltip.classed("hidden", false);
          let textId = tools.deepClone(id);
          if (_this.nameTextIds.indexOf(textId) == -1) {
            while (textId != 'root') {
              _this.nameTextIds.push(textId);
              textId = _this.fatherMap[textId];
            }
          }
        })
        .on("mouseleave", function (d) {
          _this.nameTextIds = [];
          let transformd = d3.select(this).attr("transform")
          d3.select(this)
            .attr("transform", function (d) {
              return transformd.split(" ")[0] + " scale(1)"
            })
          d3.select(".chartTooltip").classed("hidden", true);
        })
    },
  },
  created() {



    const _this = this;

    this.$nextTick(() => {
      _this.drawoverView();
    });
  },
  mounted() {
    const _this = this

    this.$bus.$on('graphData', (val) => {
      // console.log(val)
      _this.data = val;
    });
    this.$bus.$on('overEntityId', (val) => {
      _this.overEntityId = val;
    });
    this.$bus.$on('treeData', (val) => {
      console.log(val)
      _this.treeData = val[0];
      _this.rootColorMap = val[1];
      // _this.drawoverView();
    });


  },
  // beforeDestroy() {
  //   clearInterval(this.moveTimer);
  // },
} 
</script>

<style>
@import './index.css';
</style>
