/*
var list = [{depDate: 1}, {depDate: 1},{depDate: 2}, {depDate:3}, {depDate:1}, {depDate: 1}, {depDate: 1}, {depDate: 2}, {depDate: 3}];

for (var i=0; i < list.length; i++) {
    console.log("deafult tr at "+ i);
    if (i < list.length-1) {
        while ((list[i].depDate == list[i + 1].depDate)) {
            console.log("<td><td><td><td> at :" + (i+1));
            i++;
            if (i == list.length - 1) {
                break;
            }
        }
    }
    console.log("add a tr class to i at: " + (i));

}
*/
/*
var fs = require('fs');
var data = JSON.parse(fs.readFileSync("test.json", "utf-8"));
var progress = data[0].progress;
var sum = 0, i = 0;
for (elem in progress) {
    sum += parseInt(progress[elem]);
    i++;
    console.log(progress[elem]);
    console.log("sum so far is:" + sum);
}
console.log("completion:" + ((sum/i)*100).toFixed(0) + "%");

var nameCheckBool = false;
var nametoCheck = "hwasowski@uncc.edu";
for (var i =0; i < data.length; i++) {
    if (data[i].email == nametoCheck) {
        nameCheckBool = true;
    }
}
if (!nameCheckBool) {
    console.log("name did not exist. adding to json");
    var data = JSON.parse(fs.readFileSync("test.json", "utf-8"));
    var insertObj = {"email": "hwasowski@uncc.edu", "createdOn": "today"};
    data.push(insertObj);
    fs.writeFileSync("test.json", JSON.stringify(data));
} else {
    console.log("user already exists");
}
*/

var fs = require('fs');
// fs.readdirSync('./assets/trainingVideos').forEach(file => {
//     console.log(file);
// });
/*
var trainingList = JSON.parse(fs.readFileSync("test.json", "utf-8"));
var userInfo;
//console.log(trainingList);
for (var i =0; i < trainingList.length; i++) {
  if (trainingList[i].email == 'bhuitt1@uncc.edu') {
      userInfo = trainingList[i];
      break;
  }
}
var videoList = JSON.parse(fs.readFileSync("videos.json", "utf-8"));
for (var i = 0; i < videoList.length; i++) {
    var checkBool = false;
    for (var j = 0; j < userInfo.videoProgress.length; j++) {
        if (videoList[i].videoID == userInfo.videoProgress[j].videoID) {
            console.log("match at:" + i);
            console.log("completion is: " + userInfo.videoProgress[j].percentageComplete);
            checkBool = true;
            break;
        }
    }
    if (checkBool) {
        console.log("there was a match at: " + i)
    } else {
        console.log("no match at: " + i + " let's add one");
    }
}
console.log(userInfo.videoProgress.length);
*/
/*
var trainingList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
var innerList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11];
var totalOccurence = 0;
for (var i = 0; i < trainingList.length; i++) {
    for ( var j=0; j < innerList.length; j++) {
        totalOccurence++;
        if (trainingList[i] == innerList[j]) {
            console.log('i is:' + trainingList[i]);
            console.log('j is: ' + innerList[j]);
            break;
        }
    }
}
console.log(totalOccurence);
*/
/* var checksum = require('checksum');
checksum.file(__dirname + '/assets/trainingVideos/mov_bbb.mp4', function(err, sum){
    console.log(sum);
})
checksum.file(__dirname + '/assets/trainingVideos/mov_bbb1.mp4', function(err, sum){
    console.log(sum);
})
fs.readdirSync(__dirname + '/assets/trainingVideos').forEach(file => {
    console.log(file);
}); */

var answer = Buffer.from('Oracle BI â APAC Region                                                                             ', 'utf-8');
console.log(answer.toString());