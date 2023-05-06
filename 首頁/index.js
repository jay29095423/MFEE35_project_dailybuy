var express = require('express');

var app = express();

var mysql = require('mysql');

var cors = require('cors');


//--------------------------測試

var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());


// session設定
var session = require('express-session');
app.use(session({
    secret: 'lincodadlovewinnie',
    resave: true,
    saveUninitialized: true,

    cookie: {
        path: '/',
        httpOnly: true,
        secure: false,
        maxAge: 60 * 60 * 1000 // 記憶時間
    }
}));


// 註冊頁面請求
app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/register.html');
})

// 登入頁面請求
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/login.html');
    // if (req.session.user) {
    //     res.redirect('/member');
    // } else {
    //     res.sendFile(__dirname + '/login.html');
    // }
})

// 會員中心頁面請求
app.get('/member', (req, res) => {
    // res.sendFile(__dirname + '/member.html');
    if (req.session.user) {
        res.sendFile(__dirname + '/member.html');
        console.log("member請求:" + req.session.user.id)
    } else {
        res.redirect('/login');
    }
})

// 忘記密碼頁面請求
app.get('/resetPWD', (req, res) => {
    res.sendFile(__dirname + '/resetPWD.html');
})

// 註冊頁面:接收註冊頁面帳號密碼insert到資料庫
app.post('/register', (req, res) => {
    var sql = "INSERT INTO user_data (email,password)VALUES(?,?);";
    connhelper.query(sql, [req.body.email, req.body.password], (err, results, fields) => {
        console.log(results);
        console.log(err);
        res.json({ redirectUrl: '/login' });
    })
    // console.log("email"+req.body.email)
    // console.log("password"+req.body.password)
})

// 2023/05/05 google登入-----------------
app.post('/google_login', (req, res) => {

    let google_email = req.body.email;
    let google_user_name = req.body.name;
    let google_pic = req.body.picture;
    // console.log(email)
    // console.log(user_name)
    let sql = "SELECT * FROM user_data WHERE email=? and user_name=?;";
    connhelper.query(sql, [google_email, google_user_name], (err, results, fields) => {
        if (!err) {
            if (results[0]) {   //登入成功後設定session
                req.session.user = {
                    id: results[0].user_id,
                    email: results[0].email,
                    user_name: results[0].user_name,
                    pic: google_pic
                };
               
                res.json({ redirectUrl: '/member' });
            } else {
                let sql = 'INSERT INTO user_data (email,user_name,password)VALUES(?,?,"gojsgjsi#lvs4@%%lkhrlgi");' //若沒有註冊過則自動新增會員資料進資料庫(沒有id)
                connhelper.query(sql, [google_email, google_user_name], (err, results, field) => {
                    if (!err) {
                        let select_id = 'SELECT user_id FROM user_data WHERE email =?;';                           //把上一步驟新增的資料重新取得其id
                        connhelper.query(select_id, [google_email], (err1, results1, field1) => {
                            req.session.user = {
                                id: results1[0].user_id,
                                email: google_email,
                                user_name: google_user_name,
                                pic: google_pic
                            };
                        });
                    }
                })
            }
        } else {
            res.send(err.sqlMessage)
        }
    })
})

// 2023/05/05 google登入-----------------

// 登入頁面:從資料庫select出來給前端比對
app.post('/login', (req, res) => {
    var email = req.body.email;
    var password = req.body.password;
    console.log(email);
    console.log(password);
    var sql = "SELECT * FROM user_data WHERE email=? and password=?;";
    connhelper.query(sql, [email, password], (err, results, fields) => {
        console.log(results);
        if (results.length > 0) {
            let isMatched = false;

            results.forEach(user => {
                console.log(user.email);
                console.log(user.password);
                if ((user.email === email) && (user.password === password)) {
                    isMatched = true;
                    req.session.user = {
                        id: user.user_id,
                        email: user.email,
                        user_name: user.user_name
                    }
                    console.log('登入成功')
                    console.log(req.session.user)
                };
            });
            if (isMatched) {
                res.json({ redirectUrl: '/member' });
            }
        }

    });
})

// 忘記密碼頁面:前端送帳號過來比對資料庫的帳號
app.post('/resetPWD', (req, res) => {
    var email = req.body.email;
    console.log(email);
    var sql = "SELECT * FROM user_data WHERE email=?;";
    var sqlReset = "UPDATE user_data SET password='0000' WHERE email=?;"
    connhelper.query(sql, email, (err, results, fields) => {
        if (results) {
            connhelper.query(sqlReset, email, (err, setDefaultPWD) => {
                res.json({ redirectUrl: '/login' });
            })
        } else {
            alert("此帳號不存在");
        }
    })

})

// 登出
app.post('/logout', (req, res) => {
    // console.log(req.session)
    req.session.destroy();
    res.json({ redirectUrl: '/login' });

})

// 會員中心:基本資料
app.post('/member/info', (req, res) => {

    // console.log("info:"+req.session.user.id)
    var sql = "SELECT user_id , email, user_name , nick_name , DATE_FORMAT(birthday, '%Y-%m-%d') AS birthday , phone , address , user_intro , selfie FROM `user_data` WHERE user_id=?;"
    connhelper.query(sql, req.session.user.id, (err, results, fields) => {
        var server_to_client=[results,{pic:req.session.user.pic}]
        console.log(server_to_client)
        res.json(server_to_client);
    })
})

// 會員中心:更新基本資料
// 檔案上傳路徑和檔名
// 使用multer套件
const multer = require('multer');
const path = require('path');
var headStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/media/member')
    },
    filename: function (req, file, cb) {
        cb(null, `selfie${req.session.user.id}${path.extname(file.originalname)}`)
    }
})
var upload = multer({ storage: headStorage })
app.post('/upload/update_info',
    upload.fields([
        { name: "user_name" },
        { name: "nick_name" },
        { name: "password" },
        { name: "birthday" },
        { name: "phone" },
        { name: "address" },
        { name: "user_intro" },
        { name: "selfie" },
    ])
    , (req, res) => {
        var sql = "UPDATE user_data SET user_name = ?, nick_name = ?, password = ?, birthday = ?, phone = ?, address = ?, user_intro = ?,selfie=? WHERE user_id = ?;";
        var selfie = `media/member/selfie${req.session.user.id}.jpg`; //副檔名寫死的
        connhelper.query(sql, [req.body.user_name, req.body.nick_name, req.body.password, req.body.birthday, req.body.phone, req.body.address, req.body.user_intro, selfie, req.session.user.id], (err, results, fields) => {
            if (err) {
                console.error(err);

            } else {
                console.log("done")
            }


        })
    }
)

// 會員中心:跟團者介面
app.post('/member/follower', (req, res) => {
    // console.log("follower:"+req.session.user.id)
    var sql = "SELECT `order_data`.`user_id`,`order_data`.`product_id`,shop_name,product,DATE_FORMAT(end_date, '%Y-%m-%d') AS end_date FROM `order_data` JOIN `product_data` ON `order_data`.`product_id` = `product_data`.`product_id` WHERE `order_data`.`user_id` = ?;"
    connhelper.query(sql, req.session.user.id, (err, results, fields) => {
        console.log(results);
        res.json(results);
    })
})

// 會員中心:跟團者訂單對話框
app.post('/member/follower/modal', (req, res) => {
    // console.log("follower:"+req.session.user.id);
    // console.log("follower:"+req.body.product_id);
    var sql = ""
})

// 會員中心:開團者介面
app.post('/member/leader', (req, res) => {
    var sql = "SELECT product_id,shop_name,product,DATE_FORMAT(end_date, '%Y-%m-%d') AS end_date FROM `product_data` WHERE user_id = ?;"
    connhelper.query(sql, req.session.user.id, (err, results, fields) => {
        console.log(results);
        res.json(results);
    })
})

//--------------------------測試

//設定客戶端連結伺服器端授權


let cors_opt = {
    origin: ['http://localhost:5500', 'http://127.0.0.1:5500', 'http://localhost:8000', 'http://127.0.0.1:8000']
};

app.use(cors(cors_opt));

//-----------------------

//設定公開資料夾

app.use(express.static(__dirname + '/public'));

//-----------------------

//設定sql連線狀態


var connhelper = mysql.createConnection({
    host: 'localhost',
    port: '8889',
    user: 'root',
    password: 'root',
    database: 'buybuy_database'

});

connhelper.connect((err) => {

    if (!err) {

        console.log('資料庫連線成功')

    } else {

        console.log('資料庫連線失敗' + err.sqlMessage ? err.sqlMessage : err);
    }

})


//-----------------------
//首頁

app.get('/', (req, res) => {

    res.sendFile(__dirname + "/index.html");

});

//首頁第二部分(地圖)

app.get('/part2/:county', (req, res) => {
    var sql = "SELECT UD.nick_name	,pd.product_id,pd.shop_name, pd.product, DATE_FORMAT(pd.end_date, '%Y/%m/%d') AS end_date, pd.product_intro,pd.pic_url1, pd.user_id FROM product_data AS pd INNER JOIN user_data AS ud ON pd.user_id = ud.user_id WHERE PD.country = ?";
    connhelper.query(sql, req.params.county, (err, results, fields) => {
        res.json(results);

    })
});

//首頁第三部分

app.get('/part3/group1', (req, res) => {
    var sql = "SELECT UD.nick_name,pd.product_id,pd.shop_name, pd.product, DATE_FORMAT(pd.end_date, '%Y/%m/%d') AS end_date, pd.product_intro,pd.pic_url1, pd.user_id  FROM product_data AS pd  INNER JOIN user_data AS ud ON pd.user_id = ud.user_id ORDER BY pd.end_date ASC; ";
    connhelper.query(sql, (err, results, fields) => {
        res.json(results);
    })
});

app.get('/part3/group2', (req, res) => {

    var sql = "SELECT UD.nick_name,pd.product_id,pd.shop_name, pd.product, DATE_FORMAT(pd.end_date, '%Y/%m/%d') AS end_date, pd.product_intro,pd.pic_url1, pd.user_id  FROM product_data AS pd  INNER JOIN user_data AS ud ON pd.user_id = ud.user_id ORDER BY pd.end_date DESC; ";
    connhelper.query(sql, (err, results, fields) => {

        res.json(results);

    })

});




app.listen(3000, () => {

    console.log('伺服器執行中');

});