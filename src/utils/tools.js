// function  deepClone(obj) {
//     let result = typeof  obj.splice === "function" ? [] : {};
//     if (obj && typeof obj === 'object') {
//         for (let key in obj) {
//             if (obj[key] && typeof obj[key] === 'object') {
//                 result[key] = deepClone(obj[key]);//如果对象的属性值为object的时候，递归调用deepClone,即在吧某个值对象复制一份到新的对象的对应值中。
//             } else {
//                 result[key] = obj[key];//如果对象的属性值不为object的时候，直接复制参数对象的每一个键值到新的对象对应的键值对中。
//             }


import {createWorker, createScheduler,RecognizeResult,PSM,OEM} from "./tesseract.min.js";
 
//         }
//         return result;
//     }
//     return obj;
// }

function calcTriangle(x, y, r) {
  let areas = [[x - r * (Math.sqrt(3)) / 2, y + r / 2], [x + r * (Math.sqrt(3)) / 2, y + r / 2], [x, y - r]];
  return areas;
}
function time2seconds(time) {
  let lst = time.split(":");
  let h = lst[0];
  let m = lst[1];
  let s = lst[2];
  return parseInt(h) * 3600 + parseInt(m) * 60 + parseInt(s);
}
function time2seconds2(time) {
  console.log(time)
  let lst = time.split(".");
  let m = lst[0];
  let s = lst[1];
  return parseInt(m) * 60 + parseInt(s);
}
function seconds2time(seconds) {
  let m = Math.floor(seconds / 60);
  let s = seconds % 60;
  let h = Math.floor(m / 60);
  if (m < 10) m = '0' + m;
  if (h < 10) h = '0' + h;
  if (s < 10) s = '0' + s;
  return h + ":" + m + ":" + s;
}

function deepClone(obj) {
    var objClone = JSON.parse(JSON.stringify(obj));
    return objClone;
  }
function getRgbValue(str){
    let reg = /^(rgb|RGB)/;
    if(!reg.test(str)){return;}
    var arr = str.slice(4, str.length-1).split(",")
    return arr;
}
function createWorkers(){
  let worker= createWorker({
    // langPath:"@/assets/data"
    workerPath: '/uti/worker.min.js',
    // corePath: './tesseract-core.wasm.js',
    // langPath: 'D:/Cailibuhong/video2Graph/video2Graph/src/utils/tesseract'
  });
  return worker;
}

export default {
   deepClone:(obj)=>{return deepClone(obj);},
   time2seconds:(time)=>{
    return time2seconds(time);
   },
   time2seconds2:(time)=>{
    return time2seconds2(time);
   },
   seconds2time:(seconds)=>{
    return seconds2time(seconds);
   },
   calcTriangle:(x, y, r)=>{
    return calcTriangle(x, y, r);
   },
   getRgbValue:(str)=>{
    return getRgbValue(str);
   },
   createWorkers:()=>{
    return createWorkers();
   }
}