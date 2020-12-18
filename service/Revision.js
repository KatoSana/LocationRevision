'use strict';

const _ = require('underscore');
const TrackerRepository = require('../Tracker/TrackerRepository');
const DetectionDataRepository = require('../DetectionData/DetectionDataRepository');
const LocationRepository = require('../Location/LocationRepository');
const FixMapLocationRepository = require('../FixMapLocation/FixMapLocationRepository');
const MapRepository = require('../Map/MapRepository');

module.exports = class Revision {
  //つぐみ中央判定
  static async judgeInUnit(sortedDetectionData, searchTime, where){
    return new Promise((resolve) =>  {
        const detectionData = sortedDetectionData.filter((detectionData) => {
            const startOK = (detectionData.detectedTime >= searchTime - 1000);
            const endOK = (detectionData.detectedTime <= searchTime);
            return startOK && endOK;
        });
        let flag = 0;
        let ans = false;
        const detectionDataGroupByDetectorNum = _.groupBy(detectionData, "detectorNum");
        if(where === "room"){
            for (const detectorNum in detectionDataGroupByDetectorNum) {
                if(detectorNum === "19" || detectorNum === "20" || detectorNum === "21" || detectorNum === "22"){
                    const detectionDataFind = detectionDataGroupByDetectorNum[detectorNum];
                    if(detectionDataFind.length > 2){
                        flag += 1;
                    }else{
                        flag -= 1;
                    }
                }
            }
        }else if(where === "toilet"){
            for (const detectorNum in detectionDataGroupByDetectorNum) {
                if(detectorNum === "18" || detectorNum === "19" || detectorNum === "22"){
                    const detectionDataFind = detectionDataGroupByDetectorNum[detectorNum];
                    if(detectionDataFind.length > 2){
                        flag += 1;
                    }else{
                        flag -= 1;
                    }
                }else if(detectorNum === "2" || detectorNum === "3"){
                    const detectionDataFind = detectionDataGroupByDetectorNum[detectorNum];
                    if(detectionDataFind.length){
                        flag -= 1;
                    }
                }
            }
        }
        if(flag <= 0){
            ans = true;
        }
        return resolve(ans);    
    })
  }

  //つぐみ廊下前判定
  static async judgeInCorridor(sortedDetectionData, searchTime, where){
    const detectionData = sortedDetectionData.filter((detectionData) => {
        const startOK = (detectionData.detectedTime >= searchTime - 1000);
        const endOK = (detectionData.detectedTime <= searchTime);
          return startOK && endOK;
    });
    let flag = 0;
    let ans = false;
    const detectionDataGroupByDetectorNum = _.groupBy(detectionData, "detectorNum");
    if(where === "toilet"){
      for (const detectorNum in detectionDataGroupByDetectorNum) {
        if(detectorNum === "21"){
          const detectionDataFind = detectionDataGroupByDetectorNum[detectorNum];
          if(detectionDataFind.length){
            flag -= 1;
          }
        }else if(detectorNum === "2" || detectorNum === "3"){
          const detectionDataFind = detectionDataGroupByDetectorNum[detectorNum];
          if(detectionDataFind.length > 4){
            flag += 1;
          }
        }
      }
    }
    if(flag <= 0){
      ans = true;
    }
    return ans;    
  }

  static async revisionFile(start) {
    const startTime = start;
    const endTime = start+ 86400000; //1日分
    const searchTimeQuery = {
      start: startTime,
      end: endTime
    }
    const allTrackers = await TrackerRepository.getAllTracker();
    const allMap = await MapRepository.getAllMap();
    for (let tracker of allTrackers) {
      const locations = await LocationRepository.getLocationByTime(
        tracker.beaconID,
        searchTimeQuery
      );
      if (locations.length == 0) {
        continue;
      }
      const detectionDatas = await DetectionDataRepository.getDetectionData(
        tracker.beaconID,
        searchTimeQuery
      );
      let pushFixMapLocation = [];
      for(let location of locations){
        const map = allMap.find(map => {
          return map.mapID === location.map;
        });
        let mapName = map.name;
        if(mapName == "つぐみ部屋６"){
          mapName = "つぐみ廊下";
        }else if(mapName == "つぐみ部屋７"){
          mapName = "つぐみ廊下";
        }else if(mapName == "つぐみ部屋１０"){
          mapName = "つぐみ廊下";
        }
        if(mapName == "つぐみ中央"){//つぐみ中央補正
          if(location.grid.x <155 && location.grid.y > 500){
            const ans = await this.judgeInUnit(detectionDatas, location.locatedTime, "room"); //room判定
            if(ans){
              mapName = "つぐみ部屋４";
            }
          }else if(location.grid.x > 275){
            const ans = await this.judgeInUnit(detectionDatas, location.locatedTime, "toilet"); //toilet判定
            if(ans){
              mapName = "つぐみトイレ";
            }
          }else if(location.grid.x > 240 && location.grid.y > 530){
            const ans = await this.judgeInUnit(detectionDatas, location.locatedTime, "toilet"); //toilet判定
              if(ans){
                mapName = "つぐみトイレ";
              }
          }
        }else if(mapName == "つぐみ廊下"){//つぐみ廊下補正
          if(location.grid.y > 450){
            const ans = await this.judgeInUnit(detectionDatas, location.locatedTime, "room"); //room判定
            if(ans){
              mapName = "つぐみ部屋４";
            }
          }
        }else if(mapName == "つぐみ前廊下"){//つぐみ前廊下補正
          if(location.grid.y > 500 && location.grid.y < 620){
            const ans = await this.judgeInCorridor(detectionDatas, location.locatedTime, "toilet"); //toilet判定
            if(ans){
              mapName = "つぐみトイレ";
            }
          }
        }else if(mapName == "中央廊下"){
          if(location.grid.x >= 650 && location.grid.x <= 738){
            mapName = "北ホール";
          }
        }else if(mapName == "利用者玄関前廊下"){
          if(location.grid.y > 500 && location.grid.y < 600){
            mapName = "浴場";
          }
        }
        const fixmap = allMap.find(map => {
          return map.name === mapName;
        });
        location.map = fixmap.mapID;
        pushFixMapLocation.push(location);
      }
      FixMapLocationRepository.addFixMapLocation(pushFixMapLocation);
    }
    console.log("completed");
  }
};
