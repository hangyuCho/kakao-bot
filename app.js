const cluster  = require('cluster')
const axios    = require('axios')
const cheerio  = require('cheerio')
const mongoose = require('mongoose')
const iconv    = require('iconv-lite')
const stringTable    = require('iconv-lite')
const log      = console.log

const port     = 3000

var kakaoModel = require('./models/kakao');
var noticeModel = require('./models/notice');
require('dotenv').config();
const env = process.env
console.log(env.DB_URL)
console.log(env.AUTH)

const Connect = async () => {
    try {
        let client = await mongoose.connect( process.env.DB_URL, {
            poolSize: 10,
            authSource: process.env.AUTH,
            user: process.env.USER_ID,
            pass: process.env.PASS_WD, 
            useCreateIndex: true,
            useNewUrlParser: true,
            useUnifiedTopology: true
        } );
        log( "Database is connected!" );
    } catch ( error ) {
        log( error.stack );
        process.exit( 1 );
    }
}
Connect();

var express = require('express')
const { request } = require('http')
var app = express()

app.listen(port, () => log(`Express server has started on port : ${port}`))

app.get('/', (req, res) => { 
    res.send(`
        hello world! im worker [ no worker! ]<br>
        => my server is [ no master! ]
    `)
})

app.get('/kakao', (req, res) => {
    log('hoge!!!')
    var kakao            = new kakaoModel();

    kakao.room           = req.query.room         || "1"
    kakao.msg            = req.query.msg          || "2"
    kakao.sender         = req.query.sender       || "3"
    kakao.published_date = new Date() 

    kakao.save((err) => {
        if (err) {
            console.error(err)
            res.json({result: 0})
        } else {
            log(`${this.sender} massage saved to kakao_log collection.`)
            res.json({result: 1})
        }
    })
})

app.get('/bot', (req, res) => {

    log("접속완료!")
    const targetRoom = "IT,웹,자바 국비지원학원 정보교류방^^"
    const debugRoom  = "조한규"
    var kakao            = new kakaoModel();
    var keyword          = ""
    var msgArr           = ""
    kakao.room           = req.query.room         || "1"
    kakao.msg            = req.query.msg          || "2"
    kakao.sender         = req.query.sender       || "3"
    kakao.published_date = new Date() 

    msgArr  = kakao.msg.replace(/\n/gm, "<br>")
    msgArr  = msgArr.split(" ")
    keyword = msgArr.reverse().pop()
    params  = msgArr.reverse()

   if (kakao.room == targetRoom || kakao.room == debugRoom) {
      if (kakao.msg == "@공지") {
          var bean            = new noticeModel();
          noticeModel.find(function(err, data){
            try {
                let lastData = data.pop()
                res.send(lastData.msg)
            } catch (err) {
                res.send("공지 취득 실패~ㅎㅎ")
            }
          })
          return
      } else if (keyword == "@공지등록") {
        var bean            = new noticeModel();
        bean.room           = req.query.room         || "1"
        bean.msg            = params.join(" ")       || "2"
        bean.sender         = req.query.sender       || "3"
        bean.published_date = new Date() 
        bean.save((err) => {
            if (err) {
                console.error(err)
                res.send("저장 실패ㅜㅜ")
            } else {
                res.send("저장 성공 냥냥~")
            }
        })
        return
      } else if (keyword == "@댕댕쿤!!") {
          res.send("부르셨습니따 왈왈멍멍!")
          return
      } else if (keyword == "@뉴스") {
        var url   = 'https://news.naver.com/main/ranking/popularLike.nhn?subType=20'
        var NAVER = "https://news.naver.com"
        var str   = ""
        var data  = ""
        try {
            axios.get(url, {method: "GET", responseType: "arraybuffer" }).then((data) => {

                data = data.data
                data = iconv.decode(data, "EUC-KR").toString()
                const $ = cheerio.load(data, {decodeEntities: false});
                const $bodyList = $("div.likeitnews_item_text")
                $bodyList.each(function(i) {
                str += `${i + 1}. 
${$(this).find('a.likeitnews_item_title').html()}
<br>
${$(this).find('div.likeitnews_item_lede').html()}
<br>
${NAVER + $(this).find('a.likeitnews_item_title').attr("href")}
<br>
<br>
            `
                })
                res.send(str)
            })
        } catch (err) {
            console.log(err)
        }
        return 
      } else if (keyword == "@일자리") {
        var url = "http://job.incruit.com/jobdb_list/searchjob.asp?ct=12&ty=1&cd=1&occ2=574&jobty=1,2&page=1&apply=m#applytopcomp"
        var str   = ""
        var data  = ""
        try {
            axios.get(url, {method: "GET", responseType: "arraybuffer" }).then((data) => {

                data = data.data
                data = iconv.decode(data, "EUC-KR").toString()
                const $ = cheerio.load(data, {decodeEntities: false});
                const $bodyList = $("div.n_job_list_table_a.list_full_default tr")
                $bodyList.each(function(i) {
                    let company = $(this).find('.companys.check_companys > .check_list_r > .links > a') || $("")
                    let title   = $(this).find('div.subjects > span.accent > a.links') || $("")
                    let target  = $(this).find('div.subjects > p.details_txts > em').eq(1)   || $("")
            
                    company     = (company.html() || "").trim()
                    link        = (title.attr("href") || "").trim()
                    title       = (title.html()   || "").trim()
                    target      = (target.html()  || "").trim().replace("\<span>", "").replace("\</span>", "")
                    if (company == "") return
                str += `
${i}. ${company}
<br>
${title}
<br>
${target}
<br>
${link}
<br>
<br>
            `
                })
                res.send("<br>** 바로지원 쌉가능 ~ 지원공고 입니다 냥냥 **<br>" + str)
            })
        } catch (err) {
            console.log(err)
        }
        return 
      } else if (keyword == "@날씨") {
        execAxios(forTodayInfo)
          .then((todayinfo) => { 
            result = todayinfo
            execAxios(forNextWeekInfo).then((weekInfo) => {
                res.send(todayinfo + weekInfo)
            })
        })
        return 
      } else if (keyword == "@명령어") {
          let notice = `
          명령어는 다음과 같습니다.<br>
          @공지<br>
          @공지등록<br>
          -- 공지등록 예제<br>
          *******************<br>
          @공지등록 공지!<br>
          어서와요 국비는 처음이죠?ㅎㅎ <br>
          *******************<br>
          @댕댕쿤!!<br>
          `
        res.send(notice)
        return
      } else {
      }
    } else {}
   res.send("")
})
async function execAxios(obj) {
    obj.url      = obj.url      || ""
    obj.subUrl   = obj.subUrl   || ""
    obj.callback = obj.callback || function(){}
    var url      = obj.url
    var subUrl   = obj.subUrl
    var data     = ""
    try {
        data     = await axios.get(url)
        data     = data.data
    } catch (err) {
        console.log(err)
    }
    return obj.callback(data)
}
// 날씨에 대해서
var forTodayInfo = {
    url     : "https://weather.naver.com/rgn/cityWetrMain.nhn",
    subUrl  : "",
    callback: function(data){
        //console.log(data)
        const $       = cheerio.load(data, {decodeEntities: false});
        var str       = ""
        var $bodyList = $(".tbl_weather.tbl_today tr")
        $bodyList     = $bodyList.eq(1)
        $bodyList     = $bodyList.find("td")
        $bodyList.each(function(i){
            let nalsee = $(this).find("ul.text li.nm")
            let temp   = $(this).find("ul.text li span.temp")
            let rain   = $(this).find("ul.text li span.rain")

            nalsee     = nalsee.html()

            temp       = temp.html()
            temp       = temp.replace("\<strong>", "")
            temp       = temp.replace("\</strong>", "")

            rain       = rain.html().replace("\<strong>", "")
            rain       = rain.replace("\</strong>", "")
            if(i == 0) {
                status = "오전"
            } else {
                status = "오후"
            }
            
            str += `
${status} : ${nalsee} 온도[${temp}] 강수[${rain}]<br>
    `
    })
    return "<br>오늘의 날씨 정보~<br>" + str + "<br>"
    }
}

// 날씨에 대해서
var forNextWeekInfo = {
    url     : "https://weather.naver.com/period/weeklyFcast.nhn",
    subUrl  : "",
    callback: function(data){
        // console.log(data)
        const $       = cheerio.load(data, {decodeEntities: false});
        var str       = ""
        var $bodyList = $(".tbl_type5.tbl_wk thead th[colspan]")
        var weatherDetailList = $(".tbl_wk tbody tr").eq(1).find("td img")
        $bodyList.each(function(i){
            var temp = ""
            //let nalsee = $(this).find("ul.text li.nm")
            //let temp   = $(this).find("ul.text li span.temp")
            //let rain   = $(this).find("ul.text li span.rain")
            var self = this
            
            $([1,2]).each(function(){
                if (this == 1) {
                    temp += `
${$(self).html().trim() + " 오전 " + weatherDetailList.eq((i) * 2).attr("title")}
`
                } else {
                    temp += `
${$(self).html().trim() + " 오후 " + weatherDetailList.eq(i * 2 + 1).attr("title")}
`
                }
                temp += "<br>"
            })
            str += temp
        })
        return "주간 날씨<br> 정보는 여기! 냥냥~<br>" + str
    }
}

