var express = require('express');
const models = require('../models');
const moment = require('moment');
var db = require('../models/index');
const Sequelize = require('sequelize'),
    Op = require('sequelize').Op;
var router = express.Router();



// 게시글 목록
router.get('/notice', async (req, res) => {
    
    var startNum = req.query.startNum;
    var endNum = req.query.endNum;
    var keywordType = req.query.keywordType;
    var keyword = req.query.keyword;
    var sDate = req.query.sDate;
    var eDate = req.query.eDate;
    let order = (req.query.order !== undefined?req.query.order:0);
    var order_category = req.query.order_category;

    startNum = startNum ? startNum : 0
    endNum = endNum ? endNum : 20

    keywordType = keywordType ? keywordType : 0
    keyword = keyword ? keyword : ''

    startNum = Number(startNum);
    endNum = Number(endNum);
    order = Number(order)

  

    if (keywordType == 1) {
        keyword = '%' + keyword + '%';
    }
    if (!sDate) {
        sDate = moment().subtract(30, 'days').format('YYYY-MM-DD');
    }
    if (!eDate) {
        eDate = moment().format('YYYY-MM-DD');
    }

    let sqlCnt = '';

    sqlCnt += "SELECT count(*) AS totalCnt "
    sqlCnt += "FROM posts "
    sqlCnt += "WHERE 1=1 "
    sqlCnt += "AND DATE_FORMAT(createdAt , '%Y-%m-%d') BETWEEN :sDate AND :eDate "
    if(keywordType == 1){
        sqlCnt += "AND writer LIKE :keyword "
    }else if(keywordType == 2){
        sqlCnt += "AND title = :keyword "
    }

    var totalCnt = await db.sequelize.query(sqlCnt,
            {replacements: {keyword: keyword, sDate: sDate, eDate: eDate}, type: Sequelize.QueryTypes.SELECT}
    );


    let sqlList = '';

    sqlList += "SELECT po.title , "
    sqlList += "po.id, "
    sqlList += "po.writer , "
    sqlList += "DATE_FORMAT(createdAt, '%Y-%m-%d %H:%i:%s') as createdAt "
    sqlList += "from posts as po "
    sqlList += "WHERE 1 = 1 "
    sqlList += "AND DATE_FORMAT(createdAt , '%Y-%m-%d') BETWEEN :sDate AND :eDate "
    if(keywordType == 1){
        sqlList += "AND writer LIKE :keyword "
    } 
    if(keywordType == 2){
        sqlList += "AND title = :keyword "
    }
    if(order == 0){
        sqlList += "ORDER BY createdAt DESC "
    } 
    if(order == 1){
        sqlList += "ORDER BY createdAt ASC "
    }
    sqlList += "LIMIT :startNum, :endNum "

    var BoardLIst = await db.sequelize.query(sqlList,
        {replacements: {keyword: keyword, sDate: sDate, eDate: eDate, startNum:startNum, endNum:endNum}, type: Sequelize.QueryTypes.SELECT}
    );

    if(order == 0) order = 1;
    else order = 0;
        // switch(order_category){
        //     case 'user'      : orderUser(order,sqlList)
        //     case 'createdAt' : orderCreatedAt(order.sqlList);
        //     case 'title'     : orderTitle(order,sqlList);
        // }
    keyword = keyword.replace(/%/g, "");
    var searchParams = {
        startNum: startNum,
        endNum: endNum,
        keywordType: keywordType,
        keyword: keyword,
        sDate: sDate,
        eDate: eDate,
        order: order,
    };

    res.render('show', {totalCnt: totalCnt ,BoardLIst : BoardLIst ,  searchParams: searchParams});

});

//데이터 포스트로 보내기
router.post('/notice', async (req, res) => {
    try{
        let body = req.body;
        const result = await models.post.create({
            title: body.inputTitle,
            writer: body.inputWriter,
        });
        if(result) console.log('데이터 추가 완료')
        res.redirect('/board/notice')
    }catch(e){
        console.error('데이터 추가 실패' , e);
    }
});



//edit 불러오기 
router.get('/notice/edit/:id', async (req, res) => {
    try{
        let postID = req.params.id;
        const result = await models.post.findOne({
            where: {id: postID}
        })
        if(result) console.log('데이터 조회 성공');
        res.render("edit" , {
            post: result,
        });
    }catch(e){
        console.error('데이터 조회 실패' , e)
    }
  });



//edit post 데이터 보내기 
router.put('/:id', async (req, res) => {
    try{
        let postID = req.params.id;
        let body = req.body;
        const result = await models.post.update({
            title: body.editTitle,
            writer: body.editWriter
        }, {
            where: {id: postID}
        });
        if(result) console.log('데이터 조회 성공');
        res.redirect("/board/notice");
    }catch(e){
        console.error('데이터 수정실패' , e)
    }
});


//delete post 삭제하기 
router.delete('/notice/:id', async (req, res) => {
    try{
        let postID = req.params.id;
        const result = await models.post.destroy({
            where: {id: postID}
        })
        if(result) console.log('데이터 삭제 성공');
        res.redirect('/board/notice')
    }catch(e){
        console.error("데이터 삭제 실패" , e)
    }
});



// 댓글 등록
router.post("/reply/:postID", async (req, res) => {
    try{
        let postID = req.params.postID;
        let body = req.body;
        
        const result = await models.reply.create({
            postId: postID,
            writer: body.replyWriter,
            content: body.replyContent
        })
        if(result) console.log('댓글 등록 성공');
        res.redirect('/board');
    }catch(e){
        console.error("댓글 등록 실패" , e)
    }
  });



module.exports = router;