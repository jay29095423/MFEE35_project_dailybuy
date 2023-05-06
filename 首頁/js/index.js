
// 第一部分設定
var card_left = document.querySelector("#part_1_left .info_content");
var card_right = document.querySelector("#part_1_right .info_content");
var left_bear_icon = document.querySelector("#part_1_left .teddy_bear_s");
var right_bear_icon = document.querySelector(
    "#part_1_right .teddy_bear_s"
);
var left_drink_icon = document.querySelector(
    "#part_1_left .part_1_after .drink_s "
);
var right_drink_icon = document.querySelector(
    "#part_1_right .part_1_after .drink_s"
);

var left_gift_icon = document.querySelector(
    "#part_1_left .part_1_after .gift_box_s"
);
var right_gift_icon = document.querySelector(
    "#part_1_right .part_1_after .gift_box_s"
);

card_left.addEventListener("mouseenter", () => {
    left_bear_icon.style.animation = "teddy_bear_s_animation .5s forwards";
    left_drink_icon.style.animation = "drink_s_animation .7s forwards";
    left_gift_icon.style.animation = "gift_box_s_animation .8s forwards";
});
card_left.addEventListener("mouseleave", () => {
    left_bear_icon.style.animation =
        "teddy_bear_s_animation_reverse .5s forwards";
    left_drink_icon.style.animation =
        "drink_s_animation_reverse .7s forwards";
    left_gift_icon.style.animation =
        "gift_box_s_animation_reverse .7s forwards";
});
card_right.addEventListener("mouseenter", () => {
    right_bear_icon.style.animation = "teddy_bear_s_animation .5s forwards";
    right_drink_icon.style.animation = "drink_s_animation .7s forwards";
    right_gift_icon.style.animation = "gift_box_s_animation .8s forwards";
});
card_right.addEventListener("mouseleave", () => {
    right_bear_icon.style.animation =
        "teddy_bear_s_animation_reverse .5s forwards";
    right_drink_icon.style.animation =
        "drink_s_animation_reverse .7s forwards";
    right_gift_icon.style.animation =
        "gift_box_s_animation_reverse .7s forwards";
});

// 第一部分設定

//第二部分設定



let moving;
//  滑鼠點下，開始拖拉
function mouseDown(e) {
    moving = true
}
//  拖拉的移動過程
function drag(e) {
    if (moving === true) {

        // 1. 取得一開始的 viewBox 值，原本是字串，拆成陣列，方便之後運算
        let startViewBox = svg.getAttribute('viewBox').split(' ').map(n => parseFloat(n))
        console.log(svg.getAttribute('viewBox'))
        //  2. 取得滑鼠當前 viewport 中 client 座標值
        let startClient = {
            x: e.clientX,
            y: e.clientY
        }

        //  3. 計算對應回去的 SVG 座標值
        let newSVGPoint = svg.createSVGPoint()
        let CTM = svg.getScreenCTM()
        newSVGPoint.x = startClient.x
        newSVGPoint.y = startClient.y
        let startSVGPoint = newSVGPoint.matrixTransform(CTM.inverse())

        //  4. 計算拖曳後滑鼠所在的 viewport client 座標值
        let moveToClient = {
            x: e.clientX + e.movementX, //  movement 可以取得滑鼠位移量
            y: e.clientY + e.movementY
        }

        //  5. 計算對應回去的 SVG 座標值
        newSVGPoint = svg.createSVGPoint()
        CTM = svg.getScreenCTM()
        newSVGPoint.x = moveToClient.x
        newSVGPoint.y = moveToClient.y
        let moveToSVGPoint = newSVGPoint.matrixTransform(CTM.inverse())

        //  6. 計算位移量
        let delta = {
            dx: startSVGPoint.x - moveToSVGPoint.x,
            dy: startSVGPoint.y - moveToSVGPoint.y
        }

        //  7. 設定新的 viewBox 值
        let moveToViewBox = `${startViewBox[0] + delta.dx} ${startViewBox[1] + delta.dy} ${startViewBox[2]} ${startViewBox[3]}`
        svg.setAttribute('viewBox', moveToViewBox)
        // console.log(moveToViewBox)
    }
}
//  滑鼠點擊結束（拖曳結束）
function mouseUp() {
    moving = false

} //  結束：滑鼠拖拉的效果

//  拖曳的事件
svg.addEventListener('mousedown', mouseDown, false);
svg.addEventListener('mousemove', drag, false);
svg.addEventListener('mouseup', mouseUp, false);

var counties = document.querySelectorAll('.map_county');

//設定顏色
var deep_color = "rgb(17, 50, 133)"; // 選擇到的地區(深色)

var light_color = "rgb(58, 143, 183)";  // hover後的地區(淺色)

var original_color = 'rgb(242, 193, 102)'; // 預設的顏色(橘)

//連結資料庫

var popular_item_warp = document.querySelector('.popular_item_warp');

//設定取得資料時的函式
async function get_order(county) {

    //移除舊資料 
    var popular_item = document.querySelectorAll('.popular_item')

    popular_item.forEach((val, ind) => {

        val.remove();
    })

    //發出sql請求
    await axios.get(`/part2/${county}`).then(
        (data) => {
            data.data.forEach((val, ind) => {
                // console.log(val)
                mylocation.insertAdjacentHTML('afterend', `
    
                    <a id="p2_${val.product_id}" class="popular_item">
                         <div class="item_content">

                          <h3 class="popular_item_title">  ${val.shop_name}-${val.product}</h3>

                          <h4>團購期限:
                         <span>~${val.end_date}</span>

                          </h4>
                         <h4>開團者:
                                <span>${val.nick_name}</span>
                         </h4>
                         <img class="popular_item_img" src=${val.pic_url1+'.jpg'} alt="">
                         <p class="populaar_item_content">
                              ${val.product_intro}</p>
                         </div>
                         <span href="#" class="more_btn">More</span>
                         <div class="popular_item_filter"></div>
                    </a>
    
                        `)
            });



        })

    let p2_item = document.getElementsByClassName('popular_item');

    let p2_item_array = Array.from(p2_item);

    p2_item_array.forEach(ele => {

        ele.onclick = () => {
            var item_id = ele.id.substring(3, 100);

            sessionStorage.setItem('product_id', item_id);  //用sessionStroge方式儲存


            //點選後要連結到的頁面
            // window.location = `/item/${item_id}`;           //用網址方式儲存

        }


    })


};

var coordinate = {
    Keelung: "568 93 15 15",
    Newpei: "540 86 48 48",
    Taipei: "555 93 20 20",
    Taoyuan: "520 100 40 40",
    Hsinchu_city: "505 116 20 20",
    Hsinchu_county: "515 114 40 40",
    Miaoli: "490 128 50 50",
    Taichung: "470 130 100 90",
    Changhua: "453 170 43 43",
    Nantou: "480 170 70 70",
    Yunlin: "442 180 70 70",
    Chiayi_city: "472 222 11 11",
    Chiayi_county: "453 199 55 55",
    Tainan: "445 229 48 48",
    Kaohsiung: "455 235 70 70",
    Pingtung: "463 288 53 53",
    Taitung: "488 245 80 80",
    Hualien: "499 165 90 90",
    Yilan: "546 115 50 50"
}
var Keelung = document.querySelector("#Keelung");
var Taipei = document.querySelector("#Taipei");
var Taiwan = document.querySelector("#svg");
var home_icon = document.querySelector('#home_icon')
var mylocation = document.getElementById('location');

function map_zoomin(cor) {

    svg.setAttribute('viewBox', `${cor}`);

}

home_icon.addEventListener('click', x => map_zoomin("400 86 270 270"))

counties.forEach((ele) => {

    ele.style.fill = original_color;

    ele.onclick = function () {

        counties.forEach(x => { x.style.fill = original_color })  //將其他地區顏色改回原本色

        ele.style.fill = deep_color;

        mylocation.innerHTML = "團購地區 :"

        switch (ele.id) {

            case "Yunlin":

                map_zoomin("442 180 70 70")

                mylocation.innerHTML += " " + "雲林縣";

                get_order("雲林縣");

                break;

            case "Keelung":

                map_zoomin("568 93 15 15");

                mylocation.innerHTML += " " + "基隆市";

                get_order("基隆市");

                break;
            case "Newpei":

                map_zoomin("540 86 48 48");

                mylocation.innerHTML += " " + "新北市"

                get_order("新北市");

                break;
            case "Taipei":

                map_zoomin("555 93 20 20");

                mylocation.innerHTML += " " + "台北市";

                get_order("台北市");

                break;
            case "Taoyuan":

                map_zoomin("520 100 40 40");

                mylocation.innerHTML += " " + "桃園市";

                get_order("桃園市");

                break;
            case "Hsinchu_city":

                map_zoomin("505 116 20 20");

                mylocation.innerHTML += " " + "新竹縣";

                get_order("桃園市");

                break;
            case "Hsinchu_county":

                map_zoomin("515 114 40 40");

                mylocation.innerHTML += " " + "新竹市";
                get_order("新竹市");

                break;
            case "Miaoli":
                map_zoomin("490 128 50 50");

                mylocation.innerHTML += " " + "苗栗縣";
                get_order("苗栗縣");


                break;
            case "Taichung":

                map_zoomin("470 130 100 90");

                mylocation.innerHTML += " " + "台中市";
                get_order("台中市");

                break;
            case "Nantou":

                map_zoomin("480 170 70 70");

                mylocation.innerHTML += " " + "南投縣";
                get_order("南投縣");

                break;
            case "Changhua":

                map_zoomin("453 170 43 43");

                mylocation.innerHTML += " " + "彰化縣";
                get_order("彰化縣");

                break;
            case "Chiayi_county":

                map_zoomin("453 199 55 55");

                mylocation.innerHTML += " " + "嘉義縣";
                get_order("嘉義縣");

                break;
            case "Chiayi_city":

                map_zoomin("472 222 11 11");

                mylocation.innerHTML += " " + "嘉義市";
                get_order("嘉義市");

                break;
            case "Tainan":

                map_zoomin("445 229 48 48");

                mylocation.innerHTML += " " + "台南市";
                get_order("台南市");

                break;
            case "Kaohsiung":

                map_zoomin("455 235 70 70");

                mylocation.innerHTML += " " + "高雄市";
                get_order("高雄市");

                break;
            case "Pingtung":

                map_zoomin("463 288 53 53");

                mylocation.innerHTML += " " + "屏東縣";
                get_order("屏東縣");

                break;
            case "Taitung":

                map_zoomin("488 245 80 80");

                mylocation.innerHTML += " " + "台東縣";
                get_order("台東縣");

                break;
            case "Hualien":

                map_zoomin("499 165 90 90");

                mylocation.innerHTML += " " + "花蓮縣";
                get_order("花蓮縣");

                break;
            case "Yilan":


                map_zoomin("546 115 50 50");

                mylocation.innerHTML += " " + "宜蘭縣";
                get_order("宜蘭縣");
                break;

            default:

                map_zoomin("470 130 100 90");

                mylocation.innerHTML += " " + "台中市";
                get_order("台中市");
                break;
        }


    };

    ele.onmouseover = function () {



        if (ele.style.fill != deep_color) {

            ele.style.fill = light_color

        }

    }

    ele.onmouseleave = function () {

        if (ele.style.fill != deep_color) {

            ele.style.fill = original_color;
        }

    }

})

// 設定載入後的顏色function

function loaded_color(x) {

    x.style.fill = deep_color;

}

window.onload = async function () {
    var lati;
    var long;
    var part_3_group_1 = document.querySelector('.group_1');
    var part_3_group_2 = document.querySelector('.group_2');

    //取得地點 Google API
    navigator.geolocation.getCurrentPosition((loc) => {

        lati = loc.coords.latitude;
        long = loc.coords.longitude;


        var cur_loc = axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lati},${long}&key=AIzaSyDIAGhNuPEMNpdiA8JdZQ32EaI6XNy5Dlg`);

        cur_loc.then((data) => {

            var cur_loc_str = data.data.plus_code.compound_code.substring(11, 14);

            mylocation.innerHTML += " " + cur_loc_str;

            switch (cur_loc_str) {
                case "雲林縣":

                    map_zoomin("442 180 70 70");

                    get_order("雲林縣");

                    loaded_color(Yunlin);

                    break;

                case "基隆市":

                    map_zoomin("568 93 15 15");

                    get_order("基隆市");

                    loaded_color(Keelung);



                    break;
                case "新北市":

                    map_zoomin("540 86 48 48");

                    get_order("新北市");

                    loaded_color(Newpei);

                    break;
                case "台北市":

                    map_zoomin("555 93 20 20");

                    get_order("台北市");

                    loaded_color(Taipei);

                    break;
                case "桃園市":

                    map_zoomin("520 100 40 40");

                    get_order("桃園市");

                    loaded_color(Taoyuan);

                    break;
                case "新竹縣":

                    map_zoomin("515 114 40 40");

                    get_order("新竹縣");

                    loaded_color(Hsinchu_county);

                    break;
                case "新竹市":

                    map_zoomin("505 116 20 20");

                    get_order("新竹市");

                    loaded_color(Hsinchu_city);

                    break;
                case "苗栗縣":
                    map_zoomin("490 128 50 50");

                    get_order("苗栗縣");


                    loaded_color(Miaoli);


                    break;
                case "台中市":

                    map_zoomin("470 130 100 90");

                    get_order("台中市");

                    loaded_color(Taichung);

                    break;
                case "南投縣":

                    map_zoomin("480 170 70 70");

                    get_order("南投縣");

                    loaded_color(Nantou);

                    break;
                case "彰化縣":

                    map_zoomin("453 170 43 43");

                    get_order("彰化縣");

                    loaded_color(Changhua);

                    break;
                case "嘉義縣":

                    map_zoomin("453 199 55 55");

                    get_order("嘉義縣");

                    loaded_color(Chiayi_county);

                    break;
                case "嘉義市":

                    map_zoomin("472 222 11 11");

                    get_order("嘉義市");

                    loaded_color(Chiayi_city);

                    break;
                case "台南市":

                    map_zoomin("445 229 48 48");

                    get_order("台南市");

                    loaded_color(Tainan);

                    break;
                case "高雄市":

                    map_zoomin("455 235 70 70");

                    get_order("高雄市");

                    loaded_color(Kaohsiung);

                    break;
                case "屏東縣":

                    map_zoomin("463 288 53 53");

                    get_order("屏東縣");

                    loaded_color(Pingtung);

                    break;
                case "台東縣":

                    map_zoomin("488 245 80 80");

                    get_order("台東縣");

                    loaded_color(Taitung);

                    break;
                case "花蓮縣":

                    map_zoomin("499 165 90 90");

                    get_order("花蓮縣");

                    loaded_color(Hualien);

                    break;
                case "宜蘭縣":

                    map_zoomin("546 115 50 50");

                    get_order("Yilan");

                    loaded_color(Yunlin);
                    break;

                default:

                    map_zoomin("470 130 100 90");

                    get_order("台中市");

                    loaded_color(Taichung);
                    break;
            }


        })

    })



    //第三部分

    //group_1

    var p3_g1_result = await axios.get(`/part3/group1`)

    // console.log(p3_g1_result)

    part_3_group_1.innerHTML = '';

    await p3_g1_result.data.forEach(element => {

        part_3_group_1.innerHTML += `<a class="part_3_item" id="p3_g1_${element.product_id}">
                        <h3 class="part_3_item_title">${element.shop_name}<br>${element.product}</h3>
                        <h4 class="part_3_date">團購期限:<br>${element.end_date}</h4>
                        <img class="p3_item_img" src=${element.pic_url1+'.jpg'} alt="">
                        <p class="part_3_item_content">${element.product_intro}
                        </p>
                        <span class="part_3_more">+More&nbsp;&nbsp;<i class="fa-solid fa-arrow-right-long"></i></span>
                        </a>`;

    });
    //group_1
    //group_2


    var p3_g2_result = await axios.get(`/part3/group2`);
    part_3_group_2.innerHTML = '';
    await p3_g2_result.data.forEach(element => {

        part_3_group_2.innerHTML += `<a class="part_3_item" id="p3_g2_${element.product_id}">
                        <h3 class="part_3_item_title">${element.shop_name}<br>${element.product}</h3>
                        <h4 class="part_3_date">團購期限:<br>${element.end_date}</h4>
                        <img class="p3_item_img" src=${element.pic_url1+'.jpg'} alt="">
                        <p class="part_3_item_content">${element.product_intro}
                        </p>
                        <span class="part_3_more">+More&nbsp;&nbsp;<i class="fa-solid fa-arrow-right-long"></i></span>
                        </a>`;

    });


    //group_2

    let p3_item = document.getElementsByClassName('part_3_item');

    let p3_item_array = Array.from(p3_item);

    p3_item_array.forEach(ele => {

        ele.onclick = () => {
            var item_id = ele.id.substring(6, 100);
            sessionStorage.setItem('product_id', item_id);

            // window.location = `/item/${item_id}`;

        }


    })










    //第三部分



};




